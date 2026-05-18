import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Wallet, Target,
  Leaf, Zap,
  Sparkles, Activity, ChevronRight, Clock,
  ShieldCheck, Flame, Trophy, Users
} from 'lucide-react';
import useStore from '../store/useStore';
import { calculateEcoScore } from '../utils/ecoScore';
import { calculatePrediction } from '../utils/predictive';
import TransactionModal from '../components/TransactionModal';
import SkeletonLoader from '../components/SkeletonLoader';
import { useToast } from '../hooks/useToast';
import { P } from '../styles/palette';
// ── Atomik Dashboard Bileşenleri (src/components/dashboard/) ──
import {
  GlowOrb,
  GlassCard,
  StatCard,
  TransactionRow,
  GoalProgressCard,
  ChartTooltip,
  BalanceTrendChart,
} from '../components/dashboard';

/* ─── Palette ─── */

const PIE_COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

/* ─── Helpers ─── */
const fmt = (v) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v);

const fmtShort = (v) => {
  if (Math.abs(v) >= 1000) return `₺${(v / 1000).toFixed(1)}B`;
  return `₺${v}`;
};

const WHATSAPP_BOT_NUMBER = (import.meta.env.VITE_WHATSAPP_BOT_NUMBER || '905070271251').replace(/\D/g, '');
const WHATSAPP_TEST_TEXT = 'Merhaba FinCoach AI, Migros harcamamı test için 125 TL olarak kaydet.';
const WHATSAPP_TEST_URL = `https://wa.me/${WHATSAPP_BOT_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEST_TEXT)}`;

/* ─── Yerel Yardımcı Bileşenler (HomePage'e özgü, dashboard/ klasörüne taşınamayan) ─── */

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
      <span style={{ position: 'absolute', inset: 1, borderRadius: '50%', background: color }} />
    </span>
  );
}

