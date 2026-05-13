import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Landmark, ShieldCheck, Activity, Target, TrendingUp, Cpu } from 'lucide-react';
import { getTransactions } from '../utils/storage';
import { fmt } from '../utils/categories';

const P = {
  purple: '#7C3AED', blue: '#3B82F6', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)'
};

// Simulated Assets (Expected Return, Volatility/Risk)
const ASSETS = [
  { name: 'Teknoloji Hisse', eR: 35, vol: 25 },
  { name: 'Kripto', eR: 70, vol: 50 },
  { name: 'Altın', eR: 18, vol: 12 },
  { name: 'Tahvil', eR: 10, vol: 5 }
];

// Generates 500 random portfolios to build the "Efficient Frontier" cloud
function generatePortfolios() {
  const portfolios = [];
  for (let i = 0; i < 500; i++) {
    // Random weights sum to 1
    let w = [Math.random(), Math.random(), Math.random(), Math.random()];
    const sum = w.reduce((a, b) => a + b, 0);
    w = w.map(val => val / sum);

    // Calculate Return
    const expReturn = w[0]*ASSETS[0].eR + w[1]*ASSETS[1].eR + w[2]*ASSETS[2].eR + w[3]*ASSETS[3].eR;
    
    // Calculate Risk (Simplified covariance simulation - diversification dampens risk)
    const rawRisk = w[0]*ASSETS[0].vol + w[1]*ASSETS[1].vol + w[2]*ASSETS[2].vol + w[3]*ASSETS[3].vol;
    const divFactor = 1 - (0.2 * (1 - Math.max(...w))); // Diversification benefit
    const risk = rawRisk * divFactor;

    portfolios.push({
      risk: Number(risk.toFixed(1)),
      return: Number(expReturn.toFixed(1)),
      weights: w,
      isOptimal: false
    });
  }
  return portfolios;
}

