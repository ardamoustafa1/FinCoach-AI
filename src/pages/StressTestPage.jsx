import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, ArrowRightLeft, Briefcase, Zap, Cpu, Activity, ShieldAlert, Skull } from 'lucide-react';
import useStore from '../store/useStore';
import { fmt } from '../utils/categories';
import PageHeader from '../components/PageHeader';

import { P } from '../styles/palette';
const SCENARIOS = [
  {
    id: 'base',
    name: 'Mevcut Durum (Baz Senaryo)',
    desc: 'Mevcut ekonomik koşulların aynı şekilde devam edeceği varsayımı.',
    inflation: 0.40, 
    incomeGrowth: 0.45,
    expenseMultiplier: 1.0,
    icon: Briefcase,
    color: P.blue
  },
  {
    id: 'doomsday',
    name: 'Kıyamet Senaryosu (Monte Carlo)',
    desc: 'Yapay zeka finansal verilerinizi 10.000 farklı kriz senaryosuyla simüle eder.',
    inflation: 0.85, 
    incomeGrowth: 0.0, 
    expenseMultiplier: 1.50,
    icon: Skull,
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
  
  // Monte Carlo Animation States
  const [isMonteCarloRunning, setIsMonteCarloRunning] = useState(false);
  const [mcIteration, setMcIteration] = useState(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const activeScenario = SCENARIOS.find(s => s.id === activeScenarioId) || SCENARIOS[0];

  useEffect(() => {
    if (activeScenarioId === 'doomsday') {
      setTimeout(() => {
        if (!isMountedRef.current) return;
        setIsMonteCarloRunning(true);
        setMetrics(null); // hide metrics while running
      }, 0);
      
      let count = 0;
      const interval = setInterval(() => {
        count += 333; // fast counter
        if (count >= 10000) {
          clearInterval(interval);
          if (isMountedRef.current) {
            setMcIteration(10000);
            setIsMonteCarloRunning(false);
            calculateMetrics();
          }
        } else {
          if (isMountedRef.current) setMcIteration(count);
        }
      }, 50);

      return () => { clearInterval(interval); };
    } else {
      setTimeout(() => {
        if (!isMountedRef.current) return;
        setIsMonteCarloRunning(false);
        setLoading(true);
      }, 0);
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          calculateMetrics();
          setLoading(false);
        }
      }, 600);
      return () => { clearTimeout(timer); };
    }

    function calculateMetrics() {
      const tx = useStore.getState().transactions || [];
      const txList = tx;
      const totalIncome = txList.filter(t => t && t.tur === 'gelir').reduce((a, b) => a + Number(b.tutar), 0) || 45000;
      const totalExpense = txList.filter(t => t && t.tur === 'gider').reduce((a, b) => a + Number(b.tutar), 0) || 28000;
      const currentSavingsRate = ((totalIncome - totalExpense) / (totalIncome || 1)) * 100;
      const emergencyFund = 85000; 
      
      const scenarioIncome = totalIncome * (1 + activeScenario.incomeGrowth);
      const scenarioExpense = totalExpense * activeScenario.expenseMultiplier;
      const scenarioSavingsRate = ((scenarioIncome - scenarioExpense) / (scenarioIncome || 1)) * 100;
      
      const purchasingPowerBase = 100000;
      let data = [];
      for(let month = 0; month <= 12; month++) {
        const monthlyInflation = Math.pow(1 + activeScenario.inflation, 1/12) - 1;
        const currentPower = purchasingPowerBase / Math.pow(1 + monthlyInflation, month);
        data.push({ month: month === 0 ? 'Bugün' : month + '. Ay', power: Math.round(currentPower), nominal: purchasingPowerBase });
      }

      const currentRunway = emergencyFund / (totalExpense || 1);
      // Doomsday means income drops to 0 basically, or just surviving on emergency fund + whatever small income
      const doomsdayRunwayDays = Math.round((emergencyFund / ((totalExpense || 1) * 1.5)) * 30);
      const scenarioRunway = emergencyFund / (scenarioExpense || 1);

      setMetrics({
        totalIncome, scenarioIncome,
        totalExpense, scenarioExpense,
        currentSavingsRate, scenarioSavingsRate,
        currentRunway, scenarioRunway,
        emergencyFund, doomsdayRunwayDays
      });
      setChartData(data);
    }
  }, [activeScenarioId, activeScenario]);

  return (
    <>
      <style>{`
        @keyframes pulseAlert { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        @keyframes scanline { 0% { top: -100%; } 100% { top: 100%; } }
        @keyframes shake { 0%, 100% {transform: translateX(0);} 10%, 30%, 50%, 70%, 90% {transform: translateX(-5px);} 20%, 40%, 60%, 80% {transform: translateX(5px);} }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40, animation: 'fadeSlideUp 0.5s ease', maxWidth: 1000, margin: '0 auto' }}>
        
        {/* HEADER */}
        <PageHeader
          icon={<Cpu size={24} />}
          color={activeScenario.color}
          title="Makroekonomik Stres Testi"
          subtitle="Monte Carlo algoritmasıyla farklı kriz senaryolarında hayatta kalma sürenizi hesaplayın."
          badge="Digital Twin"
        />

        {/* SCENARIO SELECTOR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {SCENARIOS.map(sc => (
            <button
              key={sc.id}
              onClick={() => setActiveScenarioId(sc.id)}
              style={{
                textAlign: 'left', padding: '20px', borderRadius: 20, cursor: 'pointer',
                background: activeScenarioId === sc.id ? `${sc.color}15` : P.bg2,
                border: `1px solid ${activeScenarioId === sc.id ? sc.color : P.border}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: activeScenarioId === sc.id ? `0 8px 32px ${sc.color}30` : 'none',
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

        {/* MONTE CARLO ANIMATION */}
        {isMonteCarloRunning && (
          <div style={{ height: 400, background: '#0a0a0f', borderRadius: 24, border: `1px solid ${P.red}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', animation: 'shake 0.5s infinite' }}>
             {/* Scanline Effect */}
             <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(239,68,68,0.1) 2px, rgba(239,68,68,0.1) 4px)' }} />
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to bottom, transparent, rgba(239,68,68,0.3))', animation: 'scanline 1s linear infinite' }} />
             
             <Activity size={64} color={P.red} style={{ marginBottom: 16, position: 'relative', zIndex: 1 }} />
             <h2 style={{ fontSize: 48, fontWeight: 900, color: P.red, margin: '0 0 8px', position: 'relative', zIndex: 1, fontFamily: 'monospace' }}>
               {mcIteration.toLocaleString('tr-TR')}
             </h2>
             <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.2em', position: 'relative', zIndex: 1 }}>Monte Carlo İterasyonu</p>
             <p style={{ fontSize: 12, color: P.text3, marginTop: 12, position: 'relative', zIndex: 1 }}>Risk Faktörleri Çarpıştırılıyor: İşsizlik, %80 Enflasyon, %50 Kira Artışı</p>
          </div>
        )}

        {/* RESULTS */}
        {!isMonteCarloRunning && loading ? (
          <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: P.bg2, borderRadius: 24, border: `1px solid ${P.border}` }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${activeScenario.color}30`, borderTopColor: activeScenario.color, animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: P.text2 }}>Senaryo hesaplanıyor...</p>
             </div>
          </div>
        ) : !isMonteCarloRunning && metrics && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeSlideUp 0.4s ease' }}>
            
            {activeScenarioId === 'doomsday' ? (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: `1px solid rgba(239,68,68,0.4)`, borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 16px 60px rgba(239,68,68,0.2)' }}>
                 <ShieldAlert size={48} color={P.red} style={{ marginBottom: 16, animation: 'pulseAlert 2s infinite', borderRadius: '50%' }} />
                 <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 16px' }}>Kıyamet Senaryosu Tamamlandı</h2>
                 <p style={{ fontSize: 18, color: '#e2e8f0', lineHeight: 1.6, maxWidth: 800, margin: '0 0 24px' }}>
                   "Şu an aniden işten çıkarılırsan, enflasyon %80'e çıkarsa ve ev sahibin kiranı %50 artırırsa, elindeki nakit ve yatırımlarla sıfır gelirle tam..."
                 </p>
                 <div style={{ background: '#0a0a0f', padding: '24px 48px', borderRadius: 24, border: `1px solid ${P.red}`, display: 'inline-block' }}>
                   <p style={{ fontSize: 13, fontWeight: 800, color: P.red, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>SURVIVAL RUNWAY (HAYATTA KALMA PİSTİ)</p>
                   <p style={{ fontSize: 56, fontWeight: 900, color: '#fff', margin: 0, fontFamily: 'monospace' }}>{metrics.doomsdayRunwayDays} GÜN</p>
                 </div>
              </div>
            ) : (
              <div style={{ background: activeScenarioId === 'base' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${activeScenarioId === 'base' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 16, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                 <div style={{ width: 48, height: 48, borderRadius: 16, background: activeScenarioId === 'base' ? '#10B981' : P.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                   <Zap size={24} color="#fff" />
                 </div>
                 <div>
                   <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: '0 0 8px' }}>Yapay Zeka Servet Yöneticisi Tavsiyesi</h3>
                   <p style={{ fontSize: 14, color: P.text2, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                     {activeScenarioId === 'base' ? "Mevcut finansal planınız sürdürülebilir. Acil durum fonunuz stabil." : "Dikkat: Gelir-gider dengeniz bu senaryoda bozuluyor. Likiditenizi koruyun."}
                   </p>
                 </div>
              </div>
            )}

            {/* METRICS COMPARISON (Show for all except doomsday to keep doomsday clean, or show for all) */}
            {activeScenarioId !== 'doomsday' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                 <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24 }}>
                   <p style={{ fontSize: 12, fontWeight: 800, color: P.text3, textTransform: 'uppercase', marginBottom: 16 }}>Aylık Tasarruf Oranı</p>
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

                 <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24 }}>
                   <p style={{ fontSize: 12, fontWeight: 800, color: P.text3, textTransform: 'uppercase', marginBottom: 16 }}>Acil Durum Fonu Yeterliliği</p>
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
            )}

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
