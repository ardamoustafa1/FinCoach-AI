import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, Activity, Zap } from 'lucide-react';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import HeatmapCalendar from '../components/charts/HeatmapCalendar';
import BudgetBars from '../components/BudgetBars';
import LimitBanner from '../components/LimitBanner';
import HealthScore from '../components/HealthScore';
import PersonalityCard from '../components/PersonalityCard';
import { getBudgetLimits } from '../utils/storage';
import { useToast } from '../hooks/useToast';

/* ─── Palette ─── */
const P = {
  purple: '#7C3AED', purpleLight: '#A78BFA', purpleGlow: 'rgba(124,58,237,0.35)',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B', blue: '#3B82F6',
  bg0: '#050714', bg1: '#0D0F1E', bg2: '#141728', bg3: '#1C2038',
  border: 'rgba(255,255,255,0.06)', borderHover: 'rgba(124,58,237,0.4)',
  text1: '#F1F5F9', text2: '#94A3B8', text3: '#64748B',
};

function getIslemler() {
  try { return JSON.parse(localStorage.getItem('butceai_transactions') || '[]'); } catch { return []; }
}
function getGelirler() {
  try { return JSON.parse(localStorage.getItem('butceai_gelir') || '[]'); } catch { return []; }
}
function ayFiltre(liste, ay) {
  const prefix = `2025-${String(ay).padStart(2, '0')}`;
  return liste.filter((i) => i.tarih && i.tarih.startsWith(prefix));
}

const fmt = (v) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

function useCountUp(target, duration = 1500) {
  const [val, setVal] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(2, -10 * progress);
      setVal(ease * target);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return val;
}

