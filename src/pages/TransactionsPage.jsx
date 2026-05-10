import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  LayoutList, LayoutGrid, Search, SlidersHorizontal,
  ChevronUp, ChevronDown, ChevronsUpDown, X,
  Pencil, Trash2, ChevronLeft, ChevronRight, Check, Plus, AlertTriangle,
} from 'lucide-react';
import { katRenk, TUM_KATEGORILER, fmt } from '../utils/categories';
import { saveTransaction, removeTransaction } from '../utils/storage';
import TransactionModal from '../components/TransactionModal';

const SAYFA_BOYUTU = 20;

// ─── localStorage okuma ───────────────────────────────────────
function yukleIslemler() {
  try {
    const tx = JSON.parse(localStorage.getItem('butceai_transactions') || '[]');
    const gl = JSON.parse(localStorage.getItem('butceai_gelir') || '[]');
    return [
      ...tx.map(i => ({ ...i, tur: 'gider' })),
      ...gl.map(i => ({ ...i, tur: 'gelir' })),
    ].sort((a, b) => (b.tarih || '').localeCompare(a.tarih || ''));
  } catch { return []; }
}

// ─── Küçük bileşenler ─────────────────────────────────────────
function SortIcon({ kolon, aktif, yon }) {
  if (aktif !== kolon) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-30" />;
  return yon === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-primary-400" />
    : <ChevronDown className="w-3.5 h-3.5 text-primary-400" />;
}

function KatBadge({ kategori }) {
  const s = katRenk(kategori);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
      {kategori || '—'}
    </span>
  );
}

