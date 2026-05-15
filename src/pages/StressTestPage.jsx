import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Globe, AlertTriangle, TrendingDown, ArrowRightLeft, Briefcase, Zap } from 'lucide-react';
import useStore from '../store/useStore';
import { fmt } from '../utils/categories';

const P = {
  purple: '#7C3AED', blue: '#3B82F6', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)'
};

const SCENARIOS = [
  {
    id: 'base',
    name: 'Mevcut Durum (Baz Senaryo)',
    desc: 'Mevcut ekonomik koşulların aynı şekilde devam edeceği varsayımı.',
    inflation: 0.40, // 40%
    incomeGrowth: 0.45,
    expenseMultiplier: 1.0,
    icon: Briefcase,
    color: P.blue
  },
  {
    id: 'inflation_shock',
    name: 'Hiperenflasyon Şoku',
    desc: 'Tüketici fiyatlarının hızla arttığı, alım gücünün eridiği stres senaryosu.',
    inflation: 0.85, // 85%
    incomeGrowth: 0.50, // Income lags behind inflation
    expenseMultiplier: 1.45,
    icon: TrendingDown,
    color: P.red
  },
  {
    id: 'recession',
    name: 'Ekonomik Daralma (Resesyon)',
    desc: 'İşsizlik riskinin arttığı ve gelir büyümesinin durduğu durgunluk senaryosu.',
    inflation: 0.25,
    incomeGrowth: 0.05,
    expenseMultiplier: 1.10,
    icon: AlertTriangle,
    color: P.amber
  },
  {
    id: 'currency_shock',
    name: 'Kur Şoku (Devalüasyon)',
    desc: 'İthalata dayalı giderlerin (teknoloji, enerji) aniden %60 arttığı senaryo.',
    inflation: 0.60,
    incomeGrowth: 0.30,
    expenseMultiplier: 1.30,
    icon: ArrowRightLeft,
    color: P.purple
  }
];

