import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText, Loader2, Sparkles, Wallet, TrendingDown, TrendingUp, Scale } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import { getBudgetLimits, getGoals, getTransactions } from '../utils/storage';
import { fmt } from '../utils/categories';
import { apiUrl } from '../utils/api';

const AY_ADLARI = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const csvEscape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

const markdownComponents = {
  h2: ({ children }) => <h2 className="text-base font-black text-surface-900 dark:text-white mt-5 mb-2 first:mt-0">{children}</h2>,
  p: ({ children }) => <p className="text-sm leading-6 text-surface-700 dark:text-surface-200 mb-3">{children}</p>,
  ul: ({ children }) => <ul className="space-y-2 mb-4">{children}</ul>,
  li: ({ children }) => <li className="text-sm leading-6 text-surface-700 dark:text-surface-200">{children}</li>,
  strong: ({ children }) => <strong className="font-black text-surface-900 dark:text-white">{children}</strong>,
};

function normalizeTransactions() {
  const giderler = getTransactions().map((tx) => ({
    id: tx.id,
    tarih: tx.tarih || tx.date,
    magaza: tx.magaza || tx.title || tx.aciklama || 'İşlem',
    kategori: tx.kategori || tx.category || 'Diğer',
    tutar: Number(tx.tutar ?? tx.amount ?? 0),
    not: tx.not || tx.note || tx.aciklama || '',
    tur: tx.tur || (tx.type === 'income' ? 'gelir' : 'gider'),
  }));

  try {
    const gelirler = JSON.parse(localStorage.getItem('butceai_gelir') || '[]').map((tx) => ({
      id: tx.id,
      tarih: tx.tarih || tx.date,
      magaza: tx.magaza || tx.title || tx.aciklama || 'Gelir',
      kategori: tx.kategori || tx.category || 'Gelir',
      tutar: Number(tx.tutar ?? tx.amount ?? 0),
      not: tx.not || tx.note || tx.aciklama || '',
      tur: 'gelir',
    }));
    return [...giderler, ...gelirler].filter(tx => tx.tarih && tx.tutar > 0);
  } catch {
    return giderler.filter(tx => tx.tarih && tx.tutar > 0);
  }
}

function monthKey(dateLike) {
  return String(dateLike || '').slice(0, 7);
}

function monthLabel(key) {
  const [year, month] = key.split('-').map(Number);
  return `${AY_ADLARI[month - 1]} ${year}`;
}