function StatCard({ label, target, icon: Icon, color, isCurrency = true, change, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const [hov, setHov] = useState(false);
  const animated = useCountUp(target, 1400);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);

  const isPos = change > 0;
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '22px 24px', borderRadius: 20,
        background: hov ? P.bg3 : P.bg2,
        border: `1px solid ${hov ? P.borderHover : P.border}`,
        transition: `all 0.5s ease ${delay}ms`,
        transform: visible ? (hov ? 'translateY(-2px)' : 'none') : 'translateY(16px)',
        opacity: visible ? 1 : 0,
        boxShadow: hov ? `0 0 32px ${P.purpleGlow}` : '0 4px 24px rgba(0,0,0,0.4)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: -30, right: -30, width: 90, height: 90, borderRadius: '50%', background: color, opacity: 0.08, filter: 'blur(28px)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: P.text3, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: P.text1, lineHeight: 1, marginBottom: 8 }}>
            {isCurrency
              ? <><span style={{ fontSize: 16, fontWeight: 600, color: P.text2, marginRight: 2 }}>₺</span>{Math.round(animated).toLocaleString('tr-TR')}</>
              : `%${animated.toFixed(1)}`}
          </p>
          {change !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {isPos ? <ArrowUpRight size={12} color={P.green} /> : <ArrowDownRight size={12} color={P.red} />}
              <span style={{ fontSize: 12, color: isPos ? P.green : P.red, fontWeight: 600 }}>%{Math.abs(change).toFixed(1)} geçen aya göre</span>
            </div>
          )}
        </div>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: `${color}22`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const toast = useToast();
  const [veriler, setVeriler] = useState(null);
  const [rawIslemler, setRawIslemler] = useState([]);
  const [rawGelirler, setRawGelirler] = useState([]);
  const [budgetLimitler, setBudgetLimitler] = useState({});
  const [buAyHarcamalar, setBuAyHarcamalar] = useState({});
  const [headerVis, setHeaderVis] = useState(false);

  useEffect(() => { setTimeout(() => setHeaderVis(true), 100); }, []);

  useEffect(() => {
    const islemler = getIslemler();
    const gelirler = getGelirler();
    setRawIslemler(islemler);
    setRawGelirler(gelirler);

    const limitler = getBudgetLimits();
    setBudgetLimitler(limitler);

    const buAyPrefix = '2025-05';
    const harcamaMap = {};
    islemler.filter(i => i.tarih && i.tarih.startsWith(buAyPrefix)).forEach(i => { harcamaMap[i.kategori] = (harcamaMap[i.kategori] || 0) + i.tutar; });
    setBuAyHarcamalar(harcamaMap);

    Object.entries(limitler).forEach(([kat, limit]) => {
      const harcanan = harcamaMap[kat] || 0;
      const oran = limit > 0 ? (harcanan / limit) * 100 : 0;
      if (oran >= 100) toast.error(`⚠️ ${kat} limiti aşıldı`);
      else if (oran >= 80) toast.warning(`⚠️ ${kat} limitine %${Math.max(0, Math.round(100 - oran))} kaldı`);
    });

    const buAyIs = ayFiltre(islemler, 5);
    const gecenAyIs = ayFiltre(islemler, 4);
    const buAyGelir = ayFiltre(gelirler, 5).reduce((t, g) => t + g.tutar, 0);
    const gecenAyGelir = ayFiltre(gelirler, 4).reduce((t, g) => t + g.tutar, 0);
    const buAyGider = buAyIs.reduce((t, i) => t + i.tutar, 0);
    const gecenAyGider = gecenAyIs.reduce((t, i) => t + i.tutar, 0);
    const netBakiye = buAyGelir - buAyGider;
    const tasarrufOrani = buAyGelir > 0 ? ((buAyGelir - buAyGider) / buAyGelir) * 100 : 0;
    const gelirDegisim = gecenAyGelir > 0 ? parseFloat((((buAyGelir - gecenAyGelir) / gecenAyGelir) * 100).toFixed(1)) : 0;
    const giderDegisim = gecenAyGider > 0 ? parseFloat((((buAyGider - gecenAyGider) / gecenAyGider) * 100).toFixed(1)) : 0;

    setVeriler({ buAyGelir, buAyGider, netBakiye, tasarrufOrani, gelirDegisim, giderDegisim });
  }, [toast]);

  if (!veriler) return null;

  const asimlar = Object.entries(budgetLimitler)
    .filter(([kat, limit]) => (buAyHarcamalar[kat] || 0) > limit)
    .map(([kategori, limit]) => ({ kategori, harcanan: buAyHarcamalar[kategori], limit }));

  const kartlar = [
    { label: 'Bu Ay Gelir', target: veriler.buAyGelir, icon: TrendingUp, color: P.green, change: veriler.gelirDegisim, delay: 100 },
    { label: 'Bu Ay Gider', target: veriler.buAyGider, icon: TrendingDown, color: P.red, change: veriler.giderDegisim, delay: 180 },
    { label: 'Net Bakiye', target: veriler.netBakiye, icon: Wallet, color: veriler.netBakiye >= 0 ? P.purple : P.red, delay: 260 },
    { label: 'Tasarruf Oranı', target: veriler.tasarrufOrani, icon: PiggyBank, color: P.amber, isCurrency: false, delay: 340 },
  ];

  return (
    <>
      <style>{`@keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── HERO ── */}
        <div style={{
          opacity: headerVis ? 1 : 0, transform: headerVis ? 'none' : 'translateY(-16px)',
          transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 32, right: 32, height: 2, borderRadius: 999, background: 'linear-gradient(90deg, #7c3aed, #3b82f6, #10b981)', backgroundSize: '300% 100%', animation: 'gradientShift 4s ease infinite' }} />
            <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(124,58,237,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: P.green, display: 'inline-block' }} />
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: P.text3 }}>Mayıs 2025</span>
                </div>
                <h1 style={{ fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', marginBottom: 8 }}>Finansal Kontrol Paneli</h1>
                <p style={{ fontSize: 14, color: P.text2 }}>Riskleri, fırsatları ve bütçe sağlığını tek bakışta oku.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: Zap, label: 'AI Motor', value: 'Aktif', color: P.purple },
                  { icon: Activity, label: 'Skor', value: 'Canlı', color: P.green },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12, padding: '10px 14px' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={14} color={color} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: P.text3, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
                      <p style={{ fontSize: 12, color: P.text1, fontWeight: 700 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <LimitBanner asimlar={asimlar} persistent />
        <HealthScore islemler={rawIslemler} gelirler={rawGelirler} />
        <PersonalityCard islemler={rawIslemler} />

        {/* ── STAT CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
          {kartlar.map(k => <StatCard key={k.label} {...k} />)}
        </div>

        {/* ── CHARTS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <CategoryPieChart islemler={rawIslemler} />
          <TrendLineChart islemler={rawIslemler} gelirler={rawGelirler} />
        </div>

        <HeatmapCalendar islemler={rawIslemler} />
        <BudgetBars harcamalar={buAyHarcamalar} limitler={budgetLimitler} />
      </div>
    </>
  );
}
