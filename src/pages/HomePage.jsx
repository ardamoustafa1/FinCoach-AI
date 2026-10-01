/**
 * FinCoach AI — Ana Sayfa (Finans Kokpiti)
 * ────────────────────────────────────────────────────────────────
 * Sıfırdan tasarlandı: sinematik hero, scroll koreografisi, çizilerek
 * gelen grafikler. Tüm mevcut özellikler korunmuştur:
 *  hero + WhatsApp testi + durum rozetleri · 4 KPI · Bütçe Zaman Makinesi ·
 *  ESG/karbon · bakiye trendi · haftalık gelir-gider · harcama dağılımı ·
 *  hedefler · son işlemler · FinCoach Ligi · işlem düzenleme modalı.
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Wallet, Target,
  Leaf, Zap, Sparkles, Activity, ChevronRight, Clock,
  ShieldCheck, Trophy, Users, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import useStore from '../store/useStore';
import { calculateEcoScore } from '../utils/ecoScore';
import { calculatePrediction } from '../utils/predictive';
import TransactionModal from '../components/TransactionModal';
import SkeletonLoader from '../components/SkeletonLoader';
import { useToast } from '../hooks/useToast';
import { P, SERIES } from '../styles/palette';
import { Reveal, Counter, Magnetic, Aurora } from '../components/motion';
import { useInView } from '../components/motion/engine';
import {
  GlassCard,
  TransactionRow,
  GoalProgressCard,
  ChartTooltip,
  BalanceTrendChart,
} from '../components/dashboard';

/* ─── Yardımcılar ─── */
const fmt = (v) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v);

const fmtShort = (v) => {
  if (Math.abs(v) >= 1000) return `₺${(v / 1000).toFixed(1)}B`;
  return `₺${v}`;
};

const WHATSAPP_BOT_NUMBER = (import.meta.env.VITE_WHATSAPP_BOT_NUMBER || '905070271251').replace(/\D/g, '');
const WHATSAPP_TEST_TEXT = 'Merhaba FinCoach AI, Migros harcamamı test için 125 TL olarak kaydet.';
const WHATSAPP_TEST_URL = `https://wa.me/${WHATSAPP_BOT_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEST_TEXT)}`;

/* ─── Küçük parçalar ─── */

function Pill({ children, color = P.accent }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999,
      background: `${color}14`, border: `1px solid ${color}30`,
      color, fontSize: 9.5, fontWeight: 600,
      letterSpacing: '0.16em', textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

function PulsingDot({ color = P.green }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: 7, height: 7, flexShrink: 0 }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: color, opacity: 0.45, animation: 'ping 2s ease-out infinite',
      }} />
      <span style={{ position: 'absolute', inset: 1, borderRadius: '50%', background: color }} />
    </span>
  );
}

/** Başlığı kelime kelime akıtır. */
function WordsIn({ text, delay = 0, step = 62, color }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 40);
    return () => clearTimeout(t);
  }, []);
  return String(text).split(' ').map((w, i) => (
    <span className="split-word" key={`${w}-${i}`}>
      <span style={{
        '--w-delay': `${delay + i * step}ms`,
        transform: on ? 'translateY(0)' : 'translateY(112%)',
        opacity: on ? 1 : 0,
        color,
      }}>
        {w}{' '}
      </span>
    </span>
  ));
}

/** Çizilerek gelen mini sparkline. */
function Sparkline({ points, color, height = 34 }) {
  const [ref, inView] = useInView();
  const w = 120;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const gradId = `spark-${color.replace('#', '')}`;
  const d = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (points.length - 1)) * w} ${height - ((v - min) / span) * (height - 4) - 2}`)
    .join(' ');

  return (
    <svg ref={ref} viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.26" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L ${w} ${height} L 0 ${height} Z`}
        fill={`url(#${gradId})`}
        opacity={inView ? 1 : 0}
        style={{ transition: 'opacity .9s ease .5s' }}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 340,
          strokeDashoffset: inView ? 0 : 340,
          transition: 'stroke-dashoffset 1.7s cubic-bezier(0.16,1,0.3,1) .25s',
        }}
      />
    </svg>
  );
}

