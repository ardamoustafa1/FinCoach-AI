import { useMemo, useRef, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Download, FileText, Loader2,
  Sparkles, Wallet, TrendingDown, TrendingUp, Scale,
  BarChart3, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import useStore from '../store/useStore';
import { fmt } from '../utils/categories';
import { authFetch } from '../utils/api';
import PageHeader from '../components/PageHeader';

/* ─── Palette ─── */
const P = {
  purple: '#7C3AED', purpleLight: '#A78BFA', purpleDim: 'rgba(124,58,237,0.15)',
  purpleGlow: 'rgba(124,58,237,0.35)', green: '#10B981', greenDim: 'rgba(16,185,129,0.15)',
  red: '#EF4444', redDim: 'rgba(239,68,68,0.15)', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg1: 'var(--bg-sidebar)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', borderHover: 'var(--border-hover)',
  text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)',
};

const AY_ADLARI = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const csvEscape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

function normalizeTransactions(rawTransactions) {
  return rawTransactions.map((tx) => ({
    id: tx.id, tarih: tx.tarih || tx.date, magaza: tx.magaza || tx.title || tx.aciklama || 'İşlem',
    kategori: tx.kategori || tx.category || 'Diğer', tutar: Number(tx.tutar ?? tx.amount ?? 0),
    not: tx.not || tx.note || tx.aciklama || '', tur: tx.tur || (tx.type === 'income' ? 'gelir' : 'gider'),
  })).filter(tx => tx.tarih && tx.tutar > 0);
}

