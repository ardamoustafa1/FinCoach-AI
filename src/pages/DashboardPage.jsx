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

import { P } from '../styles/palette';
/* ─── Palette ─── */

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
    const settle = setTimeout(() => setVal(target), duration + 400);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); clearTimeout(settle); };
  }, [target, duration]);
  return val;
}

function StatCard({ label, target, icon: Icon, color, isCurrency = true, change, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const [hov, setHov] = useState(false);
  const cardRef = useRef(null);

  const animated = useCountUp(target, 1800);

  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  const isPos = change > 0;

  return (
    <div
      ref={cardRef}
      className="glass-card spotlight conic-ring"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onMouseMove={handleMouseMove}
      style={{
        padding: '22px 24px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(22px)',
        transition: `opacity .7s var(--ease-out-expo) ${delay}ms, transform .8s var(--ease-out-expo) ${delay}ms, box-shadow .5s ease, border-color .4s ease, background .4s ease`,
      }}
    >
      <div style={{
        position: 'absolute', top: -46, right: -46, width: 130, height: 130, borderRadius: '50%',
        background: color, opacity: 0.08, filter: 'blur(38px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ minWidth: 0 }}>
          <p className="eyebrow" style={{ fontSize: 9.5, letterSpacing: '0.2em', marginBottom: 13 }}>{label}</p>
          <p className="num kpi-underline is-in" style={{
            fontSize: 27, color: 'var(--text-primary)', lineHeight: 1, display: 'inline-block',
          }}>
            {isCurrency
              ? <><span style={{ fontSize: 16, color: 'var(--text-muted)', marginRight: 3 }}>₺</span>{Math.round(animated).toLocaleString('tr-TR')}</>
              : `%${animated.toFixed(1)}`}
          </p>
          {change !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12 }}>
              {isPos
                ? <ArrowUpRight size={12} color={P.green} strokeWidth={2.4} />
                : <ArrowDownRight size={12} color={P.red} strokeWidth={2.4} />}
              <span className="num" style={{ fontSize: 11.5, color: isPos ? P.green : P.red }}>%{Math.abs(change).toFixed(1)}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>geçen aya göre</span>
            </div>
          )}
        </div>

        <span style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: `${color}14`, border: `1px solid ${color}30`,
          display: 'grid', placeItems: 'center',
          transition: 'transform .45s var(--ease-out-expo)',
          transform: hov ? 'scale(1.06) rotate(4deg)' : 'none',
        }}>
          <Icon size={18} color={color} strokeWidth={1.8} />
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { transactions, limits, loading } = useSupabaseData();
  const [bankingSyncing, setBankingSyncing] = useState(false);
  const [dismissedBiasIds, setDismissedBiasIds] = useState([]);

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

    const buAyIs = transactions.filter(t => t && typeof t.tarih === 'string' && t.tarih.startsWith(buAyPrefix));
    const gecenAyIs = transactions.filter(t => t && typeof t.tarih === 'string' && t.tarih.startsWith(gecenAyPrefix));

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
  const visibleCognitiveBiases = cognitiveBiases.filter(bias => !dismissedBiasIds.includes(bias.id));

  const handleBiasAction = (bias) => {
    setDismissedBiasIds(current => [...current, bias.id]);
    toast.success(`${bias.name} için güvenli ilan taslağı oluşturuldu. Yayınlamadan önce son kontrol sizde.`);
  };

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
        <div className="chart-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
          <GlassCard hover={false} style={{ padding: 28 }}><SkeletonLoader.Pie size={160} /></GlassCard>
          <GlassCard hover={false} style={{ padding: 28 }}><SkeletonLoader.Chart height={200} /></GlassCard>
        </div>

        {/* Calendar and Geo Map Row Skeleton */}
        <div className="chart-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
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
      <style>{`
        @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes fcSlideUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        .stagger-1 { animation: fcSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.05s; }
        .stagger-2 { animation: fcSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.15s; }
        .stagger-3 { animation: fcSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.25s; }
        .stagger-4 { animation: fcSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.35s; }
        .stagger-5 { animation: fcSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.45s; }
        .stagger-6 { animation: fcSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.55s; }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="stagger-1">
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
                  background: bankingSyncing ? P.bg3 : `linear-gradient(135deg, ${P.green}, #1E8A62)`, color: bankingSyncing ? P.text3 : '#fff',
                  fontSize: 13, fontWeight: 800, cursor: bankingSyncing ? 'not-allowed' : 'pointer', border: 'none',
                  boxShadow: bankingSyncing ? 'none' : '0 8px 20px rgba(52,192,138,0.3)', transition: 'all 0.2s'
                }}
              >
                {bankingSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Building2 size={16} />}
                {bankingSyncing ? 'Senkronize...' : 'Bankanı Bağla'}
              </button>
              <button
                onClick={() => navigate('/shop-sim')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12,
                  background: `linear-gradient(135deg, #C0705C, ${P.purple})`, color: '#fff',
                  fontSize: 13, fontWeight: 800, cursor: 'pointer', border: 'none',
                  boxShadow: '0 8px 20px rgba(192,112,92,0.3)', transition: 'all 0.2s'
                }}
              >
                <ShoppingCart size={16} />
                AI Simülatör
              </button>
            </div>
          </PageHeader>
        </div>

        {visibleCognitiveBiases.length > 0 && (
          <div className="stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visibleCognitiveBiases.map(b => (
              <div key={b.id} style={{ 
                background: `linear-gradient(135deg, ${P.bg2}, ${P.bg0})`, 
                border: `1px solid ${P.red}50`, 
                borderRadius: 16, padding: 20, 
                display: 'flex', gap: 16, alignItems: 'flex-start',
                boxShadow: `0 8px 32px rgba(219,92,78, 0.1)`
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
                  <button onClick={() => handleBiasAction(b)} style={{
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

        <div className="stagger-2">
          <LimitBanner asimlar={asimlar} persistent />
        </div>
        
        <div className="stagger-2">
          <HealthScore islemler={transactions || []} gelirler={(transactions || []).filter(t => t && t.tur === 'gelir')} />
        </div>
        
        <div className="stagger-3">
          <PersonalityCard islemler={transactions} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: 14 }}>
          {kartlar.map(k => <StatCard key={k.label} {...k} />)}
        </div>

        <div className="chart-grid-2col stagger-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
          <CategoryPieChart islemler={transactions} />
          <TrendLineChart islemler={transactions || []} gelirler={(transactions || []).filter(t => t && t.tur === 'gelir')} />
        </div>

        <div className="chart-grid-2col stagger-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
          <HeatmapCalendar islemler={transactions} />
          <GeoHeatmap />
        </div>
        
        <div className="stagger-5">
          <BudgetBars harcamalar={stats.harcamaMap} limitler={limits} />
        </div>

        {/* ── KÜSURAT YATIRIMI & EŞLİ BÜTÇE ── */}
        <div className="stagger-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
          {/* Otomatik küsurat hesabı — gerçek hesaplama */}
          <div style={{ background: 'linear-gradient(135deg, #181A1D, #101113)', border: `1px solid ${P.amber}40`, borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden' }}>
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
          <div style={{ background: 'linear-gradient(135deg, #181A1D, #101113)', border: `1px solid ${P.pink}40`, borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden' }}>
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