/** Premium KPI kartı — sayaç, delta, sparkline, spot ışığı. */
function KpiCard({ label, value, icon: Icon, color, change, isCurrency = true, spark, delay = 0 }) {
  const positive = (change ?? 0) >= 0;

  return (
    <div
      className="glass-card spotlight conic-ring"
      style={{ padding: '22px 24px 18px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 158 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
    >
      <div style={{
        position: 'absolute', top: -50, right: -50, width: 140, height: 140, borderRadius: '50%',
        background: color, opacity: 0.08, filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <p className="eyebrow" style={{ fontSize: 9.5, letterSpacing: '0.2em' }}>{label}</p>
        <span style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: `${color}14`, border: `1px solid ${color}30`,
          display: 'grid', placeItems: 'center',
        }}>
          <Icon size={15} color={color} strokeWidth={1.8} />
        </span>
      </div>

      <div>
        <p className="num kpi-underline is-in" style={{
          fontSize: 27, color: 'var(--text-primary)', lineHeight: 1, display: 'inline-block',
        }}>
          {isCurrency && <span style={{ fontSize: 16, color: 'var(--text-muted)', marginRight: 3 }}>₺</span>}
          <Counter to={Number(value) || 0} duration={1800 + delay} />
        </p>
        {change !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12 }}>
            {positive
              ? <ArrowUpRight size={12} color={P.green} strokeWidth={2.4} />
              : <ArrowDownRight size={12} color={P.red} strokeWidth={2.4} />}
            <span className="num" style={{ fontSize: 11.5, color: positive ? P.green : P.red }}>
              {Math.abs(change)}%
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>bu ay</span>
          </div>
        )}
      </div>

      {spark && (
        <div style={{ marginTop: 'auto', marginInline: -4, opacity: 0.9 }}>
          <Sparkline points={spark} color={color} />
        </div>
      )}
    </div>
  );
}

/** Bölüm başlığı — numaralı, ince kurallı. */
function SectionHead({ index, title, action }) {
  return (
    <Reveal variant="fade">
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 18, flexWrap: 'wrap', marginBottom: 18,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <span className="num" style={{ fontSize: 10.5, color: P.green }}>{index}</span>
          <span style={{ width: 26, height: 1, background: 'var(--hairline)' }} />
          <h2 className="eyebrow" style={{ fontSize: 10, letterSpacing: '0.22em' }}>{title}</h2>
        </div>
        {action}
      </div>
    </Reveal>
  );
}