function monthKey(dateLike) { return String(dateLike || '').slice(0, 7); }
function monthLabel(key) { const [year, month] = key.split('-').map(Number); return `${AY_ADLARI[month - 1]} ${year}`; }
function addMonths(key, delta) {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
function buildMonthWindow(transactions) {
  const keys = transactions.map(tx => monthKey(tx.tarih)).filter(Boolean).sort();
  const latest = keys[keys.length - 1] || new Date().toISOString().slice(0, 7);
  return Array.from({ length: 6 }, (_, i) => addMonths(latest, i - 5));
}
function summarizeMonth(transactions, key) {
  const aylik = transactions.filter(tx => monthKey(tx.tarih) === key);
  const gelir = aylik.filter(tx => tx.tur === 'gelir').reduce((s, tx) => s + tx.tutar, 0);
  const giderler = aylik.filter(tx => tx.tur !== 'gelir');
  const gider = giderler.reduce((s, tx) => s + tx.tutar, 0);
  const net = gelir - gider;
  const tasarrufOrani = gelir > 0 ? (net / gelir) * 100 : 0;
  return { aylik, giderler, gelir, gider, net, tasarrufOrani };
}
function categoryRows(currentExpenses, previousExpenses) {
  const toplamlar = (list) => list.reduce((acc, tx) => { acc[tx.kategori] = (acc[tx.kategori] || 0) + tx.tutar; return acc; }, {});
  const current = toplamlar(currentExpenses);
  const previous = toplamlar(previousExpenses);
  const categories = [...new Set([...Object.keys(current), ...Object.keys(previous)])];
  return categories.map((k) => ({ kategori: k, buAy: current[k] || 0, gecenAy: previous[k] || 0, fark: (current[k] || 0) - (previous[k] || 0) })).sort((a, b) => b.buAy - a.buAy);
}

function StatCard({ label, value, icon: Icon, color, positive }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '22px 24px', borderRadius: 20,
        background: hov ? P.bg3 : P.bg2,
        border: `1px solid ${hov ? P.borderHover : P.border}`,
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 0 32px ${P.purpleGlow}` : '0 4px 24px rgba(0,0,0,0.4)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: -30, right: -30, width: 90, height: 90, borderRadius: '50%', background: color, opacity: 0.08, filter: 'blur(28px)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: P.text3, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: positive === undefined ? P.text1 : positive ? P.green : P.red, lineHeight: 1 }}>{value}</p>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}22`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const reportRef = useRef(null);
  const [aiYorumu, setAiYorumu] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const rawTransactions = useStore(state => state.transactions);
  const budgetLimits = useStore(state => state.budgetLimits);
  const goals = useStore(state => state.goals);

  const transactions = useMemo(() => normalizeTransactions(rawTransactions), [rawTransactions]);
  const months = useMemo(() => buildMonthWindow(transactions), [transactions]);
  const [selectedIndex, setSelectedIndex] = useState(months.length - 1);
  const selectedMonth = months[selectedIndex] || months[months.length - 1];
  const previousMonth = addMonths(selectedMonth, -1);
  const selectedSummary = useMemo(() => summarizeMonth(transactions, selectedMonth), [transactions, selectedMonth]);
  const previousSummary = useMemo(() => summarizeMonth(transactions, previousMonth), [transactions, previousMonth]);
  const rows = useMemo(() => categoryRows(selectedSummary.giderler, previousSummary.giderler), [selectedSummary.giderler, previousSummary.giderler]);

  const stats = [
    { label: 'Toplam Gelir', value: fmt(selectedSummary.gelir), icon: Wallet, color: P.green, positive: true },
    { label: 'Toplam Gider', value: fmt(selectedSummary.gider), icon: TrendingDown, color: P.red, positive: false },
    { label: 'Net Bakiye', value: fmt(selectedSummary.net), icon: Scale, color: selectedSummary.net >= 0 ? P.purple : P.red, positive: selectedSummary.net >= 0 },
    { label: 'Tasarruf Oranı', value: `%${selectedSummary.tasarrufOrani.toFixed(1)}`, icon: TrendingUp, color: P.amber },
  ];

  const handleAnalyze = async () => {
    setAiLoading(true); setAiError('');
    try {
      const res = await authFetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({
          aylikVeri: {
            ay: monthLabel(selectedMonth),
            ozet: { toplamGelir: selectedSummary.gelir, toplamGider: selectedSummary.gider, netBakiye: selectedSummary.net, tasarrufOrani: Number(selectedSummary.tasarrufOrani.toFixed(1)) },
            kategoriKarsilastirma: rows, islemler: selectedSummary.aylik,
          },
          limitler: budgetLimits, hedefler: goals,
        }),
      });
      if (!res.ok) throw new Error('Analiz servisi yanıt vermedi.');
      const data = await res.json();
      setAiYorumu(data.summary || data.response || '');
    } catch (error) { setAiError(error.message || 'Rapor oluşturulamadı.'); }
    finally { setAiLoading(false); }
  };

  const handlePdf = async () => {
    if (!reportRef.current) return;
    setPdfLoading(true);
    try {
      // Dinamik import ile bundle boyutunu küçültüyoruz
      const [html2canvas, { jsPDF }] = await Promise.all([
        import('html2canvas').then(m => m.default),
        import('jspdf')
      ]);

      const canvas = await html2canvas(reportRef.current, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#050714',
        logging: false 
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      let remainingHeight = imgHeight; 
      let y = 0;

      pdf.addImage(imgData, 'PNG', 0, y, pageWidth, imgHeight);
      remainingHeight -= pageHeight;

      while (remainingHeight > 0) { 
        y -= pageHeight; 
        pdf.addPage(); 
        pdf.addImage(imgData, 'PNG', 0, y, pageWidth, imgHeight); 
        remainingHeight -= pageHeight; 
      }
      pdf.save(`FinCoach_AI_${monthLabel(selectedMonth).replace(' ', '_')}_Raporu.pdf`);
    } catch (err) {
      console.error('PDF Hatası:', err);
      setAiError('PDF oluşturulurken bir hata oluştu.');
    } finally { 
      setPdfLoading(false); 
    }
  };

  const handleCsv = () => {
    const headers = ['Tarih', 'Mağaza', 'Kategori', 'Tutar', 'Not'];
    const lines = selectedSummary.aylik.sort((a, b) => String(a.tarih).localeCompare(String(b.tarih))).map(tx => [tx.tarih, tx.magaza, tx.kategori, tx.tutar, tx.not].map(csvEscape).join(','));
    const blob = new Blob([`\uFEFF${[headers.join(','), ...lines].join('\n')}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `FinCoach AI_${monthLabel(selectedMonth).replace(' ', '_')}_İşlemleri.csv`;
    link.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .reports-btn-nav:hover:not(:disabled) { background: rgba(124,58,237,0.15) !important; color: #a78bfa !important; }
        .reports-btn-nav:disabled { opacity: 0.3; cursor: not-allowed; }
        .cat-row:hover { background: rgba(124,58,237,0.08) !important; }
        .ai-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .dl-btn:hover { background: rgba(255,255,255,0.1) !important; }
        .csv-btn:hover { opacity: 0.88; transform: translateY(-1px); }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        <PageHeader
          icon={<BarChart3 size={24} />}
          color={P.purple}
          title="Raporlar"
          subtitle="Ay bazında gelir, gider ve kategori davranışlarını incele."
          badge="Aylık Analiz"
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
            {/* Month Picker */}
            <div style={{ display: 'flex', alignItems: 'center', background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <button onClick={() => setSelectedIndex(i => Math.max(0, i - 1))} disabled={selectedIndex === 0} className="reports-btn-nav" style={{ padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: P.text2, transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={18} />
              </button>
              <div style={{ minWidth: 140, textAlign: 'center', padding: '8px 12px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Seçili Ay</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: P.text1 }}>{monthLabel(selectedMonth)}</p>
              </div>
              <button onClick={() => setSelectedIndex(i => Math.min(months.length - 1, i + 1))} disabled={selectedIndex === months.length - 1} className="reports-btn-nav" style={{ padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: P.text2, transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={18} />
              </button>
            </div>

            <button onClick={handlePdf} disabled={pdfLoading} className="dl-btn" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 12,
              background: 'rgba(255,255,255,0.06)', border: `1px solid ${P.border}`,
              color: P.text1, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s', opacity: pdfLoading ? 0.6 : 1,
            }}>
              {pdfLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={16} />}
              PDF İndir
            </button>

            <button onClick={handleCsv} className="csv-btn" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 12,
              background: `linear-gradient(135deg, ${P.purple}, #6366f1)`,
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(124,58,237,0.3)',
            }}>
              <Download size={16} />
              CSV İndir
            </button>
          </div>
        </PageHeader>

        <div ref={reportRef} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── STAT CARDS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {stats.map(s => <StatCard key={s.label} {...s} />)}
          </div>

          {/* ── TABLE + PIE ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>

            {/* Category Table */}
            <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: '24px 28px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: P.text1, marginBottom: 3 }}>Kategori Tablosu</h2>
                  <p style={{ fontSize: 12, color: P.text3 }}>{monthLabel(previousMonth)} karşılaştırması</p>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: `${P.purple}22`, border: `1px solid ${P.purple}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart3 size={18} color={P.purple} />
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Kategori', 'Bu Ay', 'Geçen Ay', 'Fark', 'Trend'].map(label => (
                        <th key={label} style={{ textAlign: 'left', padding: '8px 12px 12px 0', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: P.text3, borderBottom: `1px solid ${P.border}` }}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length > 0 ? rows.map(row => {
                      const iyi = row.fark < 0; const ayni = row.fark === 0;
                      const farkColor = ayni ? P.text3 : iyi ? P.green : P.red;
                      return (
                        <tr key={row.kategori} className="cat-row" style={{ borderBottom: `1px solid rgba(255,255,255,0.03)`, transition: 'background 0.15s' }}>
                          <td style={{ padding: '11px 12px 11px 0', fontSize: 13, fontWeight: 700, color: P.text1 }}>{row.kategori}</td>
                          <td style={{ padding: '11px 12px 11px 0', fontSize: 13, color: P.text2 }}>{fmt(row.buAy)}</td>
                          <td style={{ padding: '11px 12px 11px 0', fontSize: 13, color: P.text3 }}>{fmt(row.gecenAy)}</td>
                          <td style={{ padding: '11px 12px 11px 0', fontSize: 13, fontWeight: 700, color: farkColor }}>{row.fark > 0 ? '+' : ''}{fmt(row.fark)}</td>
                          <td style={{ padding: '11px 0 11px 0' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              {ayni ? null : iyi ? <ArrowDownRight size={14} color={P.green} /> : <ArrowUpRight size={14} color={P.red} />}
                              <span style={{ fontSize: 12, fontWeight: 700, color: farkColor }}>{ayni ? '→' : iyi ? 'Azaldı' : 'Arttı'}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan={5} style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: P.text3 }}>Bu ay için kategori verisi yok.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pie Chart */}
            <CategoryPieChart islemler={selectedSummary.giderler} />
          </div>

          {/* ── AI ANALYSIS ── */}
          <div style={{ 
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)', 
            border: `1px solid rgba(255,255,255,0.08)`, 
            borderRadius: 24, padding: '32px 36px', 
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(20px)'
          }}>
            {/* Ambient glows */}
            <div style={{ position: 'absolute', top: -50, right: -50, width: 250, height: 250, background: 'rgba(124,58,237,0.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, background: 'rgba(59,130,246,0.1)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24, position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Sparkles size={16} color="#c4b5fd" />
                  <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c4b5fd' }}>AI Yorumu</span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{monthLabel(selectedMonth)} Finans Yorumu</h2>
              </div>
              <button onClick={handleAnalyze} disabled={aiLoading} className="ai-btn" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 24px', borderRadius: 14,
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, fontWeight: 800,
                cursor: aiLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', opacity: aiLoading ? 0.7 : 1,
                boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
              }}>
                {aiLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={18} />}
                {aiLoading ? 'Rapor Hazırlanıyor...' : 'Rapor Oluştur'}
              </button>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {aiError && (
                <div style={{ padding: '16px 20px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: 14, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 12px rgba(239,68,68,0.1)' }}>
                  <span style={{ fontSize: 18 }}>⚠️</span> {aiError}
                </div>
              )}

              {aiYorumu ? (
                <div style={{ padding: '24px 28px', borderRadius: 16, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: 15, lineHeight: 1.8, boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
                  <ReactMarkdown components={{
                    h2: ({ children }) => <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginTop: 24, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 4, height: 16, borderRadius: 2, background: '#a78bfa' }} />{children}</h2>,
                    p: ({ children }) => <p style={{ marginBottom: 16, color: '#cbd5e1' }}>{children}</p>,
                    ul: ({ children }) => <ul style={{ paddingLeft: 24, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</ul>,
                    li: ({ children }) => <li style={{ color: '#cbd5e1' }}>{children}</li>,
                    strong: ({ children }) => <strong style={{ color: '#fff', fontWeight: 800 }}>{children}</strong>,
                  }}>{aiYorumu}</ReactMarkdown>
                </div>
              ) : (
                <div style={{ padding: '40px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: `1px dashed rgba(255,255,255,0.15)`, textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <Sparkles size={24} color="#a78bfa" />
                  </div>
                  <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
                    <strong style={{ color: '#e2e8f0', display: 'block', marginBottom: 8, fontSize: 16, fontWeight: 800 }}>Rapor Bekleniyor</strong>
                    Rapor Oluştur butonuna basarak bu ayın kısa özetini, iyi yapılanları ve gelecek ay önerilerini görebilirsiniz.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
