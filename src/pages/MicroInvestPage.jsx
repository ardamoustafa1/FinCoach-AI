import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Coins, TrendingUp, PiggyBank, Sparkles, ArrowRight, Apple, Bitcoin } from 'lucide-react';
import { getTransactions } from '../utils/storage';
import { fmt } from '../utils/categories';

const P = {
  purple: '#7C3AED', blue: '#3B82F6', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)'
};

export default function MicroInvestPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      const tx = getTransactions().filter(t => t.tur === 'gider').slice(0, 50); // Get recent 50 expenses
      
      let totalSpareChange = 0;
      const recentRounds = [];

      tx.forEach(t => {
        const amount = Number(t.tutar);
        const rounded = Math.ceil(amount / 100) * 100; // Round up to nearest 100
        const spareChange = rounded - amount;
        
        if (spareChange > 0 && spareChange < 100) {
          totalSpareChange += spareChange;
          if (recentRounds.length < 5) {
            recentRounds.push({
              magaza: t.magaza || t.aciklama,
              amount: amount,
              rounded: rounded,
              change: spareChange
            });
          }
        }
      });

      // Projection (assuming this happens every month for a year)
      const monthlySpareChange = totalSpareChange * (30 / (tx.length || 1)); // Extrapolate to monthly
      const annualProjection = monthlySpareChange * 12;
      const investedValue = annualProjection * 1.15; // 15% return

      let projectionSeries = [];
      let currentAmount = 0;
      for(let i=0; i<=12; i++) {
        projectionSeries.push({
          month: `${i}. Ay`,
          birikim: Math.round(currentAmount)
        });
        currentAmount += monthlySpareChange * 1.0125; // Compound monthly ~15% APY
      }

      setData({
        totalSpareChange,
        recentRounds,
        monthlySpareChange,
        annualProjection,
        investedValue
      });
      setChartData(projectionSeries);
      setLoading(false);
    }, 800);
  }, []);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${P.amber}30`, borderTopColor: P.amber, animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: P.text2, letterSpacing: '0.05em' }}>Küsüratlar toplanıyor...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-enter { animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .coin-spin { animation: coinSpin 3s linear infinite; }
        @keyframes coinSpin { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        
        {/* HEADER */}
        <div className="animate-enter" style={{
          background: `linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(16,185,129,0.05) 100%)`,
          border: `1px solid ${P.border}`, borderRadius: 24, padding: '32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Coins size={20} color={P.amber} />
              <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.amber }}>Mikro-Yatırım (Acorns Modeli)</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              Küsürat Yatırımı AI
            </h1>
            <p style={{ fontSize: 14, color: P.text2, margin: 0, maxWidth: 650, lineHeight: 1.6 }}>
              Her harcamanızı en yakın 100 ₺'ye yuvarlar. Artan küsüratlar ruhunuz bile duymadan arka planda <strong style={{color: P.green}}>fraksiyonel hisse senedi ve altına</strong> dönüşür.
            </p>
          </div>
        </div>

        {/* METRICS */}
        <div className="animate-enter" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, animationDelay: '0.1s', opacity: 0 }}>
          <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: P.text3, textTransform: 'uppercase' }}>Bu Ay Toplanan Küsürat</span>
              <PiggyBank size={18} color={P.amber} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 900, color: P.text1, margin: 0 }}>{fmt(data.monthlySpareChange)}</p>
            <p style={{ fontSize: 11, color: P.text3, margin: '4px 0 0 0' }}>Hiç efor sarf etmeden birikti</p>
          </div>
          
          <div style={{ background: 'rgba(16,185,129,0.05)', border: `1px solid rgba(16,185,129,0.2)`, borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: P.green, textTransform: 'uppercase' }}>1 Yıllık Tahmini Yatırım</span>
              <TrendingUp size={18} color={P.green} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 900, color: P.green, margin: 0 }}>{fmt(data.investedValue)}</p>
            <p style={{ fontSize: 11, color: P.text2, margin: '4px 0 0 0' }}>Bileşik faiz ve fon getirisi ile</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {/* RECENT ROUNDUPS */}
          <div className="animate-enter" style={{ flex: '1 1 350px', background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, animationDelay: '0.2s', opacity: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color={P.amber} /> Son Yuvarlanan İşlemler
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.recentRounds.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: P.bg3, borderRadius: 16, border: `1px solid ${P.border}` }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>{item.magaza}</p>
                    <p style={{ fontSize: 12, color: P.text3, margin: 0, textDecoration: 'line-through' }}>{fmt(item.amount)}</p>
                  </div>
                  <ArrowRight size={16} color={P.text3} />
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>{fmt(item.rounded)}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(245,158,11,0.1)', color: P.amber, padding: '2px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                      +{fmt(item.change)} Yatırım
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: 24, padding: '16px', background: 'rgba(59,130,246,0.1)', borderRadius: 16, border: `1px solid rgba(59,130,246,0.2)` }}>
              <p style={{ fontSize: 13, color: P.text1, margin: '0 0 8px', fontWeight: 600 }}>Mikro-Portföy Dağılımınız</p>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Apple size={16} color={P.text2} /><span style={{fontSize: 12, color: P.text2}}>%60 AAPL</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Bitcoin size={16} color={P.amber} /><span style={{fontSize: 12, color: P.text2}}>%40 BTC</span></div>
              </div>
            </div>
          </div>

          {/* PROJECTION CHART */}
          <div className="animate-enter" style={{ flex: '1 1 500px', background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, animationDelay: '0.3s', opacity: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: '0 0 8px' }}>1 Yıllık Küsürat Birikimi</h3>
            <p style={{ fontSize: 13, color: P.text3, margin: '0 0 24px' }}>Harcama alışkanlıklarınız değişmezse hisse senedi büyümesi.</p>
            
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmber" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={P.amber} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={P.amber} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={P.border} vertical={false} />
                  <XAxis dataKey="month" stroke={P.text3} fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke={P.text3} fontSize={11} tickFormatter={(val) => `₺${(val/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12 }}
                    itemStyle={{ color: P.text1, fontWeight: 700 }}
                    formatter={(value) => [fmt(value), 'Toplam Değer']}
                  />
                  <Area type="monotone" dataKey="birikim" stroke={P.amber} strokeWidth={3} fillOpacity={1} fill="url(#colorAmber)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
