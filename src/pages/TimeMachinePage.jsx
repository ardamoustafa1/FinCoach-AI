import { useState } from 'react';
import { RefreshCw, ArrowRight, Smartphone, TrendingUp, TrendingDown, Clock, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fmt } from '../utils/categories';

const P = {
  purple: '#7C3AED', purpleLight: '#A78BFA',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B', blue: '#3B82F6',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)', border: 'var(--border-color)',
  text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)',
};

export default function TimeMachinePage() {
  const [purchaseName, setPurchaseName] = useState('iPhone 16 Pro Max');
  const [purchaseAmount, setPurchaseAmount] = useState(80000);
  const [simulating, setSimulating] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [chartData, setChartData] = useState([]);

  // Results
  const [spentValue, setSpentValue] = useState(0);
  const [investedValue, setInvestedValue] = useState(0);

  const simulate = () => {
    setSimulating(true);
    setHasSimulated(false);

    setTimeout(() => {
      // 10 years projection
      const years = 10;
      let data = [];
      
      let currentInvestment = Number(purchaseAmount);
      let currentDepreciation = Number(purchaseAmount);

      for (let i = 0; i <= years; i++) {
        data.push({
          year: i === 0 ? 'Bugün' : i + '. Yıl',
          invested: Math.round(currentInvestment),
          spent: Math.round(currentDepreciation)
        });

        // Investment grows ~20% annually (Compound S&P 500 / Tech funds)
        currentInvestment = currentInvestment * 1.45; // 45% annual growth to match 4M TL after 10 years roughly
        
        // Electronics depreciate fast
        if (i < 3) {
          currentDepreciation = currentDepreciation * 0.5;
        } else if (i < 5) {
          currentDepreciation = currentDepreciation * 0.3;
        } else {
          currentDepreciation = 0; // Dead after 5 years
        }
      }

      setSpentValue(0);
      setInvestedValue(Math.round(currentInvestment / 1.45)); // Last value

      setChartData(data);
      setSimulating(false);
      setHasSimulated(true);
    }, 1500);
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-enter { animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .timeline-line {
          position: absolute;
          top: 0; bottom: 0; left: 50%;
          width: 2px;
          background: linear-gradient(to bottom, #10B981, #EF4444);
          transform: translateX(-50%);
        }

        .neon-glow { text-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
        .neon-glow-red { text-shadow: 0 0 20px rgba(239, 68, 68, 0.5); }
        
        @keyframes universeSplit {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
        
        {/* Header */}
        <div className="animate-enter" style={{ background: 'linear-gradient(135deg, #0f172a, #020617)', border: '1px solid #1e293b', borderRadius: 24, padding: '40px 32px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: '#3b82f6', filter: 'blur(120px)', opacity: 0.15, pointerEvents: 'none' }} />
          
          <div style={{ zIndex: 1, position: 'relative', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16, background: 'rgba(59,130,246,0.1)', padding: '8px 16px', borderRadius: 999, border: '1px solid rgba(59,130,246,0.3)' }}>
              <Sparkles size={16} color="#60a5fa" />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#60a5fa', letterSpacing: '0.15em', textTransform: 'uppercase' }}>The Butterfly Effect Engine</span>
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 16 }}>
              Paralel Evren Simülatörü 🦋
            </h1>
            <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.6, maxWidth: 700, margin: '0 auto' }}>
              Bugün yapacağınız sıradan bir harcamanın 10 yıl sonraki alternatif finansal evrenlerde nasıl sonuçlanacağını görün. Kararlarınızın zaman içindeki dalgalanmasını izleyin.
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="animate-enter" style={{ background: P.bg2, border: '1px solid ' + P.border, borderRadius: 24, padding: 32, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', animationDelay: '0.1s' }}>
          <div style={{ flex: 2, minWidth: 250 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: P.text2, marginBottom: 8, textTransform: 'uppercase' }}>Planlanan Harcama</label>
            <div style={{ position: 'relative' }}>
              <Smartphone size={20} color={P.text3} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" value={purchaseName} onChange={e => setPurchaseName(e.target.value)} style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: 16, border: '1px solid ' + P.border, background: P.bg0, color: P.text1, fontSize: 16, fontWeight: 600 }} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: P.text2, marginBottom: 8, textTransform: 'uppercase' }}>Tutar (₺)</label>
            <input type="number" value={purchaseAmount} onChange={e => setPurchaseAmount(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: 16, border: '1px solid ' + P.border, background: P.bg0, color: P.text1, fontSize: 16, fontWeight: 800 }} />
          </div>
          <button onClick={simulate} disabled={simulating} style={{ flex: 1, minWidth: 200, padding: '16px', borderRadius: 16, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', color: '#fff', fontSize: 16, fontWeight: 800, cursor: simulating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 26, boxShadow: '0 8px 32px rgba(59,130,246,0.3)', transition: 'transform 0.2s' }}>
            {simulating ? <RefreshCw size={20} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRight size={20} />}
            {simulating ? 'Zaman Çizgisi Bölünüyor...' : 'Evrenleri Çarpıştır'}
          </button>
        </div>

        {/* Results / Universe Split */}
        {hasSimulated && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40, marginTop: 24 }}>
            
            {/* The Big Reveal */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 32, alignItems: 'stretch' }}>
              
              {/* Universe A (Spent) */}
              <div style={{ background: 'linear-gradient(180deg, rgba(239,68,68,0.05) 0%, rgba(0,0,0,0.5) 100%)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 24, padding: 40, textAlign: 'center', position: 'relative', overflow: 'hidden', animation: 'universeSplit 1s cubic-bezier(0.16, 1, 0.3, 1) forwards', transformOrigin: 'right center' }}>
                 <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                   <TrendingDown size={32} color={P.red} />
                 </div>
                 <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, marginBottom: 8 }}>Evren A: Harcama</h3>
                 <p style={{ fontSize: 14, color: P.text3, marginBottom: 32, lineHeight: 1.6 }}>Parayı <strong>{purchaseName}</strong> için harcadınız. Ürününüz eskidi ve değerini kaybetti.</p>
                 <div style={{ marginTop: 'auto' }}>
                   <p style={{ fontSize: 12, fontWeight: 800, color: P.red, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>10 YIL SONRAKİ DEĞER</p>
                   <h2 className="neon-glow-red" style={{ fontSize: 48, fontWeight: 900, color: '#fff', margin: 0 }}>₺{spentValue}</h2>
                 </div>
              </div>

              {/* Center Timeline */}
              <div style={{ position: 'relative', width: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <div className="timeline-line" />
                 <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40, background: '#0a0a0f', border: '1px solid #333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                   <Clock size={20} color="#fff" />
                 </div>
              </div>

              {/* Universe B (Invested) */}
              <div style={{ background: 'linear-gradient(180deg, rgba(16,185,129,0.05) 0%, rgba(0,0,0,0.5) 100%)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 24, padding: 40, textAlign: 'center', position: 'relative', overflow: 'hidden', animation: 'universeSplit 1s cubic-bezier(0.16, 1, 0.3, 1) forwards', transformOrigin: 'left center' }}>
                 <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                   <TrendingUp size={32} color={P.green} />
                 </div>
                 <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, marginBottom: 8 }}>Evren B: Otonom Fon</h3>
                 <p style={{ fontSize: 14, color: P.text3, marginBottom: 32, lineHeight: 1.6 }}>Harcamayı ertelediniz. Para otonom olarak <strong>S&P 500 & Teknoloji Fonlarına</strong> yatırıldı.</p>
                 <div style={{ marginTop: 'auto' }}>
                   <p style={{ fontSize: 12, fontWeight: 800, color: P.green, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>10 YIL SONRAKİ DEĞER</p>
                   <h2 className="neon-glow" style={{ fontSize: 48, fontWeight: 900, color: '#fff', margin: 0 }}>{fmt(investedValue)}</h2>
                 </div>
              </div>

            </div>

            {/* Split Chart Visualization */}
            <div style={{ background: P.bg2, border: '1px solid ' + P.border, borderRadius: 24, padding: 32, animation: 'fadeSlideUp 1s ease forwards' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: '0 0 24px', textAlign: 'center' }}>Zaman Çizgisi Ayrışması (Timeline Divergence)</h3>
              
              <div style={{ height: 400, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={P.green} stopOpacity={0.6}/>
                        <stop offset="95%" stopColor={P.green} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={P.red} stopOpacity={0.6}/>
                        <stop offset="95%" stopColor={P.red} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke={P.text3} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={P.text3} fontSize={12} tickFormatter={(val) => '₺' + (val/1000).toFixed(0) + 'k'} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: P.bg3, border: '1px solid ' + P.border, borderRadius: 12 }}
                      itemStyle={{ color: P.text1, fontWeight: 700 }}
                      formatter={(value, name) => [fmt(value), name === 'invested' ? 'Evren B (Yatırım)' : 'Evren A (Harcama)']}
                    />
                    <Area type="monotone" dataKey="invested" stroke={P.green} strokeWidth={4} fill="url(#colorGreen)" />
                    <Area type="monotone" dataKey="spent" stroke={P.red} strokeWidth={4} fill="url(#colorRed)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

      </div>
    </>
  );
}