export default function StressTestPage() {
  const [activeScenarioId, setActiveScenarioId] = useState('base');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState([]);

  const activeScenario = SCENARIOS.find(s => s.id === activeScenarioId);

  useEffect(() => {
    let isMounted = true;
    setTimeout(() => { if (isMounted) setLoading(true); }, 0);
    
    // Simulate AI model calculation delay
    const timer = setTimeout(() => {
      if (!isMounted) return;
      const tx = useStore.getState().transactions;
      
      // Calculate base metrics
      const totalIncome = tx.filter(t => t.tur === 'gelir').reduce((a, b) => a + Number(b.tutar), 0) || 45000;
      const totalExpense = tx.filter(t => t.tur === 'gider').reduce((a, b) => a + Number(b.tutar), 0) || 28000;
      
      const currentSavingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
      const emergencyFund = 85000; // Mocked existing savings
      
      const scenarioIncome = totalIncome * (1 + activeScenario.incomeGrowth);
      const scenarioExpense = totalExpense * activeScenario.expenseMultiplier;
      const scenarioSavingsRate = ((scenarioIncome - scenarioExpense) / scenarioIncome) * 100;
      
      // Calculate Purchasing Power Erosion over 12 months
      const purchasingPowerBase = 100000;
      let data = [];
      for(let month = 0; month <= 12; month++) {
        // Compound monthly inflation = (1 + annual)^(1/12) - 1
        const monthlyInflation = Math.pow(1 + activeScenario.inflation, 1/12) - 1;
        const currentPower = purchasingPowerBase / Math.pow(1 + monthlyInflation, month);
        
        data.push({
          month: month === 0 ? 'Bugün' : `${month}. Ay`,
          power: Math.round(currentPower),
          nominal: purchasingPowerBase
        });
      }

      // Runway (Months emergency fund will last)
      const currentRunway = emergencyFund / totalExpense;
      const scenarioRunway = emergencyFund / scenarioExpense;

      setMetrics({
        totalIncome, scenarioIncome,
        totalExpense, scenarioExpense,
        currentSavingsRate, scenarioSavingsRate,
        currentRunway, scenarioRunway,
        emergencyFund
      });
      setChartData(data);
      setLoading(false);
    }, 600);

    return () => { isMounted = false; clearTimeout(timer); };
  }, [activeScenarioId, activeScenario]);

  const generateAdvice = () => {
    if (!metrics) return "";
    if (activeScenarioId === 'base') return "Mevcut finansal planınız sürdürülebilir görünmektedir. Birikim oranınızı %20'nin üzerinde tutmaya devam edin.";
    if (activeScenarioId === 'inflation_shock') return "ALARM: Alım gücünüz 12 ay içinde dramatik şekilde eriyecektir. Nakitte kalmak yerine enflasyon korumalı varlıklara (Emtia, Hisse Senedi) geçiş yapmanız ve acil durum fonunuzu %45 oranında artırmanız zorunludur.";
    if (activeScenarioId === 'recession') return "DİKKAT: Gelir artışınızın duracağı bu senaryoda, sabit giderleriniz nakit akışınızı boğabilir. Discretionary (İsteğe bağlı) harcamaları derhal %30 kesmeli ve likiditeyi artırmalısınız.";
    if (activeScenarioId === 'currency_shock') return "RİSKLİ: İthal girdi maliyetlerindeki artış, yaşam standartlarınızı düşürecek. Döviz bazlı aboneliklerinizi iptal edin ve döviz riskinden korunma (hedging) stratejileri uygulayın.";
    return "";
  };

  return (
    <>
      <style>{`
        @keyframes pulseAlert { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40, animation: 'fadeSlideUp 0.5s ease' }}>
        
        {/* HEADER */}
        <div style={{
          background: `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)`,
          border: `1px solid ${P.border}`, borderRadius: 24, padding: '32px',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 1, background: `linear-gradient(90deg, transparent, ${activeScenario.color}, transparent)` }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${activeScenario.color}20`, border: `1px solid ${activeScenario.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={24} color={activeScenario.color} />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: P.text1, margin: 0, letterSpacing: '-0.02em' }}>Makro-Ekonomik Stres Testi</h1>
              <p style={{ fontSize: 13, color: P.text3, margin: '2px 0 0 0', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>FinCoach AI Wealth Management</p>
            </div>
          </div>
          <p style={{ fontSize: 14, color: P.text2, margin: 0, maxWidth: 700, lineHeight: 1.6 }}>
            Bu modül, bankaların ve kurumsal firmaların kullandığı stres testi metodolojisini bireysel bütçenize uygular. Farklı kriz senaryolarında finansal sağlığınızın nasıl etkileneceğini analiz edin.
          </p>
        </div>

        {/* SCENARIO SELECTOR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {SCENARIOS.map(sc => (
            <button
              key={sc.id}
              onClick={() => setActiveScenarioId(sc.id)}
              style={{
                textAlign: 'left', padding: '20px', borderRadius: 20, cursor: 'pointer',
                background: activeScenarioId === sc.id ? `${sc.color}10` : P.bg2,
                border: `1px solid ${activeScenarioId === sc.id ? sc.color : P.border}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: activeScenarioId === sc.id ? `0 8px 32px ${sc.color}20` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <sc.icon size={18} color={sc.color} />
                <span style={{ fontSize: 15, fontWeight: 800, color: P.text1 }}>{sc.name}</span>
              </div>
              <p style={{ fontSize: 12, color: P.text3, margin: 0, lineHeight: 1.5 }}>{sc.desc}</p>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: P.bg2, borderRadius: 24, border: `1px solid ${P.border}` }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${activeScenario.color}30`, borderTopColor: activeScenario.color, animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: P.text2 }}>Senaryo hesaplanıyor...</p>
             </div>
          </div>
        ) : metrics && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeSlideUp 0.4s ease' }}>
            
            {/* ADVICE ALERT */}
            <div style={{
              background: activeScenarioId === 'base' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${activeScenarioId === 'base' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 16, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start'
            }}>
               <div style={{ width: 48, height: 48, borderRadius: 16, background: activeScenarioId === 'base' ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: activeScenarioId !== 'base' ? 'pulseAlert 2s infinite' : 'none' }}>
                 <Zap size={24} color="#fff" />
               </div>
               <div>
                 <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: '0 0 8px' }}>Yapay Zeka Servet Yöneticisi Tavsiyesi</h3>
                 <p style={{ fontSize: 14, color: P.text2, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                   {generateAdvice()}
                 </p>
               </div>
            </div>

            {/* METRICS COMPARISON */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
               {/* Savings Rate */}
               <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24 }}>
                 <p style={{ fontSize: 12, fontWeight: 800, color: P.text3, textTransform: 'uppercase', marginBottom: 16 }}>Aylık Tasarruf Oranı (Savings Rate)</p>
                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                   <div>
                     <p style={{ fontSize: 11, color: P.text3, marginBottom: 4 }}>Mevcut</p>
                     <p style={{ fontSize: 24, fontWeight: 800, color: P.text1, margin: 0 }}>%{metrics.currentSavingsRate.toFixed(1)}</p>
                   </div>
                   <div style={{ paddingBottom: 6 }}><ArrowRightLeft size={16} color={P.text3} /></div>
                   <div>
                     <p style={{ fontSize: 11, color: activeScenario.color, marginBottom: 4 }}>Senaryo</p>
                     <p style={{ fontSize: 28, fontWeight: 900, color: metrics.scenarioSavingsRate < 0 ? P.red : activeScenario.color, margin: 0 }}>
                       %{metrics.scenarioSavingsRate.toFixed(1)}
                     </p>
                   </div>
                 </div>
               </div>

               {/* Runway */}
               <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24 }}>
                 <p style={{ fontSize: 12, fontWeight: 800, color: P.text3, textTransform: 'uppercase', marginBottom: 16 }}>Acil Durum Fonu Yeterliliği (Runway)</p>
                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                   <div>
                     <p style={{ fontSize: 11, color: P.text3, marginBottom: 4 }}>Mevcut</p>
                     <p style={{ fontSize: 24, fontWeight: 800, color: P.text1, margin: 0 }}>{metrics.currentRunway.toFixed(1)} Ay</p>
                   </div>
                   <div style={{ paddingBottom: 6 }}><ArrowRightLeft size={16} color={P.text3} /></div>
                   <div>
                     <p style={{ fontSize: 11, color: activeScenario.color, marginBottom: 4 }}>Senaryo</p>
                     <p style={{ fontSize: 28, fontWeight: 900, color: metrics.scenarioRunway < 3 ? P.red : activeScenario.color, margin: 0 }}>
                       {metrics.scenarioRunway.toFixed(1)} Ay
                     </p>
                   </div>
                 </div>
               </div>
            </div>

            {/* PURCHASING POWER CHART */}
            <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32 }}>
               <div style={{ marginBottom: 32 }}>
                 <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>Alım Gücü Erime Simülasyonu</h3>
                 <p style={{ fontSize: 13, color: P.text3, margin: 0 }}>Mevcut 100.000 ₺'nin bu senaryodaki 12 aylık reel değer kaybı.</p>
               </div>
               
               <div style={{ height: 350, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={activeScenario.color} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={activeScenario.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={P.border} vertical={false} />
                      <XAxis dataKey="month" stroke={P.text3} fontSize={11} axisLine={false} tickLine={false} />
                      <YAxis stroke={P.text3} fontSize={11} tickFormatter={(val) => `₺${(val/1000).toFixed(0)}k`} axisLine={false} tickLine={false} domain={['dataMin - 10000', 100000]} />
                      <Tooltip 
                        contentStyle={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12 }}
                        itemStyle={{ color: P.text1, fontWeight: 700 }}
                        formatter={(value) => [fmt(value), 'Reel Alım Gücü']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="power" 
                        stroke={activeScenario.color} 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#powerGrad)" 
                      />
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