/* ─── Main Component ─── */
export default function HomePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const transactions = useStore(state => state.transactions);
  const goals = useStore(state => state.goals);
  const ecoData = calculateEcoScore(transactions);
  const prediction = calculatePrediction(transactions);

  const [seciliIslem, setSeciliIslem] = useState(null);
  // range state artık BalanceTrendChart bileşeninin içinde yönetiliyor

  // ── Sayfa ilk mount'ta 600ms skeleton göster (Recharts layoutunu bekle) ──
  const [chartsReady, setChartsReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setChartsReady(true), 600);
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
    
    // Ayrıca kopyalayalım
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Davet bağlantısı kopyalandı ve WhatsApp açılıyor.');
    } catch {
      // ignore clipboard error
    }
  };

  const safeTx = (transactions || []).filter(Boolean);

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

        <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 32px)', maxWidth: 1400, margin: '0 auto' }}>

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

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
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

                  <p style={{ fontSize: 15, color: P.text2, maxWidth: 480, lineHeight: 1.7, marginBottom: 20 }}>
                    Harcamalar, hedefler, raporlar ve AI içgörüleri tek bir akıcı deneyimde.
                  </p>
                  <a href={WHATSAPP_TEST_URL} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: '#25D366', color: '#fff', textDecoration: 'none',
                    padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                    boxShadow: '0 8px 24px rgba(37, 211, 102, 0.3)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    WhatsApp'tan Test Et 📱
                  </a>
                </div>

                {/* Status badges */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0, width: '100%', maxWidth: 240 }}>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
            gap: 12,
            marginBottom: 20,
          }}>
            {!chartsReady ? (
              <SkeletonLoader.CardGrid count={4} />
            ) : (
              stats.map((s, i) => (
                <StatCard key={s.label} {...s} delay={200 + i * 80} />
              ))
            )}
          </div>

          {/* ── AI BANNERS ROW ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 14, marginBottom: 20 }}>

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
                  <button 
                    onClick={() => navigate('/chat', { state: { message: 'Gelecek ay sonunda artıda kapatmak için bana özel bir tasarruf planı hazırlar mısın?' } })}
                    style={{
                      flex: 1, padding: '14px 20px', borderRadius: 12,
                      background: `linear-gradient(135deg, ${P.purple}, #4F46E5)`,
                      color: '#fff', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'opacity 0.2s',
                      border: 'none'
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
                  <button 
                    onClick={() => navigate('/chat', { state: { message: 'Karbon ayak izimi düşürmek için harcamalarımda ne gibi değişiklikler yapabilirim? Yeşil önerilerini bekliyorum.' } })}
                    style={{
                      flex: 1, borderRadius: 12,
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

          {/* ── BALANCE AREA CHART — BalanceTrendChart atomik bileşeni ── */}
          {!chartsReady ? (
            <GlassCard style={{ padding: '28px 32px', marginBottom: 24 }}>
              <SkeletonLoader.Chart height={220} />
            </GlassCard>
          ) : (
            <BalanceTrendChart data={areaData} />
          )}

          {/* ── CHARTS ROW ── */}
          <div className="chart-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 14, marginBottom: 20 }}>

            {/* Bar Chart */}
            <GlassCard style={{ padding: '28px 32px' }}>
              {!chartsReady ? (
                <SkeletonLoader.Chart height={240} />
              ) : (
                <>
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
                  <ResponsiveContainer width="100%" height={240} minHeight={240}>
                    <BarChart data={barData} barGap={6} margin={{ top: 0, right: 0, bottom: 0, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fill: P.text3, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: P.text3, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                      <Tooltip content={<ChartTooltip formatter={fmt} />} />
                      <Bar dataKey="gelir" name="Gelir" fill={P.purple} radius={[6, 6, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="gider" name="Gider" fill={P.red} radius={[6, 6, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </GlassCard>

            {/* Donut Pie */}
            <GlassCard style={{ padding: '28px 24px' }}>
              {!chartsReady ? (
                <SkeletonLoader.Pie size={160} />
              ) : (
                <>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: P.text1, marginBottom: 4 }}>Harcama Dağılımı</h2>
                  <p style={{ fontSize: 13, color: P.text3, marginBottom: 20 }}>Kategoriye göre</p>

                  {pieData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={180} minHeight={180}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                            paddingAngle={4} dataKey="value" strokeWidth={0}>
                            {pieData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip formatter={fmt} />} />
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
                </>
              )}
            </GlassCard>
          </div>

          {/* ── GOALS PROGRESS + TRANSACTIONS ── */}
          <div className="chart-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 14, marginBottom: 28 }}>

            {/* Goals */}
            <GlassCard style={{ padding: '28px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: P.text1 }}>Hedefler</h2>
                <Pill color={P.amber}><Flame size={8} /> {goals.length} Aktif</Pill>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* GoalProgressCard atomik bileşeni — GoalProgressCard.jsx */}
                  {goals.slice(0, 4).map((g, i) => (
                    <GoalProgressCard key={g.id || i} goal={g} colorIndex={i} />
                  ))}
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

              {!chartsReady ? (
                <SkeletonLoader.Row count={4} />
              ) : transactions.length > 0 ? (
                <div className="butce-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                  {/* TransactionRow atomik bileşeni — TransactionRow.jsx */}
                  {transactions.slice(0, 6).map((tx, i) => (
                    <TransactionRow key={tx.id || i} tx={tx} index={i} onClick={setSeciliIslem} />
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

          {/* ── MAHALLE REKABETİ (BÜTÇE LİGİ) ── */}
          <GlassCard style={{ padding: '28px 32px', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: P.text1, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Trophy size={22} color={P.amber} /> FinCoach Ligi (Mahalle Rekabeti)
                </h2>
                <p style={{ fontSize: 13, color: P.text3, marginTop: 4 }}>Arkadaşlarını davet et, tasarruf yarışını başlat.</p>
              </div>
              <button 
                onClick={shareLeagueInvite}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff',
                  border: 'none', padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', boxShadow: '0 4px 16px rgba(245,158,11,0.3)', transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <Users size={16} /> Rakip Davet Et
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
              {/* Sen */}
              <div style={{ background: P.bg3, border: `1px solid ${P.purple}40`, borderRadius: 16, padding: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: P.purple }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: P.purpleDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>😎</div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 800, color: P.text1, margin: 0 }}>Sen</p>
                      <p style={{ fontSize: 11, color: P.purpleLight, fontWeight: 700, margin: 0, marginTop: 2 }}>Tasarruf Lideri</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 900, color: P.purple }}>%34</span>
                </div>
                <div style={{ background: P.bg1, borderRadius: 999, height: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: P.purple, width: '34%', borderRadius: 999 }} />
                </div>
                <p style={{ fontSize: 12, color: P.text3, marginTop: 10 }}>Aylık hedefine göre tasarruf oranın.</p>
              </div>

              {/* Rakip */}
              <div style={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 16, padding: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: P.text3 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: P.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤡</div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 800, color: P.text2, margin: 0 }}>Can (Arkadaşın)</p>
                      <p style={{ fontSize: 11, color: P.red, fontWeight: 700, margin: 0, marginTop: 2 }}>Sınırda Geziyor</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 900, color: P.text2 }}>%12</span>
                </div>
                <div style={{ background: P.bg1, borderRadius: 999, height: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: P.text3, width: '12%', borderRadius: 999 }} />
                </div>
                <p style={{ fontSize: 12, color: P.text3, marginTop: 10 }}>Can bu ay gereksiz çok harcadı.</p>
              </div>
            </div>
          </GlassCard>

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
