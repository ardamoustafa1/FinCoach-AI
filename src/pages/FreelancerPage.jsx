import { useState, useEffect } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Waves, Lock, TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react';
import { fmt } from '../utils/categories';
import PageHeader, { PageLoader } from '../components/PageHeader';

const P = {
  purple: '#7C3AED', blue: '#3B82F6', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)'
};

// Mock volatile income data for the last 6 months + next 6 months projection
const VOLATILE_INCOME = [
  { month: 'Oca', gercekGelir: 120000 },
  { month: 'Şub', gercekGelir: 15000 },
  { month: 'Mar', gercekGelir: 85000 },
  { month: 'Nis', gercekGelir: 0 },
  { month: 'May', gercekGelir: 140000 },
  { month: 'Haz', gercekGelir: 25000 },
];

export default function FreelancerPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [smoothingActive, setSmoothingActive] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setTimeout(() => {
      if (!isMounted) return;
      // AI calculates the "Safe Salary" (average of last 6 months with a 15% safety buffer)
      const totalIncome = VOLATILE_INCOME.reduce((a, b) => a + b.gercekGelir, 0);
      const avgIncome = totalIncome / VOLATILE_INCOME.length;
      const safeSalary = avgIncome * 0.85; // 85% of average to build buffer
      
      let vaultBalance = 0;
      const history = VOLATILE_INCOME.map(v => {
        const excess = v.gercekGelir - safeSalary;
        vaultBalance += excess; // Add excess to vault, or withdraw if negative
        return {
          ...v,
          sabitMaas: Math.round(safeSalary),
          kasa: Math.round(vaultBalance)
        };
      });

      setData({
        avgIncome,
        safeSalary,
        currentVault: vaultBalance,
        totalIncome
      });
      setChartData(history);
      setLoading(false);
    }, 800);
    return () => { isMounted = false; };
  }, []);

  const activateSmoothing = () => {
    setSmoothingActive(true);
  };

  if (loading || !data) return <PageLoader message="Serbest meslek gelir oynakl&#305;&#287;&#305; analiz ediliyor..." />;

  return (
    <>
      <style>{`@keyframes flowLine { to { stroke-dashoffset: -20; } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        <PageHeader
          icon={<Waves size={24} />}
          color="#3B82F6"
          title="Freelancer Gelir Dengeleyici"
          subtitle="Aydan aya değişen gelirinizi sabit bir maaşa dönüştürün. Stressiz bir finansal hayat." 
          badge="Freelancer & Esnaf"
        >
          {!smoothingActive ? (
            <button onClick={activateSmoothing} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 14, border: 'none', background: `linear-gradient(135deg, #3B82F6, #2563EB)`, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(59,130,246,0.3)' }}>
              <RefreshCw size={16} /> Sistemi Aktif Et
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 14, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', fontSize: 13, fontWeight: 800 }}>
              <CheckCircle2 size={16} /> Sistem Aktif
            </div>
          )}
        </PageHeader>

        {/* METRICS */}
        <div className="animate-enter" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, animationDelay: '0.1s', opacity: 0 }}>
          <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: P.text3, textTransform: 'uppercase', marginBottom: 8 }}>6 Aylık Ortalama Gelir</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: P.text1, margin: 0 }}>{fmt(data.avgIncome)}</p>
            <TrendingUp size={60} color={P.text3} style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.1 }} />
          </div>
          
          <div style={{ background: smoothingActive ? 'rgba(59,130,246,0.05)' : P.bg2, border: `1px solid ${smoothingActive ? 'rgba(59,130,246,0.3)' : P.border}`, borderRadius: 20, padding: 24, transition: 'all 0.5s' }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: smoothingActive ? P.blue : P.text3, textTransform: 'uppercase', marginBottom: 8 }}>Sana Ödenecek Sabit Maaş</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: smoothingActive ? P.blue : P.text1, margin: 0 }}>{fmt(data.safeSalary)}</p>
          </div>

          <div style={{ background: smoothingActive ? 'rgba(16,185,129,0.05)' : P.bg2, border: `1px solid ${smoothingActive ? 'rgba(16,185,129,0.3)' : P.border}`, borderRadius: 20, padding: 24, transition: 'all 0.5s' }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: smoothingActive ? P.green : P.text3, textTransform: 'uppercase', marginBottom: 8 }}>Yedek Kasa Bakiyesi (Tampon)</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {smoothingActive && <Lock size={20} color={P.green} />}
              <p style={{ fontSize: 28, fontWeight: 900, color: smoothingActive ? P.green : P.text1, margin: 0 }}>
                {smoothingActive ? fmt(data.currentVault) : '₺0,00'}
              </p>
            </div>
          </div>
        </div>

        {/* VISUALIZATION CHART */}
        <div className="animate-enter" style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, animationDelay: '0.2s', opacity: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>Stresli Grafikten Huzurlu Maaşa Geçiş</h3>
              <p style={{ fontSize: 13, color: P.text3, margin: 0 }}>Kırmızı çubuklar gerçek geliriniz, mavi çizgi AI'ın size her ay ödeyeceği sabit maaştır.</p>
            </div>
            {smoothingActive && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(59,130,246,0.1)', padding: '6px 12px', borderRadius: 999 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: P.blue, animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: P.blue }}>AI Maaş Koruması Devrede</span>
              </div>
            )}
          </div>

          <div style={{ height: 350, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={P.red} stopOpacity={0.6}/>
                    <stop offset="100%" stopColor={P.red} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={P.border} vertical={false} />
                <XAxis dataKey="month" stroke={P.text3} fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke={P.text3} fontSize={11} tickFormatter={(val) => `₺${(val/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12 }}
                  itemStyle={{ color: P.text1, fontWeight: 700 }}
                  formatter={(value, name) => {
                    if (name === 'gercekGelir') return [fmt(value), 'Stresli Gerçek Gelir'];
                    if (name === 'sabitMaas') return [fmt(value), 'Huzurlu Sabit Maaş'];
                    return [fmt(value), name];
                  }}
                />
                
                {/* Volatile Income Bars */}
                <Bar dataKey="gercekGelir" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={40} />
                
                {/* AI Smoothed Line */}
                {smoothingActive && (
                  <Line 
                    type="monotone" 
                    dataKey="sabitMaas" 
                    stroke={P.blue} 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: P.blue, strokeWidth: 2, stroke: P.bg2 }} 
                    activeDot={{ r: 6, fill: P.blue }} 
                    style={{ strokeDasharray: '10, 10', animation: 'flowLine 1s linear infinite' }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </>
  );
}
