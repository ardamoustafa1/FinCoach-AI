import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, Activity, Zap, Building2, RefreshCw, ShoppingCart, Bitcoin, Users } from 'lucide-react';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import HeatmapCalendar from '../components/charts/HeatmapCalendar';
import GeoHeatmap from '../components/charts/GeoHeatmap';
import BudgetBars from '../components/BudgetBars';
import LimitBanner from '../components/LimitBanner';
import HealthScore from '../components/HealthScore';
import PersonalityCard from '../components/PersonalityCard';
import { useToast } from '../hooks/useToast';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const headerVis = true;
  const [bankingSyncing, setBankingSyncing] = useState(false);

  const handleBankSync = () => {
    setBankingSyncing(true);
    toast.info('Bankanızla güvenli PSD2 bağlantısı kuruluyor...');
    setTimeout(() => {
      toast.success('Son 30 günlük Akbank ve Garanti hesap hareketleriniz FinCoach AI ile otonom olarak senkronize edildi! 🎉');
      setBankingSyncing(false);
    }, 3500);
  };

  const handleAddToWallet = () => {
    toast.success('FinCoach AI Kartı Apple Wallet\'a eklendi! (Simülasyon)');
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

  if (loading) return null;

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
        <div style={{ opacity: headerVis ? 1 : 0, transform: headerVis ? 'none' : 'translateY(-16px)', transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)' }}>
          <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 32, right: 32, height: 2, borderRadius: 999, background: 'linear-gradient(90deg, #7c3aed, #3b82f6, #10b981)', backgroundSize: '300% 100%', animation: 'gradientShift 4s ease infinite' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: P.green, display: 'inline-block' }} />
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: P.text3 }}>{new Date().toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}</span>
                </div>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', marginBottom: 4 }}>Finansal Komuta Merkezi</h1>
                  <p style={{ fontSize: 13, color: P.text2 }}>Senin için hazırlanan gerçek zamanlı özet.</p>
                </div>
                <button
                  onClick={handleAddToWallet}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12,
                    background: '#000', border: `1px solid ${P.border}`, color: '#fff',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 16,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)', transition: 'all 0.2s'
                  }}
                  aria-label="Cüzdanı Apple Wallet'a Ekle"
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Wallet size={16} aria-hidden="true" />
                  Apple Wallet'a Ekle
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={handleBankSync}
                  disabled={bankingSyncing}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12,
                    background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#fff',
                    fontWeight: 700, fontSize: 13, cursor: bankingSyncing ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)', opacity: bankingSyncing ? 0.7 : 1, transition: 'all 0.2s'
                  }}
                  aria-label={bankingSyncing ? 'Banka verileri senkronize ediliyor' : 'Bankayı PSD2 ile bağla'}
                  aria-live="polite"
                  onMouseEnter={e => { if (!bankingSyncing) e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { if (!bankingSyncing) e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  {bankingSyncing ? <RefreshCw size={16} aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }} /> : <Building2 size={16} aria-hidden="true" />}
                  {bankingSyncing ? 'Senkronize Ediliyor...' : 'Bankanı Bağla (PSD2)'}
                </button>
                <button
                  onClick={() => navigate('/shop-sim')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12,
                    background: 'linear-gradient(135deg, #FF1493, #7C3AED)', border: 'none', color: '#fff',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)', transition: 'all 0.2s'
                  }}
                  aria-label="Satın Almadan Önce Sor simülasyonunu başlat"
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <ShoppingCart size={16} aria-hidden="true" />
                  Satın Almadan Önce Sor (Test)
                </button>
                {[
                  { icon: Zap, label: 'Cloud Senkron', value: 'Aktif', color: P.purple },
                  { icon: Activity, label: 'Bütçe Sağlığı', value: 'Canlı', color: P.green },
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
          {/* Otonom Küsurat Yatırımı — gerçek hesaplama */}
          <div style={{ background: 'linear-gradient(135deg, #1C2038, #0D0F1E)', border: `1px solid ${P.amber}40`, borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: P.amber, filter: 'blur(60px)', opacity: 0.15 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: `${P.amber}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.amber}50` }}>
                <Bitcoin size={24} color={P.amber} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1 }}>Otonom Küsurat Yatırımı</h3>
                <p style={{ fontSize: 12, color: P.text3 }}>Smart Contract Aktif (BETA)</p>
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
