import { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUp, ArrowDown } from 'lucide-react';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import HeatmapCalendar from '../components/charts/HeatmapCalendar';
import BudgetBars from '../components/BudgetBars';
import LimitBanner from '../components/LimitBanner';
import HealthScore from '../components/HealthScore';
import PersonalityCard from '../components/PersonalityCard';
import { getBudgetLimits } from '../utils/storage';

// ─── localStorage'dan veri oku ───────────────────────────────
function getIslemler() {
  try {
    return JSON.parse(localStorage.getItem('butceai_transactions') || '[]');
  } catch { return []; }
}

function getGelirler() {
  try {
    return JSON.parse(localStorage.getItem('butceai_gelir') || '[]');
  } catch { return []; }
}

// ─── Aya göre filtrele (ay: 3,4,5 — Mart,Nisan,Mayıs) ──────
function ayFiltre(liste, ay) {
  const prefix = `2025-${String(ay).padStart(2, '0')}`;
  return liste.filter((i) => i.tarih && i.tarih.startsWith(prefix));
}

// ─── Animasyonlu sayaç hook'u ────────────────────────────────
function useCountUp(hedef, sure = 1500) {
  const [deger, setDeger] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (hedef === 0) { setDeger(0); return; }

    const baslangic = performance.now();
    const animate = (now) => {
      const gecen = now - baslangic;
      const oran = Math.min(gecen / sure, 1);
      // easeOutExpo — hızlı başla, yavaşça bitir
      const eased = oran === 1 ? 1 : 1 - Math.pow(2, -10 * oran);
      setDeger(eased * hedef);
      if (oran < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [hedef, sure]);

  return deger;
}

// ─── Para formatlayıcı ───────────────────────────────────────
const fmt = (val) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

// ─── Tek bir özet kartı ──────────────────────────────────────
function SummaryCard({ label, hedefDeger, icon: Icon, gradientFrom, gradientTo, iconBg, textColor, altSatir, isCurrency = true }) {
  const animated = useCountUp(hedefDeger, 1500);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-surface-850 p-5 shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      {/* Arka plan dekoratif gradient */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 dark:opacity-15 blur-2xl group-hover:opacity-20 transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      />

      <div className="relative z-10">
        {/* Üst: etiket + ikon */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-surface-700 dark:text-surface-200">
            {label}
          </span>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Büyük rakam */}
        <p className={`text-2xl md:text-3xl font-extrabold tracking-tight ${textColor}`}>
          {isCurrency ? fmt(animated) : `%${animated.toFixed(1)}`}
        </p>

        {/* Alt satır */}
        {altSatir && (
          <div className="flex items-center gap-1.5 mt-2">
            {altSatir.yon === 'up' ? (
              <span className="flex items-center gap-0.5 text-xs font-semibold text-accent-500">
                <ArrowUp className="w-3.5 h-3.5" />
                {altSatir.yuzde}
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-xs font-semibold text-danger-500">
                <ArrowDown className="w-3.5 h-3.5" />
                {altSatir.yuzde}
              </span>
            )}
            <span className="text-xs text-surface-700 dark:text-surface-200">
              {altSatir.metin}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard Sayfası ───────────────────────────────────────
export default function DashboardPage() {
  const [veriler, setVeriler] = useState(null);
  const [rawIslemler, setRawIslemler] = useState([]);
  const [rawGelirler, setRawGelirler] = useState([]);
  const [budgetLimitler, setBudgetLimitler] = useState({});
  const [buAyHarcamalar, setBuAyHarcamalar] = useState({});

  useEffect(() => {
    const islemler = getIslemler();
    const gelirler = getGelirler();
    setRawIslemler(islemler);
    setRawGelirler(gelirler);

    // Bütçe limitleri
    setBudgetLimitler(getBudgetLimits());

    // Bu ay kategoriye göre harcama toplamı
    const buAyPrefix = '2025-05';
    const harcamaMap = {};
    islemler
      .filter(i => i.tarih && i.tarih.startsWith(buAyPrefix))
      .forEach(i => { harcamaMap[i.kategori] = (harcamaMap[i.kategori] || 0) + i.tutar; });
    setBuAyHarcamalar(harcamaMap);

    // Bu ay = Mayıs (5), geçen ay = Nisan (4)
    const buAyIslemler = ayFiltre(islemler, 5);
    const gecenAyIslemler = ayFiltre(islemler, 4);

    const buAyGelir = ayFiltre(gelirler, 5).reduce((t, g) => t + g.tutar, 0);
    const gecenAyGelir = ayFiltre(gelirler, 4).reduce((t, g) => t + g.tutar, 0);

    const buAyGider = buAyIslemler.reduce((t, i) => t + i.tutar, 0);
    const gecenAyGider = gecenAyIslemler.reduce((t, i) => t + i.tutar, 0);

    const netBakiye = buAyGelir - buAyGider;
    const tasarrufOrani = buAyGelir > 0 ? ((buAyGelir - buAyGider) / buAyGelir) * 100 : 0;

    // Geçen aya göre % değişim
    const gelirDegisim = gecenAyGelir > 0
      ? (((buAyGelir - gecenAyGelir) / gecenAyGelir) * 100).toFixed(1)
      : '0.0';
    const giderDegisim = gecenAyGider > 0
      ? (((buAyGider - gecenAyGider) / gecenAyGider) * 100).toFixed(1)
      : '0.0';

    setVeriler({
      buAyGelir,
      buAyGider,
      netBakiye,
      tasarrufOrani,
      gelirDegisim: parseFloat(gelirDegisim),
      giderDegisim: parseFloat(giderDegisim),
    });
  }, []);

  if (!veriler) return null;

  const kartlar = [
    {
      label: 'Bu Ay Gelir',
      hedefDeger: veriler.buAyGelir,
      icon: TrendingUp,
      gradientFrom: '#10b981',
      gradientTo: '#34d399',
      textColor: 'text-accent-600 dark:text-accent-400',
      altSatir: {
        yuzde: `%${Math.abs(veriler.gelirDegisim).toFixed(1)}`,
        yon: veriler.gelirDegisim >= 0 ? 'up' : 'down',
        metin: 'geçen aya göre',
      },
    },
    {
      label: 'Bu Ay Gider',
      hedefDeger: veriler.buAyGider,
      icon: TrendingDown,
      gradientFrom: '#ef4444',
      gradientTo: '#f87171',
      textColor: 'text-danger-500 dark:text-danger-400',
      altSatir: {
        yuzde: `%${Math.abs(veriler.giderDegisim).toFixed(1)}`,
        yon: veriler.giderDegisim <= 0 ? 'up' : 'down',
        metin: 'geçen aya göre',
      },
    },
    {
      label: 'Net Bakiye',
      hedefDeger: veriler.netBakiye,
      icon: Wallet,
      gradientFrom: veriler.netBakiye >= 0 ? '#10b981' : '#ef4444',
      gradientTo: veriler.netBakiye >= 0 ? '#6366f1' : '#f87171',
      textColor: veriler.netBakiye >= 0
        ? 'text-accent-600 dark:text-accent-400'
        : 'text-danger-500 dark:text-danger-400',
      altSatir: null,
    },
    {
      label: 'Tasarruf Oranı',
      hedefDeger: veriler.tasarrufOrani,
      icon: PiggyBank,
      gradientFrom: '#6366f1',
      gradientTo: '#a855f7',
      textColor: 'text-primary-600 dark:text-primary-400',
      isCurrency: false,
      altSatir: {
        yuzde: '',
        yon: 'up',
        metin: 'Hedef: %20',
      },
    },
  ];

  // Limit aşan kategoriler
  const asimlar = Object.entries(budgetLimitler)
    .filter(([kat, limit]) => (buAyHarcamalar[kat] || 0) > limit)
    .map(([kategori, limit]) => ({ kategori, harcanan: buAyHarcamalar[kategori], limit }));

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-surface-700 dark:text-surface-200 mt-1">
          Mayıs 2025 finansal özetiniz
        </p>
      </div>

      {/* Limit aşım uyarı banner'ı */}
      <LimitBanner asimlar={asimlar} />

      {/* Finansal Sağlık Skoru */}
      <HealthScore islemler={rawIslemler} gelirler={rawGelirler} />

      {/* Harcama Kişiliği */}
      <PersonalityCard islemler={rawIslemler} />

      {/* 4 Özet Kart — mobilde 2×2, masaüstünde 4×1 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kartlar.map((k) => (
          <SummaryCard key={k.label} {...k} />
        ))}
      </div>

      {/* Grafikler — Pasta + Trend yan yana, Isı haritası altta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart islemler={rawIslemler} />
        <TrendLineChart islemler={rawIslemler} gelirler={rawGelirler} />
      </div>

      <HeatmapCalendar islemler={rawIslemler} />

      {/* Bütçe limiti çubukları */}
      <BudgetBars harcamalar={buAyHarcamalar} limitler={budgetLimitler} />
    </div>
  );
}
