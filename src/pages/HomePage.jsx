import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Wallet, Target,
  Leaf, Zap, ArrowUpRight, ArrowDownRight,
  Sparkles, Activity, ChevronRight, Clock,
  ShieldCheck, Flame
} from 'lucide-react';
import { getTransactions, getGoals, saveTransaction } from '../utils/storage';
import { calculateEcoScore } from '../utils/ecoScore';
import { calculatePrediction } from '../utils/predictive';
import TransactionModal from '../components/TransactionModal';

/* ─── Palette ─── */
const P = {
  purple: '#7C3AED',
  purpleLight: '#A78BFA',
  purpleDim: 'rgba(124,58,237,0.15)',
  purpleGlow: 'rgba(124,58,237,0.35)',
  green: '#10B981',
  greenDim: 'rgba(16,185,129,0.15)',
  red: '#EF4444',
  redDim: 'rgba(239,68,68,0.15)',
  amber: '#F59E0B',
  amberDim: 'rgba(245,158,11,0.15)',
  blue: '#3B82F6',
  bg0: '#050714',
  bg1: '#0D0F1E',
  bg2: '#141728',
  bg3: '#1C2038',
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(124,58,237,0.4)',
  text1: '#F1F5F9',
  text2: '#94A3B8',
  text3: '#64748B',
};

const PIE_COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

/* ─── Helpers ─── */
const fmt = (v) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v);

const fmtShort = (v) => {
  if (Math.abs(v) >= 1000) return `₺${(v / 1000).toFixed(1)}B`;
  return `₺${v}`;
};

/* ─── Micro-components ─── */
function GlowOrb({ color = P.purple, size = 320, top, left, right, bottom, opacity = 0.18 }) {
  return (
    <div style={{
      position: 'absolute',
      width: size, height: size,
      borderRadius: '50%',
      background: color,
      filter: `blur(${size * 0.38}px)`,
      opacity,
      top, left, right, bottom,
      pointerEvents: 'none',
      zIndex: 0,
    }} />
  );
}

function AnimNumber({ value, prefix = '', suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(target * ease));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span>{prefix}{display.toLocaleString('tr-TR')}{suffix}</span>;
}

function Pill({ children, color = P.purple, bg }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 999,
      background: bg || `${color}22`,
      color, fontSize: 10, fontWeight: 800,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      border: `1px solid ${color}33`,
    }}>
      {children}
    </span>
  );
}

function PulsingDot({ color = P.green }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: 8, height: 8 }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: color, opacity: 0.4,
        animation: 'ping 1.5s ease-out infinite',
      }} />
      <span style={{
        position: 'absolute', inset: 1, borderRadius: '50%',
        background: color,
      }} />
    </span>
  );
}

