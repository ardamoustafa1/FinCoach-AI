import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, Zap, Building2, RefreshCw, ShoppingCart, Bitcoin, Users } from 'lucide-react';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import HeatmapCalendar from '../components/charts/HeatmapCalendar';
import GeoHeatmap from '../components/charts/GeoHeatmap';
import BudgetBars from '../components/BudgetBars';
import LimitBanner from '../components/LimitBanner';
import HealthScore from '../components/HealthScore';
import PersonalityCard from '../components/PersonalityCard';
import { detectCognitiveBiases } from '../utils/spendingPersonality';
import { useToast } from '../hooks/useToast';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import SkeletonLoader from '../components/SkeletonLoader';
import { GlassCard } from '../components/dashboard';

/* ─── Palette ─── */
const P = {
  purple: '#7C3AED', purpleLight: '#A78BFA', purpleGlow: 'rgba(124,58,237,0.35)',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B', blue: '#3B82F6', pink: '#EC4899',
  bg0: 'var(--bg-main)', bg1: 'var(--bg-sidebar)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', borderHover: 'var(--border-hover)',
  text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)',
};

function useCountUp(target, duration = 1500) {
  const [val, setVal] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
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
  const navigate = useNavigate();
  const { transactions, limits, loading } = useSupabaseData();
  const [bankingSyncing, setBankingSyncing] = useState(false);

  const handleBankSync = () => {
    setBankingSyncing(true);
    toast.info('Bankanızla güvenli PSD2 bağlantısı kuruluyor...');
    setTimeout(() => {
      toast.success('Son 30 günlük Akbank ve Garanti demo hesap hareketleri FinCoach AI ile senkronize edildi.');
      setBankingSyncing(false);
    }, 3500);
  };

  const stats = useMemo(() => {
    if (!transactions.length) return { buAyGelir: 0, buAyGider: 0, netBakiye: 0, tasarrufOrani: 0, gelirDegisim: 0, giderDegisim: 0, harcamaMap: {} };

    const bugun = new Date();
    const buAyPrefix = `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, '0')}`;
    const gecenAyPrefix = `${bugun.getFullYear()}-${String(bugun.getMonth()).padStart(2, '0')}`;

    const buAyIs = transactions.filter(t => t.tarih.startsWith(buAyPrefix));
    const gecenAyIs = transactions.filter(t => t.tarih.startsWith(gecenAyPrefix));

    const buAyGelir = buAyIs.filter(t => t.tur === 'gelir').reduce((s, t) => s + t.tutar, 0);
    const buAyGider = buAyIs.filter(t => t.tur === 'gider').reduce((s, t) => s + t.tutar, 0);
    const gecenAyGelir = gecenAyIs.filter(t => t.tur === 'gelir').reduce((s, t) => s + t.tutar, 0);
    const gecenAyGider = gecenAyIs.filter(t => t.tur === 'gider').reduce((s, t) => s + t.tutar, 0);

    const harcamaMap = {};
    buAyIs.filter(t => t.tur === 'gider').forEach(t => {
      harcamaMap[t.kategori] = (harcamaMap[t.kategori] || 0) + t.tutar;
    });

    const netBakiye = buAyGelir - buAyGider;
    const tasarrufOrani = buAyGelir > 0 ? ((buAyGelir - buAyGider) / buAyGelir) * 100 : 0;
    const gelirDegisim = gecenAyGelir > 0 ? ((buAyGelir - gecenAyGelir) / gecenAyGelir) * 100 : 0;
    const giderDegisim = gecenAyGider > 0 ? ((buAyGider - gecenAyGider) / gecenAyGider) * 100 : 0;

    return { buAyGelir, buAyGider, netBakiye, tasarrufOrani, gelirDegisim, giderDegisim, harcamaMap };
  }, [transactions]);

  useEffect(() => {
    if (loading) return;
    Object.entries(limits).forEach(([kat, limit]) => {
      const harcanan = stats.harcamaMap[kat] || 0;
      const oran = limit > 0 ? (harcanan / limit) * 100 : 0;
      if (oran >= 100) toast.error(`⚠️ ${kat} limiti aşıldı`);
      else if (oran >= 80) toast.warning(`⚠️ ${kat} limitine çok az kaldı!`);
    });
  }, [limits, stats.harcamaMap, loading, toast]);

  const cognitiveBiases = useMemo(() => detectCognitiveBiases(transactions), [transactions]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
        <PageHeader
          icon={<Zap size={24} />}
          color={P.purple}
          title="Komuta Merkezi"
          subtitle="Finansal hayatınızın gerçek zamanlı özeti ve yapay zeka analizleri."
          badge={new Date().toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
        />
        
        {/* KPI Cards Skeleton */}
        <SkeletonLoader.CardGrid count={4} />

        {/* Charts Row Skeleton */}
        <div className="chart-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <GlassCard hover={false} style={{ padding: 28 }}><SkeletonLoader.Pie size={160} /></GlassCard>
          <GlassCard hover={false} style={{ padding: 28 }}><SkeletonLoader.Chart height={200} /></GlassCard>
        </div>

        {/* Calendar and Geo Map Row Skeleton */}
        <div className="chart-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <GlassCard hover={false} style={{ padding: 28 }}><SkeletonLoader.Chart height={160} /></GlassCard>
          <GlassCard hover={false} style={{ padding: 28 }}><SkeletonLoader.Chart height={160} /></GlassCard>
        </div>
      </div>
    );
  }

  const asimlar = Object.entries(limits)
    .filter(([kat, limit]) => (stats.harcamaMap[kat] || 0) > limit)
    .map(([kategori, limit]) => ({ kategori, harcanan: stats.harcamaMap[kategori], limit }));

  const kartlar = [
    { label: 'Bu Ay Gelir', target: stats.buAyGelir, icon: TrendingUp, color: P.green, change: stats.gelirDegisim, delay: 100 },
    { label: 'Bu Ay Gider', target: stats.buAyGider, icon: TrendingDown, color: P.red, change: stats.giderDegisim, delay: 180 },
    { label: 'Net Bakiye', target: stats.netBakiye, icon: Wallet, color: stats.netBakiye >= 0 ? P.purple : P.red, delay: 260 },
    { label: 'Tasarruf Oranı', target: stats.tasarrufOrani, icon: PiggyBank, color: P.amber, isCurrency: false, delay: 340 },
  ];

  return (
    <>
      <style>{`@keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <PageHeader
          icon={<Zap size={24} />}
          color={P.purple}
          title="Komuta Merkezi"
          subtitle="Finansal hayatınızın gerçek zamanlı özeti ve yapay zeka analizleri."
          badge={new Date().toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
        >
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={handleBankSync}
              disabled={bankingSyncing}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12,
                background: bankingSyncing ? P.bg3 : `linear-gradient(135deg, ${P.green}, #059669)`, color: bankingSyncing ? P.text3 : '#fff',
                fontSize: 13, fontWeight: 800, cursor: bankingSyncing ? 'not-allowed' : 'pointer', border: 'none',
                boxShadow: bankingSyncing ? 'none' : '0 8px 20px rgba(16,185,129,0.3)', transition: 'all 0.2s'
              }}
            >
              {bankingSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Building2 size={16} />}
              {bankingSyncing ? 'Senkronize...' : 'Bankanı Bağla'}
            </button>
            <button
              onClick={() => navigate('/shop-sim')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12,
                background: `linear-gradient(135deg, #EC4899, ${P.purple})`, color: '#fff',
                fontSize: 13, fontWeight: 800, cursor: 'pointer', border: 'none',
                boxShadow: '0 8px 20px rgba(236,72,153,0.3)', transition: 'all 0.2s'
              }}
            >
              <ShoppingCart size={16} />
              AI Simülatör
            </button>
          </div>
        </PageHeader>

        {cognitiveBiases.length > 0 && (
          <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cognitiveBiases.map(b => (
              <div key={b.id} style={{ 
                background: `linear-gradient(135deg, ${P.bg2}, ${P.bg0})`, 
                border: `1px solid ${P.red}50`, 
                borderRadius: 16, padding: 20, 
                display: 'flex', gap: 16, alignItems: 'flex-start',
                boxShadow: `0 8px 32px rgba(239, 68, 68, 0.1)`
              }}>
                <div style={{ padding: 12, background: `${P.red}15`, borderRadius: 12, border: `1px solid ${P.red}40` }}>
                  <Zap size={24} color={P.red} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: 0 }}>{b.name}</h3>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: P.red, color: '#fff', textTransform: 'uppercase' }}>
                      Davranışsal Anomali
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: P.text2, margin: '0 0 12px', lineHeight: 1.5 }}>
                    {b.message}
                  </p>
                  <button style={{
                    background: P.red, color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer'
                  }}>
                    Varlığı Sat / İlan Ver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <LimitBanner asimlar={asimlar} persistent />
        <HealthScore islemler={transactions} gelirler={transactions.filter(t => t.tur === 'gelir')} />
        <PersonalityCard islemler={transactions} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
          {kartlar.map(k => <StatCard key={k.label} {...k} />)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <CategoryPieChart islemler={transactions} />
          <TrendLineChart islemler={transactions} gelirler={transactions.filter(t => t.tur === 'gelir')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <HeatmapCalendar islemler={transactions} />
          <GeoHeatmap />
        </div>
        <BudgetBars harcamalar={stats.harcamaMap} limitler={limits} />

        {/* ── KÜSURAT YATIRIMI & EŞLİ BÜTÇE ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {/* Otomatik küsurat hesabı — gerçek hesaplama */}
          <div style={{ background: 'linear-gradient(135deg, #1C2038, #0D0F1E)', border: `1px solid ${P.amber}40`, borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: P.amber, filter: 'blur(60px)', opacity: 0.15 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: `${P.amber}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.amber}50` }}>
                <Bitcoin size={24} color={P.amber} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1 }}>Otomatik Küsurat Birikimi</h3>
                <p style={{ fontSize: 12, color: P.text3 }}>Demo hesaplama aktif</p>
              </div>
            </div>
            {(() => {
              // Gerçek küsurat hesabı: her işlem en yakın 10'a yuvarlanır, fark biriktirilir
              const buAyGider = transactions.filter(t =>
                t.tur === 'gider' && t.tarih?.startsWith(new Date().toISOString().slice(0, 7))
              );
              const roundUpTotal = buAyGider.reduce((s, t) => {
                const rounded = Math.ceil(t.tutar / 10) * 10;
                return s + (rounded - t.tutar);
              }, 0);
              const ethApprox = (roundUpTotal / 100000).toFixed(4); // ~kaba ETH tahmini
              const lastTx = buAyGider[0];
              const lastRounded = lastTx ? Math.ceil(lastTx.tutar / 10) * 10 : null;
              const lastDiff = lastTx ? lastRounded - lastTx.tutar : null;
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                    <div>
                      <p style={{ fontSize: 13, color: P.text2, marginBottom: 4 }}>Bu ay yuvarlanan küsuratlar</p>
                      <div style={{ fontSize: 32, fontWeight: 900, color: P.amber, letterSpacing: '-0.03em' }}>
                        +{Math.round(roundUpTotal).toLocaleString('tr-TR')}₺
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 11, color: P.text3 }}>Kripto Portföyüne Giden</p>
                      <div style={{ fontSize: 14, fontWeight: 700, color: P.green }}>{ethApprox} ETH</div>
                    </div>
                  </div>
                  <div style={{ background: P.bg2, borderRadius: 12, padding: 12, fontSize: 12, color: P.text2, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: P.green, display: 'inline-block', flexShrink: 0 }} />
                    {lastTx && lastDiff > 0
                      ? `"${lastTx.magaza || lastTx.aciklama || 'Son işlem'}" (${Math.round(lastTx.tutar)}₺) ${lastRounded}₺'ye yuvarlandı. ${Math.round(lastDiff)}₺ ETH fonuna aktarıldı."`
                      : 'İşlem eklendikçe küsuratlar otomatik hesaplanır.'}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Eşli Ortak Bütçe — Coming Soon */}
          <div style={{ background: 'linear-gradient(135deg, #1C2038, #0D0F1E)', border: `1px solid ${P.pink}40`, borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: P.pink, filter: 'blur(60px)', opacity: 0.15 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${P.pink}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.pink}50` }}>
                  <Users size={24} color={P.pink} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1 }}>Ortak Bütçe</h3>
                  <p style={{ fontSize: 12, color: P.text3 }}>Multi-player Finance</p>
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, color: P.pink, background: `${P.pink}20`, padding: '4px 8px', borderRadius: 99, border: `1px solid ${P.pink}50` }}>Yakında</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1, background: P.bg2, borderRadius: 12, padding: 12, border: `1px solid ${P.border}` }}>
                <div style={{ fontSize: 11, color: P.text3, marginBottom: 4 }}>Senin Bu Ay</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: P.text1 }}>
                  {Math.round(stats.buAyGider).toLocaleString('tr-TR')}₺
                </div>
              </div>
              <div style={{ flex: 1, background: P.bg2, borderRadius: 12, padding: 12, border: `1px solid ${P.border}`, opacity: 0.5 }}>
                <div style={{ fontSize: 11, color: P.text3, marginBottom: 4 }}>Partner (Bekleniyor)</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: P.text3 }}>— ₺</div>
              </div>
            </div>
            <div style={{ background: `${P.pink}10`, borderRadius: 12, padding: 12, fontSize: 13, color: P.text2, border: `1px solid ${P.pink}20`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={16} color={P.pink} />
              Eşinizi veya iş ortağınızı davet edin — ortak bütçe takibi çok yakında geliyor!
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