/* ─── Sayfa ─── */
export default function HomePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const transactions = useStore(state => state.transactions);
  const goals = useStore(state => state.goals);
  const ecoData = calculateEcoScore(transactions);
  const prediction = calculatePrediction(transactions);

  const [seciliIslem, setSeciliIslem] = useState(null);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setChartsReady(true), 500);
    return () => clearTimeout(t);
  }, []);

  const handleKaydet = (form) => {
    useStore.getState().addTransaction(form);
    setSeciliIslem(null);
  };

  const shareLeagueInvite = async () => {
    const text = "Seni FinCoach Ligi'ne davet ediyorum! Kim daha çok tasarruf edecek görelim 🏆 #FinCoachAI";
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Davet bağlantısı kopyalandı ve WhatsApp açılıyor.');
    } catch {
      // pano erişimi yoksa sessizce geç
    }
  };

  const safeTx = useMemo(() => (transactions || []).filter(Boolean), [transactions]);

  const totalIncome = safeTx
    .filter(t => t.type === 'income' || t.tur === 'gelir')
    .reduce((s, t) => s + Math.abs(Number(t.amount || t.tutar || 0)), 0);

  const totalExpense = safeTx
    .filter(t => t.type === 'expense' || t.tur === 'gider' || (!t.tur && Number(t.tutar) < 0))
    .reduce((s, t) => s + Math.abs(Number(t.amount || t.tutar || 0)), 0);

  const balance = totalIncome - totalExpense;

  const categoryExpenses = safeTx
    .filter(t => t.type === 'expense' || t.tur === 'gider' || (!t.tur && Number(t.tutar) < 0))
    .reduce((acc, t) => {
      const cat = t.category || t.kategori || 'Diğer';
      acc[cat] = (acc[cat] || 0) + Math.abs(Number(t.amount || t.tutar || 0));
      return acc;
    }, {});

  const pieData = Object.entries(categoryExpenses).map(([name, value]) => ({ name, value }));

  const barData = [
    { day: 'Pzt', gelir: 8000, gider: 3200 },
    { day: 'Sal', gelir: 2000, gider: 1500 },
    { day: 'Çar', gelir: 0, gider: 890 },
    { day: 'Per', gelir: 12000, gider: 650 },
    { day: 'Cum', gelir: 0, gider: 1800 },
    { day: 'Cmt', gelir: 15000, gider: 2350 },
    { day: 'Paz', gelir: 0, gider: 149 },
  ];

  const areaData = [
    { month: 'Oca', bakiye: 4200 }, { month: 'Şub', bakiye: 6800 },
    { month: 'Mar', bakiye: 5100 }, { month: 'Nis', bakiye: 8900 },
    { month: 'May', bakiye: 7400 }, { month: 'Haz', bakiye: 11200 },
    { month: 'Tem', bakiye: 9800 }, { month: 'Ağu', bakiye: 13500 },
    { month: 'Eyl', bakiye: 12100 }, { month: 'Eki', bakiye: 15800 },
    { month: 'Kas', bakiye: 14200 }, { month: 'Ara', bakiye: 18600 },
  ];

  const userName = useStore(state => state.userProfile?.name) || 'Kullanıcı';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  const kpis = [
    { label: 'Toplam Bakiye', value: balance, icon: Wallet, color: P.accentDeep, change: 12.4, spark: [8, 12, 9, 15, 13, 19, 17, 23] },
    { label: 'Gelirler', value: totalIncome, icon: TrendingUp, color: P.green, change: 8.1, spark: [5, 9, 8, 14, 12, 16, 20, 24] },
    { label: 'Giderler', value: totalExpense, icon: TrendingDown, color: P.red, change: -3.2, spark: [18, 15, 17, 12, 14, 11, 12, 9] },
    { label: 'Aktif Hedefler', value: goals.length, icon: Target, color: P.blue, isCurrency: false, spark: [1, 1, 2, 2, 3, 3, 3, 4] },
  ];

  const statusBadges = [
    { icon: Zap, label: 'AI Motor', value: 'Aktif', color: P.green },
    { icon: Activity, label: 'OCR Tarama', value: 'Hazır', color: P.blue },
    { icon: ShieldCheck, label: 'Sunum Modu', value: 'Demo', color: P.accentDeep },
  ];

  return (
    <>
      <div style={{ position: 'relative', paddingBottom: 56 }}>

        {/* ══════════ HERO ══════════ */}
        <section style={{
          position: 'relative',
          padding: 'clamp(36px, 6vw, 72px) 0 clamp(28px, 4vw, 44px)',
          overflow: 'hidden',
          isolation: 'isolate',
        }}>
          <Aurora color="rgba(52,192,138,0.16)" size={520} top="-46%" left="-12%" duration={22} />
          <Aurora color="rgba(110,147,196,0.12)" size={420} top="-20%" right="4%" duration={27} delay={3} />
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none',
            backgroundImage:
              'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            color: 'var(--text-primary)', opacity: 0.035,
            maskImage: 'radial-gradient(ellipse 80% 100% at 20% 0%, #000 10%, transparent 74%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 100% at 20% 0%, #000 10%, transparent 74%)',
          }} />

          <div className="home-hero-grid" style={{
            display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 0.72fr)',
            gap: 'clamp(24px, 4vw, 56px)', alignItems: 'center',
          }}>

            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24,
                padding: '7px 14px 7px 11px', borderRadius: 999,
                border: '1px solid var(--border-color)', background: 'var(--bg-surface)',
                animation: 'fade-in-up .8s var(--ease-out-expo) both',
              }}>
                <PulsingDot color={P.green} />
                <span className="eyebrow" style={{ fontSize: 9.5, letterSpacing: '0.2em' }}>Canlı Finans Kokpiti</span>
              </div>

              <h1 className="display" style={{
                fontSize: 'clamp(32px, 5vw, 62px)',
                color: 'var(--text-primary)',
                marginBottom: 20,
              }}>
                <WordsIn text={`${greeting},`} />
                <WordsIn text={userName} delay={140} color={P.green} />
                <br />
                <span style={{ fontWeight: 300, color: 'var(--text-muted)' }}>
                  <WordsIn text="paranı daha net gör." delay={300} />
                </span>
              </h1>

              <p style={{
                fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)',
                maxWidth: 460, marginBottom: 30,
                animation: 'fade-in-up .9s var(--ease-out-expo) .55s both',
              }}>
                Harcamalar, hedefler, raporlar ve yapay zekâ içgörüleri tek bir akıcı deneyimde.
              </p>

              <div style={{
                display: 'flex', gap: 12, flexWrap: 'wrap',
                animation: 'fade-in-up .9s var(--ease-out-expo) .68s both',
              }}>
                <Magnetic strength={0.24}>
                  <a href={WHATSAPP_TEST_URL} target="_blank" rel="noopener noreferrer" className="btn-jade" style={{ textDecoration: 'none' }}>
                    WhatsApp&apos;tan test et
                    <ArrowUpRight size={15} />
                  </a>
                </Magnetic>
                <Magnetic strength={0.18}>
                  <button
                    className="btn-ghost"
                    style={{ padding: '13px 22px', fontSize: 13.5 }}
                    onClick={() => navigate('/transactions')}
                  >
                    İşlemleri gör
                  </button>
                </Magnetic>
              </div>
            </div>

            {/* Durum rozetleri */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {statusBadges.map(({ icon: Icon, label, value, color }, i) => (
                <div
                  key={label}
                  className="glass-card spotlight"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 13,
                    padding: '13px 16px', borderRadius: 14,
                    animation: `fade-in-up .85s var(--ease-out-expo) ${0.35 + i * 0.11}s both`,
                  }}
                  onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
                    e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
                  }}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: `${color}14`, border: `1px solid ${color}30`,
                    display: 'grid', placeItems: 'center',
                  }}>
                    <Icon size={15} color={color} strokeWidth={1.8} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p className="eyebrow" style={{ fontSize: 8.5, letterSpacing: '0.18em', marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ KPI ŞERİDİ ══════════ */}
        <SectionHead index="01" title="Genel Bakış" />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(232px, 100%), 1fr))',
          gap: 14, marginBottom: 46,
        }}>
          {!chartsReady
            ? <SkeletonLoader.CardGrid count={4} />
            : kpis.map((k, i) => <KpiCard key={k.label} {...k} delay={i * 90} />)}
        </div>

        {/* ══════════ AI İÇGÖRÜLERİ ══════════ */}
        <SectionHead index="02" title="Yapay Zekâ İçgörüleri" />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
          gap: 14, marginBottom: 46,
        }}>
          {/* Bütçe Zaman Makinesi */}
          <div className="glass-card conic-ring spotlight" style={{ padding: '26px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <span className="float-slow" style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: `${P.blue}14`, border: `1px solid ${P.blue}30`,
                display: 'grid', placeItems: 'center', fontSize: 20,
              }}>🔮</span>
              <div>
                <h3 style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Bütçe Zaman Makinesi
                </h3>
                <Pill color={P.blue}><Sparkles size={9} /> AI Tahmini</Pill>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 22, minHeight: 46 }}>
              {prediction.advice}
            </p>

            <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', flexWrap: 'wrap' }}>
              <div style={{
                flex: '1 1 150px', borderRadius: 13, padding: '13px 16px',
                background: 'var(--bg-surface-soft)', border: '1px solid var(--border-color)',
              }}>
                <p className="eyebrow" style={{ fontSize: 8.5, letterSpacing: '0.18em', marginBottom: 6 }}>Tahmini Bakiye</p>
                <p className="num" style={{ fontSize: 17, color: prediction.isWarning ? P.red : P.green }}>
                  {prediction.isWarning ? '' : '+'}{fmt(prediction.predictedBalance)}
                </p>
              </div>
              <button
                onClick={() => navigate('/chat', { state: { message: 'Gelecek ay sonunda artıda kapatmak için bana özel bir tasarruf planı hazırlar mısın?' } })}
                className="btn-ghost"
                style={{ flex: '1 1 150px', padding: '13px 16px', fontSize: 13 }}
              >
                Tavsiye al <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* ESG & Karbon */}
          <div className="glass-card conic-ring spotlight" style={{ padding: '26px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <span className="float-slow" style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: `${P.green}14`, border: `1px solid ${P.green}30`,
                display: 'grid', placeItems: 'center', animationDelay: '.6s',
              }}>
                <Leaf size={20} color={P.green} strokeWidth={1.8} />
              </span>
              <div>
                <h3 style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  ESG &amp; Karbon Ayak İzi
                </h3>
                <Pill color={P.green}>Sürdürülebilir Bütçe</Pill>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 22, minHeight: 46 }}>
              {ecoData.message}
            </p>

            <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', flexWrap: 'wrap' }}>
              <div style={{
                flex: '1 1 150px', borderRadius: 13, padding: '13px 16px',
                background: 'var(--bg-surface-soft)', border: '1px solid var(--border-color)',
              }}>
                <p className="eyebrow" style={{ fontSize: 8.5, letterSpacing: '0.18em', marginBottom: 6 }}>Aylık Karbon</p>
                <p className="num" style={{ fontSize: 17, color: P.green }}>{ecoData.footprint} kg CO₂</p>
              </div>
              <button
                onClick={() => navigate('/chat', { state: { message: 'Karbon ayak izimi düşürmek için harcamalarımda ne gibi değişiklikler yapabilirim? Yeşil önerilerini bekliyorum.' } })}
                className="btn-ghost"
                style={{ flex: '1 1 150px', padding: '13px 16px', fontSize: 13 }}
              >
                Yeşil öneriler <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ══════════ BAKİYE TRENDİ ══════════ */}
        <SectionHead index="03" title="Bakiye Trendi" />
        <div className="draw-in" style={{ marginBottom: 46 }}>
          {!chartsReady ? (
            <GlassCard hover={false} style={{ padding: '28px 32px' }}>
              <SkeletonLoader.Chart height={220} />
            </GlassCard>
          ) : (
            <BalanceTrendChart data={areaData} />
          )}
        </div>

        {/* ══════════ GRAFİKLER ══════════ */}
        <SectionHead index="04" title="Akış ve Dağılım" />
        <div className="chart-grid-2col" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
          gap: 14, marginBottom: 46,
        }}>
          {/* Haftalık bar */}
          <div className="glass-card draw-in" style={{ padding: '26px 28px' }}>
            {!chartsReady ? <SkeletonLoader.Chart height={240} /> : (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 5 }}>Haftalık Gelir / Gider</h3>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Bu haftaki finansal akış</p>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {[{ color: P.green, label: 'Gelir' }, { color: P.red, label: 'Gider' }].map(({ color, label }) => (
                      <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 3, background: color }} />
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{label}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240} minHeight={240}>
                  <BarChart data={barData} barGap={6} margin={{ top: 0, right: 0, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<ChartTooltip formatter={fmt} />} />
                    <Bar dataKey="gelir" name="Gelir" fill={P.green} radius={[5, 5, 0, 0]} maxBarSize={30} isAnimationActive={false} />
                    <Bar dataKey="gider" name="Gider" fill={P.red} radius={[5, 5, 0, 0]} maxBarSize={30} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>

          {/* Donut */}
          <div className="glass-card draw-in" style={{ padding: '26px 26px' }}>
            {!chartsReady ? <SkeletonLoader.Pie size={160} /> : (
              <>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 5 }}>Harcama Dağılımı</h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 18 }}>Kategoriye göre</p>

                {pieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={180} minHeight={180}>
                      <PieChart>
                        <Pie
                          data={pieData} cx="50%" cy="50%" innerRadius={54} outerRadius={78}
                          paddingAngle={3} dataKey="value" strokeWidth={0} isAnimationActive={false}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={entry.name} fill={SERIES[i % SERIES.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip formatter={fmt} />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="stagger-rows" style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
                      {pieData.slice(0, 4).map((entry, i) => (
                        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: SERIES[i % SERIES.length], flexShrink: 0 }} />
                            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
                          </span>
                          <span className="num" style={{ fontSize: 12, color: 'var(--text-primary)', flexShrink: 0 }}>{fmt(entry.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                    Henüz harcama verisi yok.<br />İşlem ekleyerek başla.
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ══════════ HEDEFLER + İŞLEMLER ══════════ */}
        <SectionHead index="05" title="Hedefler ve Hareketler" />
        <div className="chart-grid-2col" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
          gap: 14, marginBottom: 46,
        }}>
          {/* Hedefler */}
          <div className="glass-card" style={{ padding: '26px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>Hedefler</h3>
              <Pill color={P.green}>{goals.length} Aktif</Pill>
            </div>

            {!chartsReady ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <SkeletonLoader.Text width="40%" height={14} style={{ marginBottom: 8 }} />
                    <SkeletonLoader width="100%" height={6} borderRadius={999} />
                  </div>
                ))}
              </div>
            ) : goals.length > 0 ? (
              <div className="stagger-rows" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {goals.slice(0, 4).map((g, i) => (
                  <GoalProgressCard key={g.id || i} goal={g} colorIndex={i} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <Target size={30} strokeWidth={1.5} style={{ marginBottom: 10, opacity: 0.6 }} />
                <p style={{ fontSize: 13 }}>Henüz hedef eklenmedi.</p>
              </div>
            )}
          </div>

          {/* Son işlemler */}
          <div className="glass-card" style={{ padding: '26px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>Son İşlemler</h3>
              <button
                onClick={() => navigate('/transactions')}
                className="link-underline"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 12.5, fontWeight: 500, color: P.green,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit',
                }}
              >
                Tümünü gör <ChevronRight size={14} />
              </button>
            </div>

            {!chartsReady ? (
              <SkeletonLoader.Row count={4} />
            ) : safeTx.length > 0 ? (
              <div className="stagger-rows butce-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                {safeTx.slice(0, 6).map((tx, i) => (
                  <TransactionRow key={tx.id || i} tx={tx} index={i} onClick={setSeciliIslem} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <Clock size={30} strokeWidth={1.5} style={{ marginBottom: 10, opacity: 0.6 }} />
                <p style={{ fontSize: 13 }}>Henüz işlem bulunmuyor.</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>İlk işlemini ekleyerek başla.</p>
              </div>
            )}
          </div>
        </div>

        {/* ══════════ FİNCOACH LİGİ ══════════ */}
        <SectionHead index="06" title="Mahalle Rekabeti" />
        <div className="glass-card" style={{ padding: '28px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, marginBottom: 26, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{
                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                background: `${P.amber}14`, border: `1px solid ${P.amber}30`,
                display: 'grid', placeItems: 'center',
              }}>
                <Trophy size={19} color={P.amber} strokeWidth={1.8} />
              </span>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  FinCoach Ligi
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                  Arkadaşlarını davet et, tasarruf yarışını başlat.
                </p>
              </div>
            </div>
            <Magnetic strength={0.2}>
              <button onClick={shareLeagueInvite} className="btn-ghost" style={{ padding: '12px 20px', fontSize: 13 }}>
                <Users size={15} /> Rakip davet et
              </button>
            </Magnetic>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 14 }}>
            {[
              { name: 'Sen', tag: 'Tasarruf Lideri', tagColor: P.green, emoji: '😎', pct: 34, color: P.green, note: 'Aylık hedefine göre tasarruf oranın.' },
              { name: 'Can (Arkadaşın)', tag: 'Sınırda Geziyor', tagColor: P.red, emoji: '🙃', pct: 12, color: P.slate, note: 'Can bu ay gereksiz çok harcadı.' },
            ].map((row) => (
              <div key={row.name} style={{
                position: 'relative', overflow: 'hidden',
                borderRadius: 16, padding: '20px 22px',
                background: 'var(--bg-surface-soft)',
                border: `1px solid ${row.color}26`,
              }}>
                <span style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: row.color }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <span style={{
                      width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                      background: `${row.color}14`, display: 'grid', placeItems: 'center', fontSize: 17,
                    }}>{row.emoji}</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</p>
                      <p style={{ fontSize: 11, color: row.tagColor, fontWeight: 500, marginTop: 2 }}>{row.tag}</p>
                    </div>
                  </div>
                  <span className="num" style={{ fontSize: 21, color: row.color, flexShrink: 0 }}>%{row.pct}</span>
                </div>
                <div style={{ background: 'var(--hairline)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                  <div className="fill-bar" style={{ height: '100%', width: `${row.pct}%`, background: row.color, borderRadius: 999 }} />
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 12 }}>{row.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .butce-scroll::-webkit-scrollbar { width: 4px; }
        .butce-scroll::-webkit-scrollbar-track { background: transparent; }
        .butce-scroll::-webkit-scrollbar-thumb { background: var(--hairline); border-radius: 999px; }
        @media (max-width: 900px) {
          .home-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {seciliIslem && (
        <TransactionModal
          islem={seciliIslem}
          onKapat={() => setSeciliIslem(null)}
          onKaydet={handleKaydet}
        />
      )}
    </>
  );
}
