import { useState, useEffect } from 'react';
import { ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Waves, Lock, Zap, TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react';
import { fmt } from '../utils/categories';

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
    setLoading(true);
    setTimeout(() => {
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
  }, []);

  const activateSmoothing = () => {
    setSmoothingActive(true);
  };

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${P.blue}30`, borderTopColor: P.blue, animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: P.text2, letterSpacing: '0.05em' }}>Serbest meslek gelir oynaklığı analiz ediliyor...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-enter { animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes flowLine { to { stroke-dashoffset: -20; } }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        
        {/* HEADER */}
        <div className="animate-enter" style={{
          background: `linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(16,185,129,0.05) 100%)`,
          border: `1px solid ${P.border}`, borderRadius: 24, padding: '32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Waves size={20} color={P.blue} />
              <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.blue }}>Freelancer & Esnaf Asistanı</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              Düzensiz Gelir Dengeleyici
            </h1>
            <p style={{ fontSize: 14, color: P.text2, margin: 0, maxWidth: 650, lineHeight: 1.6 }}>
              Aydan aya değişen stresli gelir modelinizi bitirin. Yapay zeka, yüksek kazandığınız aylardaki fazlalığı kasaya kilitler ve size her ay huzurlu, <strong>sabit bir maaş</strong> öder.
            </p>
          </div>
          
          {!smoothingActive ? (
             <button onClick={activateSmoothing} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 16, border: 'none', background: `linear-gradient(135deg, ${P.blue}, #2563EB)`, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: `0 8px 24px rgba(59,130,246,0.3)`, transition: 'all 0.2s', animation: 'fadeSlideUp 0.5s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
               <RefreshCw size={18} /> Sistemi Aktif Et
             </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 16, background: 'rgba(16,185,129,0.1)', border: `1px solid rgba(16,185,129,0.3)`, color: P.green, fontSize: 15, fontWeight: 800, animation: 'fadeSlideUp 0.3s ease' }}>
               <CheckCircle2 size={18} /> Sistem Aktif
            </div>
          )}
        </div>

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
