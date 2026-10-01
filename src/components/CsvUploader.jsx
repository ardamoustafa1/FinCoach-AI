import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertTriangle, Loader2, Eye, ChevronDown, Download, Sparkles } from 'lucide-react';
import { fmt } from '../utils/categories';
import { parseCSV } from '../utils/csvParser';
import { authFetch } from '../utils/api';

// ─── Durum sabitleri ─────────────────────────────────────────
const DURUM = {
  BOSTA: 'bosta',
  YUKLENIYOR: 'yukleniyor',
  ONIZLEME: 'onizleme',
  HATA: 'hata',
};

export default function CsvUploader({ onImport, onKapat }) {
  const [durum, setDurum] = useState(DURUM.BOSTA);
  const [suruklemede, setSuruklemede] = useState(false);
  const [hata, setHata] = useState('');
  const [sonuc, setSonuc] = useState(null);
  const [dosyaAdi, setDosyaAdi] = useState('');
  
  // AI Kategorizasyon State'leri
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiTotal, setAiTotal] = useState(0);
  const [aiSummary, setAiSummary] = useState(null); // { basarili, basarisiz }

  const fileRef = useRef(null);

  // ─── Dosya İşleme ──────────────────────────────────────────
  const dosyaIsle = useCallback(async (file) => {
    if (!file) return;
    setDosyaAdi(file.name);
    setDurum(DURUM.YUKLENIYOR);
    setHata('');

    try {
      const result = await parseCSV(file);
      setSonuc(result);
      setDurum(DURUM.ONIZLEME);
    } catch (err) {
      setHata(err.message || 'Bilinmeyen bir hata oluştu.');
      setDurum(DURUM.HATA);
    }
  }, []);

  // ─── Sürükle & Bırak ──────────────────────────────────────
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setSuruklemede(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setSuruklemede(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setSuruklemede(false);
    const file = e.dataTransfer.files?.[0];
    dosyaIsle(file);
  }, [dosyaIsle]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    dosyaIsle(file);
  }, [dosyaIsle]);

  // ─── AI Kategorizasyon ──────────────────────────────────────
  const handleAiCategorize = async () => {
    if (!sonuc || !sonuc.islemler) return;

    setIsAiProcessing(true);
    setAiSummary(null);

    // Kategoriye ihtiyacı olan işlemleri bul (Diğer olanlar veya boş olanlar)
    const uncategorized = (sonuc.islemler || []).filter(tx => tx && (!tx.kategori || tx.kategori === 'Diğer'));
    setAiTotal(uncategorized.length);
    setAiProgress(0);

    if (uncategorized.length === 0) {
      setAiSummary({ basarili: 0, basarisiz: 0 });
      setIsAiProcessing(false);
      return;
    }

    let islenenIslemler = [...(sonuc.islemler || [])].filter(Boolean);
    let basariliCount = 0;
    let basarisizCount = 0;

    // 50'şerli batch'ler halinde gönder
    const BATCH_SIZE = 50;
    for (let i = 0; i < uncategorized.length; i += BATCH_SIZE) {
      const batch = uncategorized.slice(i, i + BATCH_SIZE);
      const requestData = batch.map(t => ({ id: t.id, aciklama: t.aciklama, magaza: t.magaza }));

      try {
        const res = await authFetch('/api/categorize', {
          method: 'POST',
          body: JSON.stringify({ transactions: requestData })
        });

        if (!res.ok) throw new Error('API hatası');
        const data = await res.json();

        // Gelen JSON sonucunu islemlere uygula
        if (Array.isArray(data)) {
          islenenIslemler = islenenIslemler.map(tx => {
            const aiCevap = data.find(d => d && d.id === tx.id);
            if (aiCevap && aiCevap.kategori) {
              basariliCount++;
              return { ...tx, kategori: aiCevap.kategori };
            }
            return tx;
          });
        }
      } catch (err) {
        console.error('Batch kategorizasyon hatası:', err);
        basarisizCount += batch.length;
      }

      setAiProgress(Math.min(i + BATCH_SIZE, uncategorized.length));
    }

    // Sonucu güncelle
    setSonuc({ ...sonuc, islemler: islenenIslemler });
    setAiSummary({ basarili: basariliCount, basarisiz: basarisizCount });
    setIsAiProcessing(false);
  };

  // ─── Import Onayı ──────────────────────────────────────────
  const handleImport = useCallback(() => {
    if (sonuc?.islemler) {
      onImport(sonuc.islemler);
    }
  }, [sonuc, onImport]);

  // ─── Sıfırla ───────────────────────────────────────────────
  const sifirla = useCallback(() => {
    setDurum(DURUM.BOSTA);
    setSonuc(null);
    setHata('');
    setDosyaAdi('');
    setIsAiProcessing(false);
    setAiSummary(null);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up border border-primary-500/20">
      {/* Başlık Barı */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-primary-500/10 via-purple-500/5 to-pink-500/10 border-b border-surface-200 dark:border-surface-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center">
            <Upload className="w-4 h-4 text-primary-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-900 dark:text-white">CSV / Banka Ekstresi Yükle</h3>
            <p className="text-[11px] text-surface-700 dark:text-surface-200">Garanti, İş Bankası, Yapı Kredi, Akbank, Enpara, Ziraat ve genel CSV desteklenir</p>
          </div>
        </div>
        <button
          aria-label="CSV yükleyiciyi kapat"
          onClick={onKapat}
          className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5">
        {/* ── BOŞTA: Sürükle-bırak alanı ── */}
        {durum === DURUM.BOSTA && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center gap-3 py-10 px-6
              border-2 border-dashed rounded-2xl cursor-pointer
              transition-all duration-300 group
              ${suruklemede
                ? 'border-primary-500 bg-primary-500/10 scale-[1.01]'
                : 'border-surface-300 dark:border-surface-600 hover:border-primary-400 hover:bg-primary-500/5'
              }
            `}
          >
            {/* Parlayan arka plan efekti */}
            <div className={`
              absolute inset-0 rounded-2xl transition-opacity duration-500
              bg-gradient-to-br from-primary-500/5 via-transparent to-purple-500/5
              ${suruklemede ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `} />

            <div className={`
              relative w-14 h-14 rounded-2xl flex items-center justify-center
              transition-all duration-300
              ${suruklemede
                ? 'bg-primary-500 shadow-lg shadow-primary-500/30 scale-110'
                : 'bg-surface-100 dark:bg-surface-800 group-hover:bg-primary-500/15'
              }
            `}>
              <Upload className={`w-6 h-6 transition-colors ${suruklemede ? 'text-white' : 'text-surface-700 dark:text-surface-200 group-hover:text-primary-500'}`} />
            </div>

            <div className="relative text-center">
              <p className="text-sm font-semibold text-surface-900 dark:text-white">
                CSV dosyanı buraya sürükle veya{' '}
                <span className="text-primary-500 underline underline-offset-2">tıkla</span>
              </p>
              <p className="text-xs text-surface-700 dark:text-surface-200 mt-1">
                .csv, .txt dosyaları desteklenir · Maks. 10MB
              </p>
            </div>

            {/* Demo dosya bağlantısı */}
            <a
              href="/demo-ekstre.csv"
              download="demo-ekstre.csv"
              onClick={(e) => e.stopPropagation()}
              className="relative inline-flex items-center gap-1.5 mt-1 text-xs text-primary-500 hover:text-primary-400 font-medium transition-colors"
            >
              <Download className="w-3 h-3" />
              Örnek Garanti ekstresi indir
            </a>

            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt,.tsv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* ── YÜKLENIYOR ── */}
        {durum === DURUM.YUKLENIYOR && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-primary-500/15 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-primary-500/10 animate-ping" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-surface-900 dark:text-white">Dosya okunuyor...</p>
              <p className="text-xs text-surface-700 dark:text-surface-200 mt-0.5">{dosyaAdi}</p>
            </div>
          </div>
        )}

        {/* ── HATA ── */}
        {durum === DURUM.HATA && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-14 h-14 rounded-2xl bg-danger-500/15 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-danger-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-danger-500">{hata}</p>
              <p className="text-xs text-surface-700 dark:text-surface-200 mt-1">{dosyaAdi}</p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={sifirla}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors cursor-pointer"
              >
                Farklı Dosya Dene
              </button>
              <button
                onClick={onKapat}
                className="px-4 py-2 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-200 hover:text-danger-500 transition-colors cursor-pointer"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* ── ÖNİZLEME ── */}
        {durum === DURUM.ONIZLEME && sonuc && (
          <div className="space-y-4">
            {/* Özet Kartları */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <OzetKart
                label="Format"
                deger={sonuc.format}
                ikon={<FileText className="w-4 h-4" />}
                renk="primary"
              />
              <OzetKart
                label="Toplam Satır"
                deger={sonuc.toplamSatir}
                ikon={<Eye className="w-4 h-4" />}
                renk="accent"
              />
              <OzetKart
                label={sonuc.olasiTekrar > 0 ? 'Tekrar Uyarısı' : 'Başarılı'}
                deger={sonuc.basarili}
                ikon={<CheckCircle className="w-4 h-4" />}
                renk={sonuc.olasiTekrar > 0 ? 'warning' : 'accent'}
              />
              <OzetKart
                label="Dosya"
                deger={dosyaAdi.length > 18 ? dosyaAdi.slice(0, 15) + '...' : dosyaAdi}
                ikon={<FileText className="w-4 h-4" />}
                renk="purple"
              />
            </div>

            {sonuc.olasiTekrar > 0 && (
              <div className="rounded-xl border border-warning-500/25 bg-warning-500/10 px-4 py-3 text-xs text-warning-300">
                {sonuc.olasiTekrar} satır dosya içinde olası tekrar gibi görünüyor. İçe aktarırken mevcut kayıtlarla da karşılaştırılıp kopyalar atlanacak.
              </div>
            )}

            {/* Önizleme Tablosu */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Eye className="w-3.5 h-3.5 text-surface-700 dark:text-surface-200" />
                <span className="text-xs font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wide">
                  Önizleme (İlk 5 satır)
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-surface-200 dark:border-surface-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-50/80 dark:bg-surface-800/80 border-b border-surface-200 dark:border-surface-700">
                      {sonuc.headers.slice(0, 6).map((h, i) => (
                        <th key={i} className="px-3 py-2 text-left text-[11px] font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                    {sonuc.onizleme.map((row, i) => (
                      <tr key={i} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors">
                        {sonuc.headers.slice(0, 6).map((h, j) => (
                          <td key={j} className="px-3 py-2 text-xs text-surface-700 dark:text-surface-200 whitespace-nowrap max-w-[180px] truncate">
                            {row[h] || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* İşlenmiş veri önizlemesi */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-3.5 h-3.5 text-accent-500" />
                  <span className="text-xs font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wide">
                    İşlenmiş Veriler (İlk 5)
                  </span>
                </div>
                {/* AI Kategori Butonu */}
                {!isAiProcessing && !aiSummary && (
                  <button 
                    onClick={handleAiCategorize}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI ile Kategorize Et
                  </button>
                )}
              </div>

              {/* Progress UI */}
              {isAiProcessing && (
                <div className="mb-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2 text-sm text-purple-700 dark:text-purple-300 font-medium">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Yapay zeka işlemleri kategorize ediyor...
                    </span>
                    <span>{aiProgress} / {aiTotal}</span>
                  </div>
                  <div className="w-full bg-purple-500/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-primary-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(aiProgress / aiTotal) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Summary UI */}
              {aiSummary && (
                <div className="mb-4 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/50 flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-surface-700 dark:text-surface-200 flex-1">
                    <strong className="text-surface-900 dark:text-white">{aiTotal}</strong> işlemden{' '}
                    <strong className="text-emerald-500">{aiSummary.basarili}</strong>'si otomatik kategorize edildi.{' '}
                    {aiSummary.basarisiz > 0 && <span className="text-warn-500">{aiSummary.basarisiz} işlem "Diğer" olarak bırakıldı.</span>}
                  </p>
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-surface-200 dark:border-surface-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-50/80 dark:bg-surface-800/80 border-b border-surface-200 dark:border-surface-700">
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-surface-700 dark:text-surface-200 uppercase">Tarih</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-surface-700 dark:text-surface-200 uppercase">Açıklama</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-surface-700 dark:text-surface-200 uppercase">Kategori</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-surface-700 dark:text-surface-200 uppercase">Tür</th>
                      <th className="px-3 py-2 text-right text-[11px] font-semibold text-surface-700 dark:text-surface-200 uppercase">Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                    {sonuc.islemler.slice(0, 5).map((tx, i) => (
                      <tr key={i} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors">
                        <td className="px-3 py-2 text-xs text-surface-700 dark:text-surface-200 whitespace-nowrap">{tx.tarih}</td>
                        <td className="px-3 py-2 text-xs text-surface-900 dark:text-white font-medium max-w-[200px] truncate">{tx.aciklama}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            tx.kategori !== 'Diğer' && tx.kategori !== undefined
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                              : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-200'
                          }`}>
                            {tx.kategori}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tx.tur === 'gelir'
                              ? 'bg-accent-500/15 text-accent-500'
                              : 'bg-danger-500/15 text-danger-500'
                          }`}>
                            {tx.tur === 'gelir' ? 'GELİR' : 'GİDER'}
                          </span>
                        </td>
                        <td className={`px-3 py-2 text-xs text-right font-bold whitespace-nowrap ${
                          tx.tur === 'gelir' ? 'text-accent-500' : 'text-danger-500'
                        }`}>
                          {tx.tur === 'gelir' ? '+' : '-'}{fmt(tx.tutar)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={sifirla}
                disabled={isAiProcessing}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleImport}
                disabled={isAiProcessing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-primary-500 to-purple-500 text-white hover:from-primary-600 hover:to-purple-600 shadow-lg shadow-primary-500/25 transition-all cursor-pointer hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                <CheckCircle className="w-4 h-4" />
                Listeye Ekle
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-md text-[11px]">
                  {sonuc.basarili}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Özet Kartı ──────────────────────────────────────────────
function OzetKart({ label, deger, ikon, renk }) {
  const renkler = {
    primary: 'bg-primary-500/10 text-primary-500',
    accent: 'bg-accent-500/10 text-accent-500',
    purple: 'bg-purple-500/10 text-purple-500',
    danger: 'bg-danger-500/10 text-danger-500',
    warning: 'bg-warning-500/10 text-warning-500',
  };

  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/30">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${renkler[renk]}`}>
        {ikon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-surface-700 dark:text-surface-200 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-bold text-surface-900 dark:text-white truncate">{deger}</p>
      </div>
    </div>
  );
}