function FiltreBadge({ etiket, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold border border-primary-500/20">
      {etiket}
      <button onClick={onRemove} className="hover:text-danger-500 transition-colors cursor-pointer ml-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function KatDropdown({ secili, onChange }) {
  const [acik, setAcik] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setAcik(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const toggle = (kat) => onChange(secili.includes(kat) ? secili.filter(k => k !== kat) : [...secili, kat]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setAcik(!acik)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-700 dark:text-surface-200 hover:border-primary-500 transition-colors cursor-pointer">
        <SlidersHorizontal className="w-4 h-4" />
        Kategori {secili.length > 0 && <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{secili.length}</span>}
        <ChevronDown className="w-3.5 h-3.5 opacity-50" />
      </button>
      {acik && (
        <div className="absolute top-full mt-1 left-0 z-50 w-52 bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl overflow-hidden">
          {TUM_KATEGORILER.map(kat => (
            <button key={kat} onClick={() => toggle(kat)}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors text-sm text-left cursor-pointer">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${secili.includes(kat) ? 'bg-primary-500 border-primary-500' : 'border-surface-300 dark:border-surface-600'}`}>
                {secili.includes(kat) && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <KatBadge kategori={kat} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TabloBaşlık({ label, kolon, aktif, yon, onSort }) {
  return (
    <th className="text-left px-4 py-3 text-xs font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wide">
      <button onClick={() => onSort(kolon)} className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
        {label} <SortIcon kolon={kolon} aktif={aktif} yon={yon} />
      </button>
    </th>
  );
}

// ─── Silme Onay Diyaloğu ──────────────────────────────────────
function SilOnay({ islem, onOnayla, onIptal }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onIptal()}>
      <div className="w-full max-w-sm bg-white dark:bg-surface-850 rounded-2xl shadow-2xl p-6 animate-fade-in-up border border-surface-200 dark:border-surface-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-danger-500/15 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-danger-500" />
          </div>
          <h3 className="text-base font-bold text-surface-900 dark:text-white">İşlemi Sil</h3>
        </div>
        <p className="text-sm text-surface-700 dark:text-surface-200 mb-2">
          Bu işlemi silmek istediğine emin misin?
        </p>
        <div className="text-sm rounded-xl bg-surface-50 dark:bg-surface-800 px-3 py-2.5 mb-5 flex justify-between">
          <span className="font-medium text-surface-900 dark:text-white">{islem.magaza || islem.aciklama}</span>
          <span className="font-bold text-danger-500">-{fmt(islem.tutar)}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={onIptal}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors cursor-pointer">
            İptal
          </button>
          <button onClick={onOnayla}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-danger-500 text-white hover:bg-danger-600 shadow-lg shadow-danger-500/25 transition-colors cursor-pointer">
            Evet, Sil
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ana Sayfa ───────────────────────────────────────────────
export default function TransactionsPage() {
  const [ham, setHam] = useState(() => yukleIslemler());
  const [gorunum, setGorunum] = useState('tablo');
  const [sayfa, setSayfa] = useState(1);
  const [sortKolon, setSortKolon] = useState('tarih');
  const [sortYon, setSortYon] = useState('desc');

  // Modal/Dialog state
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState(null); // null = yeni, obje = düzenle
  const [silinecek, setSilinecek] = useState(null);

  // Filtreler
  const [aramaHam, setAramaHam] = useState('');
  const [arama, setArama] = useState('');
  const [seciliKatlar, setSeciliKatlar] = useState([]);
  const [tarihBas, setTarihBas] = useState('');
  const [tarihBit, setTarihBit] = useState('');
  const [minTutar, setMinTutar] = useState('');
  const [maxTutar, setMaxTutar] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setArama(aramaHam), 300);
    return () => clearTimeout(t);
  }, [aramaHam]);

  useEffect(() => { setSayfa(1); }, [arama, seciliKatlar, tarihBas, tarihBit, minTutar, maxTutar]);

  const handleSort = useCallback((kolon) => {
    if (sortKolon === kolon) setSortYon(y => y === 'asc' ? 'desc' : 'asc');
    else { setSortKolon(kolon); setSortYon('desc'); }
    setSayfa(1);
  }, [sortKolon]);

  // ─── CRUD işlemleri ────────────────────────────────────────
  const handleKaydet = (form) => {
    const kaydedilen = saveTransaction({ ...form });
    setHam(yukleIslemler());
    setModalAcik(false);
    setDuzenlenen(null);
  };

  const handleSil = () => {
    if (!silinecek) return;
    removeTransaction(silinecek.id);
    setHam(yukleIslemler());
    setSilinecek(null);
  };

  const handleDuzenle = (tx) => {
    setDuzenlenen(tx);
    setModalAcik(true);
  };

  // ─── Filtreleme + Sıralama ──────────────────────────────────
  const filtrelenmis = useMemo(() => {
    let liste = ham;
    if (arama) liste = liste.filter(i => (i.magaza || i.aciklama || '').toLowerCase().includes(arama.toLowerCase()));
    if (seciliKatlar.length) liste = liste.filter(i => seciliKatlar.includes(i.kategori));
    if (tarihBas) liste = liste.filter(i => i.tarih >= tarihBas);
    if (tarihBit) liste = liste.filter(i => i.tarih <= tarihBit);
    if (minTutar) liste = liste.filter(i => i.tutar >= Number(minTutar));
    if (maxTutar) liste = liste.filter(i => i.tutar <= Number(maxTutar));
    return [...liste].sort((a, b) => {
      let va = a[sortKolon], vb = b[sortKolon];
      if (sortKolon === 'tutar') { va = Number(va); vb = Number(vb); }
      if (va < vb) return sortYon === 'asc' ? -1 : 1;
      if (va > vb) return sortYon === 'asc' ? 1 : -1;
      return 0;
    });
  }, [ham, arama, seciliKatlar, tarihBas, tarihBit, minTutar, maxTutar, sortKolon, sortYon]);

  const toplamSayfa = Math.max(1, Math.ceil(filtrelenmis.length / SAYFA_BOYUTU));
  const sayfadakiler = filtrelenmis.slice((sayfa - 1) * SAYFA_BOYUTU, sayfa * SAYFA_BOYUTU);

  const aktifFiltreler = [
    arama && { etiket: `Arama: "${arama}"`, temizle: () => { setArama(''); setAramaHam(''); } },
    ...seciliKatlar.map(k => ({ etiket: k, temizle: () => setSeciliKatlar(s => s.filter(x => x !== k)) })),
    tarihBas && { etiket: `Başlangıç: ${tarihBas}`, temizle: () => setTarihBas('') },
    tarihBit && { etiket: `Bitiş: ${tarihBit}`, temizle: () => setTarihBit('') },
    minTutar && { etiket: `Min: ${fmt(minTutar)}`, temizle: () => setMinTutar('') },
    maxTutar && { etiket: `Max: ${fmt(maxTutar)}`, temizle: () => setMaxTutar('') },
  ].filter(Boolean);

  const tumunuTemizle = () => {
    setAramaHam(''); setArama('');
    setSeciliKatlar([]); setTarihBas(''); setTarihBit('');
    setMinTutar(''); setMaxTutar('');
  };

  const inputCls = "px-3 py-2 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-700 dark:placeholder-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all";

  // Aksiyon butonları (tablo + kart için ortak)
  const AksiyonButonlari = ({ tx }) => (
    <div className="flex items-center gap-1.5">
      <button onClick={() => handleDuzenle(tx)}
        className="p-1.5 rounded-lg hover:bg-primary-500/10 text-surface-700 dark:text-surface-200 hover:text-primary-500 transition-colors cursor-pointer"
        title="Düzenle">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => setSilinecek(tx)}
        className="p-1.5 rounded-lg hover:bg-danger-500/10 text-surface-700 dark:text-surface-200 hover:text-danger-500 transition-colors cursor-pointer"
        title="Sil">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Başlık + "+ Yeni İşlem" + Toggle */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">İşlemler</h1>
          <p className="text-surface-700 dark:text-surface-200 mt-1 text-sm">{filtrelenmis.length} işlem bulundu</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Yeni İşlem butonu */}
          <button
            onClick={() => { setDuzenlenen(null); setModalAcik(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-bold hover:bg-primary-600 shadow-lg shadow-primary-500/30 transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni İşlem</span>
          </button>
          {/* Görünüm toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-100 dark:bg-surface-800">
            {[{ k: 'tablo', icon: LayoutList }, { k: 'kart', icon: LayoutGrid }].map(({ k, icon: Icon }) => (
              <button key={k} onClick={() => setGorunum(k)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${gorunum === k ? 'bg-white dark:bg-surface-700 shadow text-primary-500' : 'text-surface-700 dark:text-surface-200 hover:text-white'}`}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filtreleme Paneli */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-700 dark:text-surface-200" />
            <input type="text" value={aramaHam} onChange={e => setAramaHam(e.target.value)}
              placeholder="Mağaza veya açıklama ara..." className={`${inputCls} pl-9 w-full`} />
          </div>
          <KatDropdown secili={seciliKatlar} onChange={setSeciliKatlar} />
          <input type="date" value={tarihBas} onChange={e => setTarihBas(e.target.value)} className={inputCls} title="Başlangıç tarihi" />
          <input type="date" value={tarihBit} onChange={e => setTarihBit(e.target.value)} className={inputCls} title="Bitiş tarihi" />
          <input type="number" value={minTutar} onChange={e => setMinTutar(e.target.value)} placeholder="Min ₺" className={`${inputCls} w-24`} />
          <input type="number" value={maxTutar} onChange={e => setMaxTutar(e.target.value)} placeholder="Max ₺" className={`${inputCls} w-24`} />
        </div>
        {aktifFiltreler.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center pt-1">
            {aktifFiltreler.map((f, i) => <FiltreBadge key={i} etiket={f.etiket} onRemove={f.temizle} />)}
            <button onClick={tumunuTemizle} className="text-xs text-danger-500 hover:underline cursor-pointer font-semibold ml-1">
              Tüm Filtreleri Temizle
            </button>
          </div>
        )}
      </div>

      {/* ── TABLO ── */}
      {gorunum === 'tablo' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50/80 dark:bg-surface-800/80 border-b border-surface-200 dark:border-surface-700">
                <tr>
                  <TabloBaşlık label="Tarih"    kolon="tarih"    aktif={sortKolon} yon={sortYon} onSort={handleSort} />
                  <TabloBaşlık label="Mağaza"   kolon="magaza"   aktif={sortKolon} yon={sortYon} onSort={handleSort} />
                  <TabloBaşlık label="Kategori" kolon="kategori" aktif={sortKolon} yon={sortYon} onSort={handleSort} />
                  <TabloBaşlık label="Tutar"    kolon="tutar"    aktif={sortKolon} yon={sortYon} onSort={handleSort} />
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {sayfadakiler.length === 0
                  ? <tr><td colSpan={5} className="text-center py-16 text-surface-700 dark:text-surface-200">Eşleşen işlem bulunamadı</td></tr>
                  : sayfadakiler.map(tx => (
                    <tr key={tx.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-surface-700 dark:text-surface-200 whitespace-nowrap">{tx.tarih}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-surface-900 dark:text-white">{tx.magaza || '—'}</p>
                        <p className="text-xs text-surface-700 dark:text-surface-200 truncate max-w-[180px]">{tx.aciklama}</p>
                      </td>
                      <td className="px-4 py-3"><KatBadge kategori={tx.kategori} /></td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-sm ${tx.tur === 'gelir' ? 'text-accent-500' : 'text-danger-500'}`}>
                          {tx.tur === 'gelir' ? '+' : '-'}{fmt(tx.tutar)}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex justify-end"><AksiyonButonlari tx={tx} /></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── KART ── */}
      {gorunum === 'kart' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sayfadakiler.length === 0
            ? <div className="col-span-full text-center py-16 text-surface-700 dark:text-surface-200">Eşleşen işlem bulunamadı</div>
            : sayfadakiler.map(tx => (
              <div key={tx.id} className="glass-card rounded-2xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <KatBadge kategori={tx.kategori} />
                  <AksiyonButonlari tx={tx} />
                </div>
                <p className="font-semibold text-surface-900 dark:text-white text-sm">{tx.magaza || '—'}</p>
                <p className="text-xs text-surface-700 dark:text-surface-200 mt-0.5 truncate">{tx.aciklama}</p>
                {tx.etiketler?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tx.etiketler.map(e => (
                      <span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-200">{e}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100 dark:border-surface-700">
                  <span className="text-xs text-surface-700 dark:text-surface-200">{tx.tarih}</span>
                  <span className={`font-bold text-sm ${tx.tur === 'gelir' ? 'text-accent-500' : 'text-danger-500'}`}>
                    {tx.tur === 'gelir' ? '+' : '-'}{fmt(tx.tutar)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ── SAYFALAMA ── */}
      {toplamSayfa > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-700 dark:text-surface-200">{sayfa} / {toplamSayfa} sayfa · {filtrelenmis.length} işlem</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setSayfa(s => Math.max(1, s - 1))} disabled={sayfa === 1}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-500 transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4" /> Önceki
            </button>
            {Array.from({ length: Math.min(5, toplamSayfa) }, (_, i) => {
              let p = i + 1;
              if (toplamSayfa > 5) {
                if (sayfa <= 3) p = i + 1;
                else if (sayfa >= toplamSayfa - 2) p = toplamSayfa - 4 + i;
                else p = sayfa - 2 + i;
              }
              return (
                <button key={p} onClick={() => setSayfa(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors cursor-pointer ${sayfa === p ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-200 hover:border-primary-500'}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setSayfa(s => Math.min(toplamSayfa, s + 1))} disabled={sayfa === toplamSayfa}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-500 transition-colors cursor-pointer">
              Sonraki <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL ── */}
      {modalAcik && (
        <TransactionModal
          islem={duzenlenen}
          onKaydet={handleKaydet}
          onKapat={() => { setModalAcik(false); setDuzenlenen(null); }}
        />
      )}

      {/* ── SİLME ONAYI ── */}
      {silinecek && (
        <SilOnay
          islem={silinecek}
          onOnayla={handleSil}
          onIptal={() => setSilinecek(null)}
        />
      )}
    </div>
  );
}