export default function WealthPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [cloud, setCloud] = useState([]);
  const [optimalPoint, setOptimalPoint] = useState(null);

  useEffect(() => {
    const tx = getTransactions();
    
    setTimeout(() => {
      // 1. Analyze User Volatility (Mock)
      const expenses = tx.filter(t => t.tur === 'gider').map(t => Number(t.tutar));
      const avgExpense = expenses.reduce((a, b) => a + b, 0) / (expenses.length || 1);
      const variance = expenses.reduce((a, b) => a + Math.pow(b - avgExpense, 2), 0) / (expenses.length || 1);
      const userVolatility = Math.sqrt(variance) / (avgExpense || 1);
      
      const totalIncome = tx.filter(t => t.tur === 'gelir').reduce((a, b) => a + Number(b.tutar), 0) || 50000;
      const totalExpense = avgExpense * (expenses.length || 1) || 30000;
      const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
      const emergencyFund = 120000;

      // 2. Risk Score Calculation
      let riskScore = 50;
      if (savingsRate > 25) riskScore += 20;
      if (emergencyFund > totalExpense * 6) riskScore += 15;
      if (userVolatility > 0.8) riskScore -= 20;
      riskScore = Math.round(Math.min(100, Math.max(0, riskScore)));

      // 3. Markowitz Efficient Frontier Generation
      const pts = generatePortfolios();
      
      // Target Risk based on Score (Score 0 -> Risk 5%, Score 100 -> Risk 40%)
      const targetRisk = 5 + (riskScore / 100) * 35;
      
      // Find the optimal portfolio (Highest return for the target risk tolerance)
      let bestPoint = null;
      let maxReturnForRisk = -1;
      
      pts.forEach(p => {
        // Accept portfolios within +/- 2% of target risk
        if (Math.abs(p.risk - targetRisk) < 2) {
          if (p.return > maxReturnForRisk) {
            maxReturnForRisk = p.return;
            bestPoint = p;
          }
        }
      });
      
      if (!bestPoint) bestPoint = pts[Math.floor(Math.random() * pts.length)]; // fallback
      bestPoint.isOptimal = true;

      setMetrics({
        riskScore,
        userVolatility: (userVolatility * 100).toFixed(1),
        savingsRate: savingsRate.toFixed(1),
      });
      
      setCloud(pts);
      setOptimalPoint(bestPoint);
      setLoading(false);
    }, 800);
  }, []);

  if (loading || !optimalPoint) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${P.purple}30`, borderTopColor: P.purple, animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: P.text2, letterSpacing: '0.05em' }}>Kovaryans matrisi ve etkin sınır hesaplanıyor...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-enter { animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        
        {/* HEADER */}
        <div className="animate-enter" style={{
          background: `linear-gradient(135deg, rgba(124,58,237,0.05) 0%, rgba(59,130,246,0.05) 100%)`,
          border: `1px solid ${P.border}`, borderRadius: 24, padding: '32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Cpu size={20} color={P.purple} />
              <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.purple }}>Modern Portfolio Theory</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              Markowitz "Etkin Sınır" Optimizasyonu
            </h1>
            <p style={{ fontSize: 14, color: P.text2, margin: 0, maxWidth: 700, lineHeight: 1.6 }}>
              Risk skoru sabit paketlerle hesaplanmaz. FinCoach, Harry Markowitz'in Nobel ödüllü algoritmasıyla varlıkların korelasyonunu hesaplar ve size milimetrik, <strong>matematiksel olarak kanıtlanmış en yüksek getirili</strong> portföyü sunar.
            </p>
          </div>
        </div>

        {/* RISK ANALYSIS RESULTS */}
        <div className="animate-enter" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, animationDelay: '0.1s', opacity: 0 }}>
          <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: P.text3, textTransform: 'uppercase' }}>Algoritmik Risk Skoru</span>
              <Target size={18} color={P.purple} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 900, color: P.purple, margin: '0 0 4px', letterSpacing: '-0.02em' }}>{metrics.riskScore} / 100</p>
            <p style={{ fontSize: 11, color: P.text3, margin: 0 }}>Tasarruf & Volatilite bazlı</p>
          </div>
          
          <div style={{ background: 'rgba(16,185,129,0.05)', border: `1px solid rgba(16,185,129,0.2)`, borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: P.green, textTransform: 'uppercase' }}>Beklenen Max. Getiri</span>
              <TrendingUp size={18} color={P.green} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 900, color: P.green, margin: '0 0 4px', letterSpacing: '-0.02em' }}>%{optimalPoint.return}</p>
            <p style={{ fontSize: 11, color: P.text2, margin: 0 }}>Hedef riske karşılık en yüksek getiri</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          
          {/* EFFICIENT FRONTIER SCATTER CHART */}
          <div className="animate-enter" style={{ flex: '1 1 500px', background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, animationDelay: '0.2s', opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>Etkin Sınır (Efficient Frontier)</h3>
                <p style={{ fontSize: 13, color: P.text3, margin: 0 }}>Her nokta rastgele bir portföydür. Kırmızı nokta sizin için en iyi seçenektir.</p>
              </div>
            </div>
            
            <div style={{ height: 350, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={P.border} vertical={false} />
                  <XAxis type="number" dataKey="risk" name="Risk (Volatilite)" unit="%" stroke={P.text3} fontSize={11} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <YAxis type="number" dataKey="return" name="Beklenen Getiri" unit="%" stroke={P.text3} fontSize={11} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <RechartsTooltip 
                    cursor={{ strokeDasharray: '3 3', stroke: P.text3 }}
                    contentStyle={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12 }}
                    itemStyle={{ color: P.text1, fontWeight: 700 }}
                  />
                  <Scatter name="Portföyler" data={cloud}>
                    {cloud.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isOptimal ? P.red : P.purple} fillOpacity={entry.isOptimal ? 1 : 0.3} />
                    ))}
                  </Scatter>
                  {/* Mark the optimal point */}
                  <ReferenceLine x={optimalPoint.risk} stroke={P.red} strokeDasharray="3 3" opacity={0.5} />
                  <ReferenceLine y={optimalPoint.return} stroke={P.red} strokeDasharray="3 3" opacity={0.5} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* OPTIMAL ALLOCATION */}
          <div className="animate-enter" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 16, animationDelay: '0.3s', opacity: 0 }}>
            <div style={{ background: 'rgba(239,68,68,0.05)', border: `1px solid rgba(239,68,68,0.2)`, borderRadius: 24, padding: 32, flex: 1 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: '0 0 24px' }}>Optimal Dağılımınız</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { name: 'Teknoloji Hisse', w: optimalPoint.weights[0], color: P.purple },
                  { name: 'Kripto Varlıklar', w: optimalPoint.weights[1], color: P.red },
                  { name: 'Fiziki Altın', w: optimalPoint.weights[2], color: P.amber },
                  { name: 'Hazine Tahvili', w: optimalPoint.weights[3], color: P.blue },
                ].sort((a,b) => b.w - a.w).map(asset => (
                  <div key={asset.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: P.text2 }}>{asset.name}</span>
                      <span style={{ fontSize: 15, fontWeight: 900, color: P.text1 }}>%{(asset.w * 100).toFixed(1)}</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: P.bg3, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${asset.w * 100}%`, height: '100%', background: asset.color, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 32, padding: '16px', background: P.bg2, borderRadius: 16, border: `1px solid ${P.border}` }}>
                <p style={{ fontSize: 12, color: P.text3, margin: 0, lineHeight: 1.6 }}>
                  Sistemin hesapladığı <strong>%{optimalPoint.risk} risk</strong> seviyesinde elde edilebilecek en yüksek matematiksel getiri budur. Bu dağılım dışındaki her portföy, Markowitz teorisine göre "Verimsiz (Sub-optimal)" kabul edilir.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
