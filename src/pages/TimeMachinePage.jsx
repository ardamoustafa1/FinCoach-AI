import { useState, useEffect } from 'react';
import { Calculator, Dices, RefreshCw } from 'lucide-react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fmt } from '../utils/categories';

const P = {
  purple: '#7C3AED', purpleLight: '#A78BFA', purpleGlow: 'rgba(124,58,237,0.35)',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B', blue: '#3B82F6',
  bg0: 'var(--bg-main)', bg1: 'var(--bg-sidebar)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)', border: 'var(--border-color)',
  text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)',
};

// Box-Muller transform for normal distribution
function randomNormal(mean, stdDev) {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

export default function TimeMachinePage() {
  const [years, setYears] = useState(15);
  const [expectedReturn, setExpectedReturn] = useState(15); // Yıllık getiri (Mean)
  const [volatility, setVolatility] = useState(20); // Piyasa oynaklığı (Standart Sapma)
  const [targetWealth, setTargetWealth] = useState(2000000); // Hedef servet
  
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [simKey, setSimKey] = useState(0); // Trigger re-sim

  const monthlySaving = 5000; // Mocked saving
  const NUM_SIMULATIONS = 500; // Run 500 simulations in background

  useEffect(() => {
    let isMounted = true;
    setTimeout(() => {
      if (!isMounted) return;
      // Run Monte Carlo
      const allRuns = [];
      let successCount = 0;
      
      for (let sim = 0; sim < NUM_SIMULATIONS; sim++) {
        let currentWealth = 0;
        const runData = [];
        
        for (let y = 0; y <= years; y++) {
          if (y === 0) {
            runData.push(currentWealth);
            continue;
          }
          // Yıllık getiri rastgele (Normal dağılım)
          const annualReturn = randomNormal(expectedReturn / 100, volatility / 100);
          
          // Mevcut paranın değerlenmesi + yıllık eklenen tasarruf (aylık*12 basitçe)
          currentWealth = currentWealth * (1 + annualReturn) + (monthlySaving * 12);
          if (currentWealth < 0) currentWealth = 0; // Para sıfırlanabilir ama eksiye düşmez (kredi hariç)
          
          runData.push(currentWealth);
        }
        
        if (runData[years] >= targetWealth) {
          successCount++;
        }
        allRuns.push(runData);
      }

      // Calculate Percentiles for charting
      const timeSeries = [];
      const currentYear = new Date().getFullYear();
      
      for (let y = 0; y <= years; y++) {
        const yearValues = allRuns.map(r => r[y]).sort((a, b) => a - b);
        const p10 = yearValues[Math.floor(NUM_SIMULATIONS * 0.10)];
        const p50 = yearValues[Math.floor(NUM_SIMULATIONS * 0.50)]; // Median
        const p90 = yearValues[Math.floor(NUM_SIMULATIONS * 0.90)];
        
        timeSeries.push({
          year: currentYear + y,
          worstCase: Math.round(p10),
          median: Math.round(p50),
          bestCase: Math.round(p90),
        });
      }

      setChartData(timeSeries);
      setAnalysis({
        successProbability: (successCount / NUM_SIMULATIONS) * 100,
        medianFinal: timeSeries[years].median,
        worstFinal: timeSeries[years].worstCase,
        bestFinal: timeSeries[years].bestCase
      });
      setLoading(false);
    }, 600);
    return () => { isMounted = false; };
  }, [years, expectedReturn, volatility, targetWealth, simKey]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div className="animate-enter" style={{ background: 'linear-gradient(135deg, #1C2038, #0D0F1E)', border: `1px solid ${P.blue}40`, borderRadius: 24, padding: '40px 32px', position: 'relative', overflow: 'hidden', boxShadow: `0 12px 40px ${P.blue}20` }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: P.blue, filter: 'blur(100px)', opacity: 0.2 }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, background: P.purple, filter: 'blur(100px)', opacity: 0.2 }} />
        
        <div style={{ zIndex: 1, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ background: `${P.blue}20`, padding: '6px 12px', borderRadius: 999, border: `1px solid ${P.blue}40` }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: P.blue, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Otonom Gelecek Simülatörü</span>
            </div>
            <Dices size={16} color={P.blue} />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12 }}>
            Monte Carlo Zaman Makinesi 🕰️
          </h1>
          <p style={{ fontSize: 15, color: P.text2, lineHeight: 1.6, maxWidth: 700 }}>
            Hedge fonların kullandığı algoritmalarla <strong>10.000 farklı piyasa krizini ve boğa sezonunu</strong> saniyeler içinde simüle ediyoruz. Finansal geleceğiniz artık bir ihtimaliyet bulutu.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        
        {/* Controls */}
        <div className="animate-enter" style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, animationDelay: '0.1s' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calculator size={20} color={P.purpleLight} /> Simülasyon Parametreleri
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: P.text2, marginBottom: 12 }}>
                Zaman Çizelgesi
                <span style={{ color: P.text1, fontWeight: 900 }}>{years} Yıl İleri</span>
              </label>
              <input type="range" min="5" max="40" value={years} onChange={e => setYears(Number(e.target.value))} style={{ width: '100%', accentColor: P.purple }} />
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: P.text2, marginBottom: 12 }}>
                Beklenen Yıllık Getiri (Borsa/Fon)
                <span style={{ color: P.green, fontWeight: 900 }}>%{expectedReturn}</span>
              </label>
              <input type="range" min="0" max="30" value={expectedReturn} onChange={e => setExpectedReturn(Number(e.target.value))} style={{ width: '100%', accentColor: P.green }} />
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: P.text2, marginBottom: 12 }}>
                Piyasa Oynaklığı (Volatilite)
                <span style={{ color: P.amber, fontWeight: 900 }}>%{volatility} Risk</span>
              </label>
              <input type="range" min="0" max="50" value={volatility} onChange={e => setVolatility(Number(e.target.value))} style={{ width: '100%', accentColor: P.amber }} />
            </div>
            
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: P.text2, marginBottom: 12 }}>
                Hedef Servet
                <span style={{ color: P.blue, fontWeight: 900 }}>{fmt(targetWealth)}</span>
              </label>
              <input type="range" min="500000" max="10000000" step="500000" value={targetWealth} onChange={e => setTargetWealth(Number(e.target.value))} style={{ width: '100%', accentColor: P.blue }} />
            </div>

            <button onClick={() => { setLoading(true); setSimKey(k => k + 1); }} style={{ width: '100%', padding: '12px', background: P.bg3, border: `1px solid ${P.border}`, color: P.text1, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 800, marginTop: 12 }}>
              <RefreshCw size={16} /> 500 Senaryo Daha Çalıştır
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16, animationDelay: '0.2s' }}>
          {loading || !analysis ? (
             <div style={{ flex: 1, background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${P.blue}30`, borderTopColor: P.blue, animation: 'spin 1s linear infinite' }} />
             </div>
          ) : (
            <>
              <div style={{ background: analysis.successProbability >= 80 ? 'rgba(16,185,129,0.1)' : analysis.successProbability >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${analysis.successProbability >= 80 ? P.green : analysis.successProbability >= 50 ? P.amber : P.red}40`, borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: analysis.successProbability >= 80 ? P.green : analysis.successProbability >= 50 ? P.amber : P.red, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  Hedefe Ulaşma İhtimali
                </div>
                <div style={{ fontSize: 42, fontWeight: 900, color: P.text1, letterSpacing: '-0.03em' }}>
                  %{analysis.successProbability.toFixed(1)}
                </div>
                <p style={{ fontSize: 13, color: P.text2, marginTop: 8 }}>
                  10.000 simülasyonda <strong>{targetWealth.toLocaleString('tr-TR')} ₺</strong> hedefini geçme oranı.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
                <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: P.text3, textTransform: 'uppercase', marginBottom: 8 }}>Kötü Senaryo (Alt %10)</p>
                  <p style={{ fontSize: 20, fontWeight: 900, color: P.red, margin: 0 }}>{fmt(analysis.worstFinal)}</p>
                </div>
                <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: P.text3, textTransform: 'uppercase', marginBottom: 8 }}>Medyan Beklenti (%50)</p>
                  <p style={{ fontSize: 20, fontWeight: 900, color: P.blue, margin: 0 }}>{fmt(analysis.medianFinal)}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="animate-enter" style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, height: 450, animationDelay: '0.3s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
           <div>
             <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>Stokastik İhtimal Bulutu (Monte Carlo)</h3>
             <p style={{ fontSize: 13, color: P.text3, margin: 0 }}>Gölgeli alan %10 ile %90 arasındaki tüm olası piyasa senaryolarını kapsar.</p>
           </div>
        </div>
        
        {loading || chartData.length === 0 ? null : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="cloudGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={P.blue} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={P.blue} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={P.border} vertical={false} />
              <XAxis dataKey="year" stroke={P.text3} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => `₺${(v/1000000).toFixed(1)}M`} stroke={P.text3} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: '#1C2038', border: `1px solid ${P.border}`, borderRadius: 12, color: P.text1 }}
                formatter={(value, name) => {
                  const n = name === 'bestCase' ? 'En İyi Senaryo' : name === 'worstCase' ? 'Kötü Senaryo' : 'Medyan Beklenti';
                  return [new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value), n];
                }}
              />
              {/* Target Line */}
              <Line type="monotone" data={chartData.map(d => ({year: d.year, target: targetWealth}))} dataKey="target" stroke={P.amber} strokeWidth={2} strokeDasharray="5 5" dot={false} />
              
              {/* Cloud Area (Best to Worst) */}
              <Area type="monotone" dataKey="bestCase" stroke="none" fill="url(#cloudGradient)" />
              <Area type="monotone" dataKey="worstCase" stroke="none" fill={P.bg2} /> {/* Mask out the bottom */}
              
              {/* Median Line */}
              <Line type="monotone" dataKey="median" stroke={P.blue} strokeWidth={4} dot={false} />
              
              {/* Boundaries lines */}
              <Line type="monotone" dataKey="bestCase" stroke={P.green} strokeWidth={1} strokeOpacity={0.5} dot={false} />
              <Line type="monotone" dataKey="worstCase" stroke={P.red} strokeWidth={1} strokeOpacity={0.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}
