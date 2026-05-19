import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  LayoutList, LayoutGrid, Search,
  Plus, Upload, RefreshCw, Receipt, Camera, Mic,
  ArrowUpRight, ArrowDownRight, Landmark
} from 'lucide-react';
import { fmt } from '../utils/categories';
import { TableVirtuoso, VirtuosoGrid } from 'react-virtuoso';
import useStore from '../store/useStore';
import TransactionModal from '../components/TransactionModal';
import DeleteTransactionConfirm from '../components/transactions/DeleteTransactionConfirm';
import ReceiptScanModal from '../components/transactions/ReceiptScanModal';
import UnusualSpendingModal from '../components/transactions/UnusualSpendingModal';
import AntiImpulseModal from '../components/AntiImpulseModal';
import CsvUploader from '../components/CsvUploader';
import SubscriptionsTab from '../components/SubscriptionsTab';
import OpenBankingModal from '../components/OpenBankingModal';
import { detectUnusualSpending, saveUnusualSpendingDecision } from '../utils/notifications';
import { useToast } from '../hooks/useToast';
import { authFetch } from '../utils/api';
import { GlowOrb, FiltreBadge, KatDropdown, SortIcon, StatMini, TxTableRow, TxKartRow } from '../components/transactions/TransactionUIComponents';

import { P } from '../styles/palette';
/* ─── Palette ─── */