function GlassCard({ children, style = {}, hover = true, glow = false }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered && hover ? P.bg3 : P.bg2,
        border: `1px solid ${isHovered && hover ? P.borderHover : P.border}`,
        borderRadius: 20,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered && hover ? 'translateY(-2px)' : 'none',
        boxShadow: isHovered && glow ? `0 0 32px ${P.purpleGlow}` : '0 4px 24px rgba(0,0,0,0.4)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Custom Tooltip ─── */
function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: P.bg3, border: `1px solid ${P.border}`,
      borderRadius: 12, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: P.text2, marginBottom: 6, fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '2px 0', fontWeight: 600 }}>
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ label, value, icon: Icon, color, change, isCurrency = true, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const isPositive = change > 0;
  const numVal = Number(value) || 0;

  return (
    <GlassCard glow style={{
      padding: '22px 24px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(16px)',
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, background 0.3s, border 0.3s, box-shadow 0.3s`,
    }}>
      {/* Background gradient */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 100, height: 100, borderRadius: '50%',
        background: color, opacity: 0.08, filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: P.text3, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
            {label}
          </p>
          <p style={{ fontSize: 26, fontWeight: 800, color: P.text1, lineHeight: 1, marginBottom: 8 }}>
            {isCurrency ? (
              <><span style={{ fontSize: 16, fontWeight: 600, color: P.text2, marginRight: 2 }}>₺</span>
                <AnimNumber value={numVal} /></>
            ) : (
              <AnimNumber value={numVal} />
            )}
          </p>
          {change !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {isPositive
                ? <ArrowUpRight size={12} color={P.green} />
                : <ArrowDownRight size={12} color={P.red} />}
              <span style={{ fontSize: 12, color: isPositive ? P.green : P.red, fontWeight: 600 }}>
                {Math.abs(change)}% bu ay
              </span>
            </div>
          )}
        </div>
        <div style={{
          width: 46, height: 46, borderRadius: 14,
          background: `${color}22`,
          border: `1px solid ${color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </GlassCard>
  );
}

/* ─── Transaction Row ─── */
function TxRow({ tx, index, onClick }) {
  const isIncome = tx.type === 'income' || tx.tur === 'gelir';
  const amount = Math.abs(Number(tx.amount || tx.tutar || 0));
  const color = isIncome ? P.green : P.red;
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), index * 80); return () => clearTimeout(t); }, [index]);

  return (
    <div onClick={() => onClick && onClick(tx)} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderRadius: 14,
      background: vis ? P.bg3 : 'transparent',
      border: `1px solid ${vis ? P.border : 'transparent'}`,
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : 'translateX(-12px)',
      transition: `all 0.4s ease ${index * 80}ms`,
      cursor: 'pointer',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${color}0D`;
        e.currentTarget.style.borderColor = `${color}33`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = P.bg3;
        e.currentTarget.style.borderColor = P.border;
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          {isIncome ? '📈' : '📉'}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: P.text1, marginBottom: 2 }}>{tx.title || tx.baslik || 'İşlem'}</p>
          <p style={{ fontSize: 12, color: P.text3 }}>
            {tx.category || tx.kategori || 'Genel'} · {tx.date || tx.tarih || '—'}
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color }}>{isIncome ? '+' : '-'}{fmt(amount)}</p>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function HomePage() {
  const navigate = useNavigate();
  const [txRefresh, setTxRefresh] = useState(0);
  const transactions = getTransactions();
  const goals = getGoals();
  const ecoData = calculateEcoScore(transactions);
  const prediction = calculatePrediction(transactions);

  const [seciliIslem, setSeciliIslem] = useState(null);
  const [range, setRange] = useState('1Y');

  const handleKaydet = (form) => {
    saveTransaction(form);
    setSeciliIslem(null);
    setTxRefresh(r => r + 1);
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income' || t.tur === 'gelir')
    .reduce((s, t) => s + Math.abs(Number(t.amount || t.tutar || 0)), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense' || t.tur === 'gider' || (!t.tur && Number(t.tutar) < 0))
    .reduce((s, t) => s + Math.abs(Number(t.amount || t.tutar || 0)), 0);

  const balance = totalIncome - totalExpense;

  const categoryExpenses = transactions
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

  const filteredAreaData = (() => {
    if (range === '1A') return areaData.slice(-1);
    if (range === '3A') return areaData.slice(-3);
    if (range === '6A') return areaData.slice(-6);
    return areaData;
  })();

  const userName = localStorage.getItem('butceai_user_name') || 'Kullanıcı';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  const stats = [
    { label: 'Toplam Bakiye', value: balance, icon: Wallet, color: P.purple, change: 12.4 },
    { label: 'Gelirler', value: totalIncome, icon: TrendingUp, color: P.green, change: 8.1 },
    { label: 'Giderler', value: totalExpense, icon: TrendingDown, color: P.red, change: -3.2 },
    { label: 'Aktif Hedefler', value: goals.length, icon: Target, color: P.amber, isCurrency: false },
  ];

  const [headerVisible, setHeaderVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeaderVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <>
      {/* Global keyframes */}
      <style>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.8; }
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        .butce-scroll::-webkit-scrollbar { width: 4px; }
        .butce-scroll::-webkit-scrollbar-track { background: transparent; }
        .butce-scroll::-webkit-scrollbar-thumb { background: ${P.border}; border-radius: 999px; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: P.bg0,
        color: P.text1,
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient background orbs */}
        <GlowOrb color={P.purple} size={600} top={-150} left={-200} opacity={0.14} />
        <GlowOrb color={P.blue} size={400} top={200} right={-150} opacity={0.1} />
        <GlowOrb color={P.green} size={300} bottom={100} left={100} opacity={0.08} />

        {/* Subtle grid texture */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>

          {/* ── HERO HEADER ── */}
          <div style={{
            marginBottom: 32,
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'none' : 'translateY(-16px)',
            transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <GlassCard hover={false} style={{ padding: '32px 36px', overflow: 'visible' }}>
              {/* Animated gradient border top */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${P.purple}, ${P.blue}, ${P.green}, ${P.purple})`,
                backgroundSize: '300% 100%',
                animation: 'gradientShift 4s ease infinite',
                borderRadius: '20px 20px 0 0',
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <PulsingDot color={P.green} />
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: P.text3 }}>
                      Canlı Finans Kokpiti
                    </span>
                  </div>

                  <h1 style={{
                    fontSize: 'clamp(28px, 4vw, 52px)',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    marginBottom: 12,
                    letterSpacing: '-0.02em',
                  }}>
                    {greeting},{' '}
                    <span style={{
                      background: `linear-gradient(135deg, ${P.purpleLight} 0%, #EC4899 50%, ${P.purpleLight} 100%)`,
                      backgroundSize: '200% 100%',
                      animation: 'gradientShift 3s ease infinite',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      {userName}
                    </span>
                    <br />
                    <span style={{ color: P.text1 }}>paranı daha net gör.</span>
                  </h1>

                  <p style={{ fontSize: 15, color: P.text2, maxWidth: 480, lineHeight: 1.7 }}>
                    Harcamalar, hedefler, raporlar ve AI içgörüleri tek bir akıcı deneyimde.
                  </p>
                </div>

                {/* Status badges */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
                  {[
                    { icon: Zap, label: 'AI Motor', value: 'Aktif', color: P.purple },
                    { icon: Activity, label: 'OCR Tarama', value: 'Hazır', color: P.green },
                    { icon: ShieldCheck, label: 'Sunum Modu', value: 'Demo', color: P.amber },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: P.bg3,
                      border: `1px solid ${P.border}`,
                      borderRadius: 12, padding: '10px 14px',
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={16} color={color} />
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: P.text3, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
                        <p style={{ fontSize: 13, color: P.text1, fontWeight: 700 }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* ── STAT CARDS ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}>
            {stats.map((s, i) => (
              <StatCard key={s.label} {...s} delay={200 + i * 80} />
            ))}
          </div>

          {/* ── AI BANNERS ROW ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

            {/* Zaman Makinesi */}
            <div style={{ position: 'relative', borderRadius: 20, padding: 1, background: `linear-gradient(135deg, #7C3AED, #3B82F6, #7C3AED)`, backgroundSize: '200%', animation: 'gradientShift 4s ease infinite' }}>
              <GlassCard hover={false} style={{ padding: '24px 28px', borderRadius: 19, border: 'none', background: P.bg1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 16,
                    background: `${P.purple}22`, border: `1px solid ${P.purple}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, animation: 'float 3s ease-in-out infinite',
                  }}>🔮</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: P.text1 }}>Bütçe Zaman Makinesi</h3>
                    </div>
                    <Pill color={P.purpleLight}><Sparkles size={8} /> AI Tahmini</Pill>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: P.text2, lineHeight: 1.75, marginBottom: 20 }}>
                  {prediction.advice}
                </p>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{
                    flex: 1, background: P.bg3, borderRadius: 12,
                    padding: '12px 16px', textAlign: 'center',
                    border: `1px solid ${P.border}`,
                  }}>
                    <p style={{ fontSize: 10, color: P.text3, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                      Tahmini Bakiye
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: prediction.isWarning ? P.red : P.green }}>
                      {prediction.isWarning ? '' : '+'}{fmt(prediction.predictedBalance)}
                    </p>
                  </div>
                  <button style={{
                    flex: 2, borderRadius: 12, border: 'none',
                    background: `linear-gradient(135deg, ${P.purple}, #4F46E5)`,
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'opacity 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    Tavsiye Al <ChevronRight size={14} />
                  </button>
                </div>
              </GlassCard>
            </div>

            {/* Eco Score */}
            <div style={{
              position: 'relative', borderRadius: 20, padding: 1,
              background: ecoData.status === 'excellent'
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : ecoData.status === 'good'
                  ? 'linear-gradient(135deg, #3B82F6, #10B981)'
                  : 'linear-gradient(135deg, #F59E0B, #EF4444)',
            }}>
              <GlassCard hover={false} style={{ padding: '24px 28px', borderRadius: 19, border: 'none', background: P.bg1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 16,
                    background: `${P.green}22`, border: `1px solid ${P.green}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'float 3.5s ease-in-out infinite',
                  }}>
                    <Leaf size={22} color={P.green} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: P.text1, marginBottom: 4 }}>ESG & Karbon Ayak İzi</h3>
                    <Pill color={P.green}>Sürdürülebilir Bütçe</Pill>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: P.text2, lineHeight: 1.75, marginBottom: 20 }}>
                  {ecoData.message}
                </p>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{
                    flex: 1, background: P.bg3, borderRadius: 12,
                    padding: '12px 16px', textAlign: 'center',
                    border: `1px solid ${P.border}`,
                  }}>
                    <p style={{ fontSize: 10, color: P.text3, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                      Aylık Karbon
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: P.green }}>
                      {ecoData.footprint} kg CO₂
                    </p>
                  </div>
                  <button style={{
                    flex: 2, borderRadius: 12,
                    border: `1px solid ${P.border}`,
                    background: 'transparent',
                    color: P.text1, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${P.green}15`; e.currentTarget.style.borderColor = `${P.green}40`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = P.border; }}>
                    Yeşil Öneriler <ChevronRight size={14} />
                  </button>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* ── BALANCE AREA CHART ── */}
          <GlassCard style={{ padding: '28px 32px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: P.text1, marginBottom: 4 }}>Bakiye Trendi</h2>
                <p style={{ fontSize: 13, color: P.text3 }}>Son 12 aylık bakiye gelişimi</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['1A', '3A', '6A', '1Y'].map((t) => (
                  <button 
                    key={t} 
                    onClick={() => setRange(t)}
                    style={{
                      padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                      border: `1px solid ${range === t ? P.purple : P.border}`,
                      background: range === t ? P.purpleDim : 'transparent',
                      color: range === t ? P.purpleLight : P.text3,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={filteredAreaData} margin={{ top: 5, right: 5, bottom: 0, left: 10 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={P.purple} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={P.purple} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: P.text3, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: P.text3, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                <Tooltip content={<CustomTooltip formatter={fmt} />} />
                <Area type="monotone" dataKey="bakiye" stroke={P.purple} strokeWidth={2.5}
                  fill="url(#balanceGrad)" dot={false}
                  activeDot={{ r: 5, fill: P.purple, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* ── CHARTS ROW ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>

            {/* Bar Chart */}
            <GlassCard style={{ padding: '28px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: P.text1, marginBottom: 4 }}>Haftalık Gelir / Gider</h2>
                  <p style={{ fontSize: 13, color: P.text3 }}>Bu haftaki finansal akış</p>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[{ color: P.purple, label: 'Gelir' }, { color: P.red, label: 'Gider' }].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                      <span style={{ fontSize: 12, color: P.text3, fontWeight: 600 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} barGap={6} margin={{ top: 0, right: 0, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: P.text3, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: P.text3, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                  <Tooltip content={<CustomTooltip formatter={fmt} />} />
                  <Bar dataKey="gelir" name="Gelir" fill={P.purple} radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="gider" name="Gider" fill={P.red} radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>

            {/* Donut Pie */}
            <GlassCard style={{ padding: '28px 24px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: P.text1, marginBottom: 4 }}>Harcama Dağılımı</h2>
              <p style={{ fontSize: 13, color: P.text3, marginBottom: 20 }}>Kategoriye göre</p>

              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                        paddingAngle={4} dataKey="value" strokeWidth={0}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip formatter={fmt} />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    {pieData.slice(0, 4).map((entry, i) => (
                      <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span style={{ fontSize: 12, color: P.text2 }}>{entry.name}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: P.text1 }}>{fmt(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: P.text3, fontSize: 13 }}>
                  Henüz harcama verisi yok.<br />İşlem ekleyerek başla.
                </div>
              )}
            </GlassCard>
          </div>

          {/* ── GOALS PROGRESS + TRANSACTIONS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16, marginBottom: 32 }}>

            {/* Goals */}
            <GlassCard style={{ padding: '28px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: P.text1 }}>Hedefler</h2>
                <Pill color={P.amber}><Flame size={8} /> {goals.length} Aktif</Pill>
              </div>

              {goals.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {goals.slice(0, 4).map((g, i) => {
                    const current = Number(g.current || g.mevcut || 0);
                    const target = Number(g.target || g.hedef || 1);
                    const pct = Math.min((current / target) * 100, 100);
                    const goalColors = [P.purple, P.green, P.amber, P.blue];
                    const gc = goalColors[i % goalColors.length];
                    return (
                      <div key={g.id || i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: P.text1 }}>{g.title || g.baslik || `Hedef ${i + 1}`}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: gc }}>{Math.round(pct)}%</span>
                        </div>
                        <div style={{ background: P.bg3, borderRadius: 999, height: 6, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 999, background: gc,
                            width: `${pct}%`, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                            boxShadow: `0 0 8px ${gc}60`,
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                          <span style={{ fontSize: 11, color: P.text3 }}>{fmt(current)}</span>
                          <span style={{ fontSize: 11, color: P.text3 }}>{fmt(target)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0', color: P.text3 }}>
                  <Target size={32} color={P.text3} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 13 }}>Henüz hedef eklenmedi.</p>
                </div>
              )}
            </GlassCard>

            {/* Transactions */}
            <GlassCard style={{ padding: '28px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: P.text1 }}>Son İşlemler</h2>
                <button 
                  onClick={() => navigate('/transactions')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 600, color: P.purpleLight,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  Tümünü Gör <ChevronRight size={14} />
                </button>
              </div>

              {transactions.length > 0 ? (
                <div className="butce-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                  {transactions.slice(0, 6).map((tx, i) => (
                    <TxRow key={tx.id || i} tx={tx} index={i} onClick={setSeciliIslem} />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: P.text3 }}>
                  <Clock size={32} color={P.text3} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 13 }}>Henüz işlem bulunmuyor.</p>
                  <p style={{ fontSize: 12, marginTop: 4 }}>İlk işlemini ekleyerek başla.</p>
                </div>
              )}
            </GlassCard>
          </div>

        </div>
      </div>
      
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