function addMonths(key, delta) {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function buildMonthWindow(transactions) {
  const keys = transactions.map(tx => monthKey(tx.tarih)).filter(Boolean).sort();
  const latest = keys[keys.length - 1] || new Date().toISOString().slice(0, 7);
  return Array.from({ length: 6 }, (_, index) => addMonths(latest, index - 5));
}

function summarizeMonth(transactions, key) {
  const aylik = transactions.filter(tx => monthKey(tx.tarih) === key);
  const gelir = aylik.filter(tx => tx.tur === 'gelir').reduce((sum, tx) => sum + tx.tutar, 0);
  const giderler = aylik.filter(tx => tx.tur !== 'gelir');
  const gider = giderler.reduce((sum, tx) => sum + tx.tutar, 0);
  const net = gelir - gider;
  const tasarrufOrani = gelir > 0 ? (net / gelir) * 100 : 0;

  return { aylik, giderler, gelir, gider, net, tasarrufOrani };
}

function categoryRows(currentExpenses, previousExpenses) {
  const toplamlar = (list) => list.reduce((acc, tx) => {
    acc[tx.kategori] = (acc[tx.kategori] || 0) + tx.tutar;
    return acc;
  }, {});
  const current = toplamlar(currentExpenses);
  const previous = toplamlar(previousExpenses);
  const categories = [...new Set([...Object.keys(current), ...Object.keys(previous)])];

  return categories
    .map((kategori) => {
      const buAy = current[kategori] || 0;
      const gecenAy = previous[kategori] || 0;
      return { kategori, buAy, gecenAy, fark: buAy - gecenAy };
    })
    .sort((a, b) => b.buAy - a.buAy);
}

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-2">{label}</p>
          <p className={`text-2xl font-black ${tone}`}>{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-500" />
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

  const transactions = useMemo(() => normalizeTransactions(), []);
  const months = useMemo(() => buildMonthWindow(transactions), [transactions]);
  const [selectedIndex, setSelectedIndex] = useState(months.length - 1);
  const selectedMonth = months[selectedIndex] || months[months.length - 1];
  const previousMonth = addMonths(selectedMonth, -1);
  const selectedSummary = useMemo(() => summarizeMonth(transactions, selectedMonth), [transactions, selectedMonth]);
  const previousSummary = useMemo(() => summarizeMonth(transactions, previousMonth), [transactions, previousMonth]);
  const rows = useMemo(
    () => categoryRows(selectedSummary.giderler, previousSummary.giderler),
    [selectedSummary.giderler, previousSummary.giderler]
  );

  const stats = [
    { label: 'Toplam gelir', value: fmt(selectedSummary.gelir), icon: Wallet, tone: 'text-emerald-500' },
    { label: 'Toplam gider', value: fmt(selectedSummary.gider), icon: TrendingDown, tone: 'text-danger-500' },
    { label: 'Net bakiye', value: fmt(selectedSummary.net), icon: Scale, tone: selectedSummary.net >= 0 ? 'text-primary-500' : 'text-danger-500' },
    { label: 'Tasarruf oranı', value: `%${selectedSummary.tasarrufOrani.toFixed(1)}`, icon: TrendingUp, tone: 'text-warn-500' },
  ];

  const handleAnalyze = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch(apiUrl('/api/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aylikVeri: {
            ay: monthLabel(selectedMonth),
            ozet: {
              toplamGelir: selectedSummary.gelir,
              toplamGider: selectedSummary.gider,
              netBakiye: selectedSummary.net,
              tasarrufOrani: Number(selectedSummary.tasarrufOrani.toFixed(1)),
            },
            kategoriKarsilastirma: rows,
            islemler: selectedSummary.aylik,
          },
          limitler: getBudgetLimits(),
          hedefler: getGoals(),
        }),
      });

      if (!res.ok) throw new Error('Analiz servisi yanıt vermedi.');
      const data = await res.json();
      setAiYorumu(data.summary || data.response || '');
    } catch (error) {
      setAiError(error.message || 'Rapor oluşturulamadı.');
    } finally {
      setAiLoading(false);
    }
  };

  const handlePdf = async () => {
    if (!reportRef.current) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f8fafc',
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

      pdf.save(`BütçeAI_${monthLabel(selectedMonth).replace(' ', '_')}_Raporu.pdf`);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCsv = () => {
    const headers = ['Tarih', 'Mağaza', 'Kategori', 'Tutar', 'Not'];
    const lines = selectedSummary.aylik
      .sort((a, b) => String(a.tarih).localeCompare(String(b.tarih)))
      .map(tx => [tx.tarih, tx.magaza, tx.kategori, tx.tutar, tx.not].map(csvEscape).join(','));
    const blob = new Blob([`\uFEFF${[headers.join(','), ...lines].join('\n')}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BütçeAI_${monthLabel(selectedMonth).replace(' ', '_')}_İşlemleri.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="page-hero p-5 md:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-600 dark:text-primary-300 mb-2">Aylık analiz</p>
          <h1 className="text-3xl md:text-4xl font-black text-surface-950 dark:text-white">Raporlar</h1>
          <p className="text-surface-700 dark:text-surface-200 mt-1 text-sm">Ay bazında gelir, gider ve kategori davranışlarını incele.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-2xl border border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-850/80 overflow-hidden">
            <button
              onClick={() => setSelectedIndex(i => Math.max(0, i - 1))}
              disabled={selectedIndex === 0}
              className="p-3 text-surface-700 dark:text-surface-200 hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Önceki ay"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-40 text-center px-3 py-2">
              <p className="text-xs font-semibold text-surface-500">Seçili ay</p>
              <p className="font-black text-surface-900 dark:text-white">{monthLabel(selectedMonth)}</p>
            </div>
            <button
              onClick={() => setSelectedIndex(i => Math.min(months.length - 1, i + 1))}
              disabled={selectedIndex === months.length - 1}
              className="p-3 text-surface-700 dark:text-surface-200 hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Sonraki ay"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handlePdf}
            disabled={pdfLoading}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-900 dark:bg-white text-white dark:text-surface-900 text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity cursor-pointer"
          >
            {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            PDF İndir
          </button>
          <button
            onClick={handleCsv}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-500 text-white text-sm font-bold hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            CSV İndir
          </button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <section className="glass-card rounded-2xl p-5 md:p-6 border border-surface-200 dark:border-surface-700/50">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">Kategori Tablosu</h2>
                <p className="text-xs text-surface-500">{monthLabel(previousMonth)} karşılaştırması</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-700">
                    {['Kategori', 'Bu Ay', 'Geçen Ay', 'Fark', 'Trend'].map(label => (
                      <th key={label} className="text-left py-3 pr-4 text-xs font-bold uppercase tracking-wider text-surface-500">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length > 0 ? rows.map(row => {
                    const iyi = row.fark < 0;
                    const ayni = row.fark === 0;
                    return (
                      <tr key={row.kategori} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                        <td className="py-3 pr-4 font-bold text-surface-900 dark:text-white">{row.kategori}</td>
                        <td className="py-3 pr-4 text-surface-700 dark:text-surface-200">{fmt(row.buAy)}</td>
                        <td className="py-3 pr-4 text-surface-700 dark:text-surface-200">{fmt(row.gecenAy)}</td>
                        <td className={`py-3 pr-4 font-black ${ayni ? 'text-surface-500' : iyi ? 'text-emerald-500' : 'text-danger-500'}`}>
                          {row.fark > 0 ? '+' : ''}{fmt(row.fark)}
                        </td>
                        <td className={`py-3 pr-4 font-black ${ayni ? 'text-surface-500' : iyi ? 'text-emerald-500' : 'text-danger-500'}`}>
                          {ayni ? '→' : iyi ? '↓' : '↑'}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="5" className="py-10 text-center text-surface-500">Bu ay için kategori verisi yok.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <CategoryPieChart islemler={selectedSummary.giderler} />
        </div>

        <section className="glass-card rounded-2xl p-5 md:p-6 border border-surface-200 dark:border-surface-700/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                AI Yorumu
              </div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">{monthLabel(selectedMonth)} finans yorumu</h2>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={aiLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-500 text-white text-sm font-bold hover:bg-primary-600 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Rapor Oluştur
            </button>
          </div>

          {aiError && (
            <div className="rounded-xl border border-danger-500/20 bg-danger-500/10 px-4 py-3 text-sm font-semibold text-danger-500">
              {aiError}
            </div>
          )}
          {aiYorumu ? (
            <div>
              <ReactMarkdown components={markdownComponents}>{aiYorumu}</ReactMarkdown>
            </div>
          ) : (
            <div className="rounded-2xl bg-surface-50 dark:bg-surface-900/40 border border-surface-200 dark:border-surface-700/50 px-4 py-6 text-sm text-surface-500">
              Rapor Oluştur butonuna basınca bu ayın kısa özeti, iyi yapılanlar, risk alanları ve gelecek ay önerileri burada markdown olarak görünür.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