/* ─── MAIN ─── */
export default function TransactionsPage() {
  const toast = useToast();
  const storeTransactions = useStore(state => state.transactions);
  const ham = useMemo(() => [...(storeTransactions || [])].sort((a, b) => (b.tarih || '').localeCompare(a.tarih || '')), [storeTransactions]);
  const addTransaction = useStore(state => state.addTransaction);
  const updateTransaction = useStore(state => state.updateTransaction);
  const removeTransaction = useStore(state => state.removeTransaction);
  const [gorunum, setGorunum] = useState('tablo');
  const [sortKolon, setSortKolon] = useState('tarih');
  const [sortYon, setSortYon] = useState('desc');
  const [isListening, setIsListening] = useState(false);
  const [headerVis, setHeaderVis] = useState(false);

  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState(null);
  const [taslakIslem, setTaslakIslem] = useState(null);
  const [silinecek, setSilinecek] = useState(null);
  const [impulseTx, setImpulseTx] = useState(null);
  const [alisilmadik, setAlisilmadik] = useState(null);
  const [csvAcik, setCsvAcik] = useState(false);
  const [openBankingAcik, setOpenBankingAcik] = useState(false);
  const [fisModalAcik, setFisModalAcik] = useState(false);
  const [aktifTab, setAktifTab] = useState('islemler');

  const [aramaHam, setAramaHam] = useState('');
  const [arama, setArama] = useState('');
  const [seciliKatlar, setSeciliKatlar] = useState([]);
  const [tarihBas, setTarihBas] = useState('');
  const [tarihBit, setTarihBit] = useState('');
  const [minTutar, setMinTutar] = useState('');
  const [maxTutar, setMaxTutar] = useState('');

  useEffect(() => { const t = setTimeout(() => setHeaderVis(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setTimeout(() => setArama(aramaHam), 300); return () => clearTimeout(t); }, [aramaHam]);
  

  /* ─ CRUD ─ */
  

  const handleSort = useCallback((kolon) => {
    if (sortKolon === kolon) setSortYon(y => y === 'asc' ? 'desc' : 'asc');
    else { setSortKolon(kolon); setSortYon('desc'); }
    
  }, [sortKolon]);

  /* ─ Sesle ekleme ─ */
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      const transcript = 'Migros marketten 275 TL harcadım';
      toast.info('Tarayıcı ses tanımıyor; sandbox ses komutu işleniyor.', { duration: 5000 });
      authFetch('/api/voice', { method: 'POST', body: JSON.stringify({ text: transcript }) })
        .then(async (res) => {
          const data = await res.json();
          const yeniIslem = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            tarih: new Date().toISOString().slice(0, 10),
            tutar: data.tutar || 275,
            magaza: data.magaza || 'Migros',
            aciklama: transcript,
            kategori: data.kategori || 'Market',
            tur: data.tur || 'gider',
            not: 'Sesli asistan sandbox fallback ile eklendi',
          };
          await addTransaction(yeniIslem);
          toast.success(`${yeniIslem.magaza} (${fmt(yeniIslem.tutar)}) eklendi.`);
        })
        .catch(err => toast.error(`Analiz hatası: ${err.message}`));
      return;
    }
    const recognition = new SR();
    recognition.lang = 'tr-TR'; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onstart = () => { setIsListening(true); toast.info('Dinliyorum... Konuşun.', { duration: 5000, icon: '🎤' }); };
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      if (!transcript || transcript.trim() === '') {
        toast.error('Ses algılanamadı, lütfen tekrar deneyin.');
        return;
      }
      toast.info(`Anlaşılan: "${transcript}". Analiz ediliyor...`, { duration: 10000, icon: '🧠' });
      try {
        const res = await authFetch('/api/voice', { method: 'POST', body: JSON.stringify({ text: transcript }) });
        if (!res.ok) {
            const errBody = await res.json().catch(()=>({}));
            throw new Error(errBody.error || 'API Hatası');
        }
        const data = await res.json();
        const yeniIslem = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), tarih: new Date().toISOString().slice(0, 10), tutar: data.tutar || '', magaza: data.magaza || '', aciklama: transcript, kategori: data.kategori || 'Diğer', tur: data.tur || 'gider', not: 'Sesli asistan ile eklendi' };
        if (!yeniIslem.tutar) { toast.warning('Tutar tam anlaşılamadı, formu doldurun.'); setTaslakIslem(yeniIslem); setModalAcik(true); return; }
        await addTransaction(yeniIslem);
        toast.success(`${yeniIslem.magaza || 'İşlem'} (${fmt(yeniIslem.tutar)}) eklendi! ✨`);
      } catch(err) { toast.error(`Analiz hatası: ${err.message}`); }
    };
    recognition.onerror = (e) => { setIsListening(false); if (e.error !== 'no-speech') toast.error('Mikrofon hatası: ' + e.error); };
    recognition.onend = () => { setIsListening(false); };
    recognition.start();
  };

  const forceKaydet = async (form) => {
    const yeniIslemMi = !duzenlenen;
    let kaydedilen;
    try {
      if (yeniIslemMi) {
        kaydedilen = await addTransaction({ ...form });
      } else {
        await updateTransaction(duzenlenen.id, { ...form });
        kaydedilen = { ...duzenlenen, ...form };
      }
      if (yeniIslemMi) { const u = detectUnusualSpending(kaydedilen, ham); if (u) setAlisilmadik(u); }
      setModalAcik(false); setDuzenlenen(null); setTaslakIslem(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleKaydet = async (form) => {
    const isNew = !duzenlenen;
    const m = (form.magaza || '').toLowerCase();
    const isImpulseBrand = ['trendyol', 'amazon', 'zara', 'apple', 'beymen', 'hepsiburada'].some(b => m.includes(b));
    
    // Anti-Impulse Dopamine Lock Trigger: Gece/Yüksek Tutar/E-ticaret
    if (isNew && form.tur === 'gider' && Number(form.tutar) >= 2000 && isImpulseBrand) {
      setImpulseTx(form);
      return;
    }
    await forceKaydet(form);
  };

  const handleFisSonucu = (ocr) => {
    if (!ocr.tutar && !ocr.tarih && !ocr.magaza) { toast.error('Görüntü net değil, tekrar dene'); return; }
    const taslak = { tarih: ocr.tarih || new Date().toISOString().slice(0, 10), tutar: ocr.tutar || '', magaza: ocr.magaza || '', aciklama: ocr.magaza ? `${ocr.magaza} fişi` : 'Fişten eklenen işlem', kategori: '', not: 'Fiş tarama ile eklendi' };
    if (!ocr.tutar) toast.warning('Tutarı bulamadım, lütfen manuel gir'); else toast.success('Fiş okundu!');
    setTaslakIslem(taslak); setDuzenlenen(null); setFisModalAcik(false); setModalAcik(true);
  };

  const handleAlisilmadikSecim = (d) => { if (alisilmadik) saveUnusualSpendingDecision(alisilmadik, d); setAlisilmadik(null); };
  const handleSil = async () => { 
    if (!silinecek) return; 
    try {
      await removeTransaction(silinecek.id); 
      setSilinecek(null); 
    } catch (err) {
      toast.error(err.message);
    }
  };
  const handleDuzenle = (tx) => { setDuzenlenen(tx); setModalAcik(true); };
  const handleCsvImport = async (islemler) => { 
    const keyFor = (tx) => tx.duplicateKey || [
      tx.tarih,
      Math.round(Number(tx.tutar || 0) * 100),
      String(tx.magaza || tx.aciklama || '').toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim().slice(0, 48),
      tx.tur || 'gider',
    ].join('|');
    const existingKeys = new Set(useStore.getState().transactions.map(keyFor));
    let imported = 0;
    let skipped = 0;

    for (const tx of islemler) {
      const key = keyFor(tx);
      if (existingKeys.has(key)) {
        skipped += 1;
        continue;
      }
      await addTransaction({ ...tx });
      existingKeys.add(key);
      imported += 1;
    }
    setCsvAcik(false);
    if (imported > 0) toast.success(`${imported} işlem içe aktarıldı${skipped ? `, ${skipped} tekrar atlandı` : ''}.`);
    else toast.info('Yeni işlem bulunamadı; tekrar kayıtlar atlandı.');
  };

  /* ─ Filtreleme ─ */
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

  

  const totalIncome = ham.filter(t => t.tur === 'gelir').reduce((s, t) => s + Math.abs(Number(t.tutar)), 0);
  const totalExpense = ham.filter(t => t.tur === 'gider').reduce((s, t) => s + Math.abs(Number(t.tutar)), 0);

  const aktifFiltreler = [
    arama && { etiket: `"${arama}"`, temizle: () => { setArama(''); setAramaHam(''); } },
    ...seciliKatlar.map(k => ({ etiket: k, temizle: () => setSeciliKatlar(s => s.filter(x => x !== k)) })),
    tarihBas && { etiket: `Başl: ${tarihBas}`, temizle: () => setTarihBas('') },
    tarihBit && { etiket: `Bitiş: ${tarihBit}`, temizle: () => setTarihBit('') },
    minTutar && { etiket: `Min: ${fmt(minTutar)}`, temizle: () => setMinTutar('') },
    maxTutar && { etiket: `Max: ${fmt(maxTutar)}`, temizle: () => setMaxTutar('') },
  ].filter(Boolean);

  const tumunuTemizle = () => { setAramaHam(''); setArama(''); setSeciliKatlar([]); setTarihBas(''); setTarihBit(''); setMinTutar(''); setMaxTutar(''); };

  const inputStyle = {
    padding: '9px 14px', borderRadius: 12,
    background: P.bg3, border: `1px solid ${P.border}`,
    color: P.text1, fontSize: 13, fontFamily: 'inherit',
    transition: 'all 0.2s', outline: 'none',
  };

  const thStyle = {
    padding: '12px 16px', fontSize: 10, fontWeight: 800,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: P.text3, textAlign: 'left', userSelect: 'none',
  };

  return (
    <>
      <style>{`
        @keyframes gradientShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .tx-input:focus { border-color: rgba(124,58,237,0.5) !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important; }
        .tx-scroll::-webkit-scrollbar { width: 4px; }
        .tx-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius:999px; }
        .tab-btn:hover { color: #A78BFA !important; }
      `}</style>

      <div style={{ minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", position: 'relative', overflow: 'hidden' }}>
        <GlowOrb color={P.purple} style={{ top: -100, left: -100 }} />
        <GlowOrb color={P.blue} style={{ bottom: 0, right: -80 }} size={250} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* ── HERO HEADER ── */}
          <div style={{
            background: P.bg1, border: `1px solid ${P.border}`, borderRadius: 20,
            padding: '24px 28px', position: 'relative', overflow: 'hidden',
            opacity: headerVis ? 1 : 0, transform: headerVis ? 'none' : 'translateY(-12px)',
            transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${P.purple},${P.blue},${P.green},${P.purple})`, backgroundSize: '300% 100%', animation: 'gradientShift 4s ease infinite', borderRadius: '20px 20px 0 0' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: P.text3, marginBottom: 10 }}>Harcama Akışı</p>
                <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', marginBottom: 6, lineHeight: 1 }}>İşlemler</h1>
                <p style={{ fontSize: 13, color: P.text3 }}>{filtrelenmis.length} işlem bulundu · fiş tara, filtrele, düzenle</p>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <button aria-label="Sesli İşlem Ekle" onClick={startListening} style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 12,
                  background: isListening ? P.red : `${P.purple}25`, border: `1px solid ${isListening ? P.red + '50' : P.purple + '40'}`,
                  color: isListening ? '#fff' : P.purpleLight,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  animation: isListening ? 'pulse 1s ease-in-out infinite' : 'none',
                }}>
                  <Mic size={15} />
                  <span>{isListening ? 'Dinleniyor...' : 'Sesle Ekle'}</span>
                </button>
                <button onClick={() => setFisModalAcik(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 12, border: `1px solid ${P.green}40`, background: `${P.green}18`, color: P.green, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = `${P.green}28`}
                  onMouseLeave={e => e.currentTarget.style.background = `${P.green}18`}>
                  <Camera size={15} /> Fiş Tara
                </button>
                <button onClick={() => setCsvAcik(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 12, border: `1px solid ${P.border}`, background: csvAcik ? P.bg4 : P.bg3, color: P.text2, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Upload size={15} /> Ekstre Yükle
                </button>
                <button onClick={() => setOpenBankingAcik(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 12, border: `1px solid rgba(59,130,246,0.4)`, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.15)'}>
                  <Landmark size={15} /> Banka Bağla
                </button>
                <button onClick={() => { setDuzenlenen(null); setTaslakIslem(null); setModalAcik(true); }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${P.purple},#4F46E5)`, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 16px ${P.purpleGlow}`, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  <Plus size={16} /> Yeni İşlem
                </button>
                {/* View toggle */}
                {aktifTab === 'islemler' && (
                  <div style={{ display: 'flex', gap: 3, padding: 4, background: P.bg4, borderRadius: 11, border: `1px solid ${P.border}` }}>
                    {[{ k: 'tablo', icon: LayoutList }, { k: 'kart', icon: LayoutGrid }].map(({ k, icon: Icon }) => (
                      <button key={k} onClick={() => setGorunum(k)} style={{
                        width: 34, height: 34, borderRadius: 8, border: 'none',
                        background: gorunum === k ? P.bg2 : 'transparent',
                        color: gorunum === k ? P.purpleLight : P.text3,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                        boxShadow: gorunum === k ? `0 2px 8px rgba(0,0,0,0.3)` : 'none',
                      }}><Icon size={16} /></button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mini stats */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <StatMini label="Toplam Gelir" value={fmt(totalIncome)} icon="📈" color={P.green} delay={100} />
              <StatMini label="Toplam Gider" value={fmt(totalExpense)} icon="📉" color={P.red} delay={180} />
              <StatMini label="Net Bakiye" value={fmt(totalIncome - totalExpense)} icon="💰" color={P.purple} delay={260} />
              <StatMini label="İşlem Sayısı" value={ham.length} icon="📋" color={P.amber} delay={340} />
            </div>
          </div>

          {/* CSV Uploader */}
          {csvAcik && (
            <CsvUploader onImport={handleCsvImport} onKapat={() => setCsvAcik(false)} />
          )}

          {/* Open Banking Modal */}
          {openBankingAcik && (
            <OpenBankingModal 
              onClose={() => setOpenBankingAcik(false)} 
              onComplete={(islemler) => {
                handleCsvImport(islemler);
                setOpenBankingAcik(false);
                toast.success('Açık Bankacılık verileri yapay zeka ile kategorize edilip başarıyla eklendi! 🎉');
              }} 
            />
          )}

          {/* ── TABS ── */}
          <div style={{ display: 'flex', gap: 4, padding: 4, background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 14, width: 'fit-content' }}>
            {[
              { k: 'islemler', label: 'İşlemler', icon: Receipt },
              { k: 'abonelikler', label: 'Abonelikler', icon: RefreshCw },
            ].map(({ k, label, icon: Icon }) => (
              <button key={k} className="tab-btn" onClick={() => setAktifTab(k)} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none',
                background: aktifTab === k ? `linear-gradient(135deg,${P.purple},#4F46E5)` : 'transparent',
                color: aktifTab === k ? '#fff' : P.text3,
                fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: aktifTab === k ? `0 4px 12px ${P.purpleGlow}` : 'none',
              }}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {/* ── ABONELİKLER ── */}
          {aktifTab === 'abonelikler' && <SubscriptionsTab islemler={ham} />}

          {aktifTab === 'islemler' && (<>

            {/* ── FİLTRE PANELİ ── */}
            <div style={{ position: 'relative', zIndex: 10, background: P.bg1, border: `1px solid ${P.border}`, borderRadius: 18, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeUp 0.4s ease 0.15s both' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                  <Search size={15} color={P.text3} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input aria-label="Arama" className="tx-input" type="text" value={aramaHam} onChange={e => setAramaHam(e.target.value)}
                    placeholder="Mağaza veya açıklama ara..."
                    style={{ ...inputStyle, paddingLeft: 38, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <KatDropdown secili={seciliKatlar} onChange={setSeciliKatlar} />
                <input className="tx-input" type="date" value={tarihBas} onChange={e => setTarihBas(e.target.value)} style={inputStyle} aria-label="Başlangıç Tarihi" title="Başlangıç tarihi" />
                <input className="tx-input" type="date" value={tarihBit} onChange={e => setTarihBit(e.target.value)} style={inputStyle} aria-label="Bitiş Tarihi" title="Bitiş tarihi" />
                <input className="tx-input" type="number" value={minTutar} onChange={e => setMinTutar(e.target.value)} aria-label="Minimum Tutar" placeholder="Min ₺" style={{ ...inputStyle, width: 90 }} />
                <input className="tx-input" type="number" value={maxTutar} onChange={e => setMaxTutar(e.target.value)} aria-label="Maksimum Tutar" placeholder="Max ₺" style={{ ...inputStyle, width: 90 }} />
              </div>
              {aktifFiltreler.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  {aktifFiltreler.map((f, i) => <FiltreBadge key={i} etiket={f.etiket} onRemove={f.temizle} />)}
                  <button onClick={tumunuTemizle} style={{ fontSize: 12, fontWeight: 700, color: P.red, background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4, opacity: 0.8 }}>
                    Tüm Filtreleri Temizle
                  </button>
                </div>
              )}
            </div>

            {/* ── TABLO ── */}
            {gorunum === 'tablo' && (
              <div style={{ background: P.bg1, border: `1px solid ${P.border}`, borderRadius: 20, overflow: 'hidden', animation: 'fadeUp 0.4s ease 0.25s both' }}>
                {filtrelenmis.length === 0 ? (
                  <div style={{ padding: '56px 20px', textAlign: 'center', color: P.text3 }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>{ham.length === 0 ? '📥' : '🔍'}</div>
                    <p style={{ fontWeight: 800, color: P.text2, marginBottom: 6 }}>{ham.length === 0 ? 'İlk işlemini ekleyelim' : 'Eşleşen işlem bulunamadı'}</p>
                    <p style={{ fontSize: 13, margin: '0 auto 14px', maxWidth: 460 }}>
                      {ham.length === 0 ? 'CSV ekstre yükle, fiş tara, sesle söyle veya manuel ekle. Yeni hesaplar demo veriyle kirlenmeden tertemiz başlar.' : 'Filtreleri temizleyerek tüm işlemleri tekrar görebilirsin.'}
                    </p>
                    <button onClick={ham.length === 0 ? () => setCsvAcik(true) : tumunuTemizle} style={{ marginTop: 10, padding: '8px 16px', borderRadius: 10, border: 'none', background: P.purpleDim, color: P.purpleLight, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {ham.length === 0 ? <><Upload size={12} /> CSV Yükle</> : <><RefreshCw size={12} /> Filtreleri Temizle</>}
                    </button>
                  </div>
                ) : (
                  <TableVirtuoso
                    style={{ height: 600, width: '100%' }}
                    data={filtrelenmis}
                    components={{
                      Table: (props) => <table {...props} style={{ width: '100%', borderCollapse: 'collapse' }} />,
                      TableRow: (props) => <tr {...props} style={{ borderBottom: `1px solid ${P.border}`, transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = P.bg3} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} />
                    }}
                    fixedHeaderContent={() => (
                      <tr style={{ background: P.bg3, borderBottom: `1px solid ${P.border}` }}>
                        {[
                          { label: 'Tarih', kolon: 'tarih' },
                          { label: 'Mağaza', kolon: 'magaza' },
                          { label: 'Kategori', kolon: 'kategori' },
                          { label: 'Tutar', kolon: 'tutar' },
                        ].map(({ label, kolon }) => (
                          <th key={kolon} style={thStyle}>
                            <button aria-label={`${label} sütununa göre sırala`} onClick={() => handleSort(kolon)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', transition: 'color 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.color = P.purpleLight}
                              onMouseLeave={e => e.currentTarget.style.color = ''}>
                              {label} <SortIcon kolon={kolon} aktif={sortKolon} yon={sortYon} />
                            </button>
                          </th>
                        ))}
                        <th style={{ ...thStyle, width: 80 }} />
                      </tr>
                    )}
                    itemContent={(index, tx) => (
                      <TxTableRow key={tx.id} tx={tx}  onDuzenle={handleDuzenle} onSil={setSilinecek} />
                    )}
                  />
                )}
                {/* Table footer */}
                <div style={{ padding: '12px 20px', borderTop: `1px solid ${P.border}`, background: P.bg3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: P.text3 }}>{filtrelenmis.length} / {ham.length} işlem</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[{ color: P.green, icon: ArrowUpRight, value: fmt(totalIncome) }, { color: P.red, icon: ArrowDownRight, value: fmt(totalExpense) }].map(({ color, icon: Icon, value }) => (
                      <span key={color} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, background: `${color}15`, color, fontSize: 11, fontWeight: 700, border: `1px solid ${color}25` }}>
                        <Icon size={11} />{value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── KART ── */}
            {gorunum === 'kart' && (
              <div style={{ width: '100%', animation: 'fadeUp 0.4s ease 0.25s both' }}>
                {filtrelenmis.length === 0
                  ? <div style={{ textAlign: 'center', padding: '56px 20px', color: P.text3 }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>{ham.length === 0 ? '📥' : '🔍'}</div>
                    <p style={{ fontWeight: 800, color: P.text2, marginBottom: 8 }}>{ham.length === 0 ? 'Veri bekleyen temiz hesap' : 'Eşleşen işlem bulunamadı'}</p>
                    <p style={{ fontSize: 13, maxWidth: 440, margin: '0 auto 16px' }}>{ham.length === 0 ? 'İlk verini CSV, fiş tarama, ses veya manuel kayıtla ekleyebilirsin.' : 'Filtreleri temizleyerek tüm işlemleri tekrar görebilirsin.'}</p>
                    <button onClick={ham.length === 0 ? () => setCsvAcik(true) : tumunuTemizle} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: P.purpleDim, color: P.purpleLight, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>{ham.length === 0 ? 'CSV Yükle' : 'Filtreleri Temizle'}</button>
                  </div>
                  : (
                    <VirtuosoGrid
                      style={{ height: 600, width: '100%' }}
                      data={filtrelenmis}
                      components={{
                        List: React.forwardRef((props, ref) => <div {...props} ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14, width: '100%', ...props.style }} />)
                      }}
                      itemContent={(index, tx) => <TxKartRow key={tx.id} tx={tx}  onDuzenle={handleDuzenle} onSil={setSilinecek} />}
                    />
                  )}
              </div>
            )}

          </>)}

          {/* ── MODALS ── */}
          {modalAcik && <TransactionModal islem={duzenlenen} initialValues={taslakIslem} onKaydet={handleKaydet} onKapat={() => { setModalAcik(false); setDuzenlenen(null); setTaslakIslem(null); }} />}
          {impulseTx && (
            <AntiImpulseModal
              tx={impulseTx}
              onCancel={() => setImpulseTx(null)}
              onConfirm={() => { forceKaydet(impulseTx); setImpulseTx(null); }}
              onCoolOff={() => { toast.success('Harika karar! Para 24 saatliğine Soğuma Kasasında güvende.', { icon: '🛡️' }); setImpulseTx(null); setModalAcik(false); setTaslakIslem(null); }}
            />
          )}
          {fisModalAcik && <ReceiptScanModal onSonuc={handleFisSonucu} onApiError={() => { toast.error('Fiş okuma çalışmıyor, manuel ekle'); setFisModalAcik(false); setModalAcik(true); }} onKapat={() => setFisModalAcik(false)} />}
          {silinecek && <DeleteTransactionConfirm islem={silinecek} onOnayla={handleSil} onIptal={() => setSilinecek(null)} />}
          {alisilmadik && <UnusualSpendingModal alert={alisilmadik} onNormal={() => handleAlisilmadikSecim('false_alarm')} onReview={() => handleAlisilmadikSecim('review')} />}

        </div>
      </div>
    </>
  );
}
