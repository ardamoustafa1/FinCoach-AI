import { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, Terminal, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/PageHeader';

import { P } from '../styles/palette';
export default function AutonomousAgentPage() {
  const [step, setStep] = useState(0); 
  const [logs, setLogs] = useState([]);
  
  // Dynamic User Inputs
  const [idleCash, setIdleCash] = useState(20000);
  const [debtAmount, setDebtAmount] = useState(15000);
  const [debtRate, setDebtRate] = useState(5.5); // Monthly %
  const [depositRate, setDepositRate] = useState(3.5); // Monthly %

  const generateLogsAndChart = () => {
    const monthlyBleed = Math.round(debtAmount * (debtRate / 100));
    const optimizedCash = idleCash - debtAmount;
    const monthlyGain = optimizedCash > 0 ? Math.round(optimizedCash * (depositRate / 100)) : 0;
    const netDifference = monthlyBleed + monthlyGain;

    const dynamicLogs = [
      "[SYS] Initializing Self-Driving Money Sandbox Engine...",
      "[SANDBOX_API] Open Banking sandbox balances loaded...",
      `[SCAN] Analyzing Vadesiz (Idle) Accounts... ${fmt(idleCash)} detected.`,
      `[SCAN] Analyzing Credit Card Debt... ${fmt(debtAmount)} debt detected at %${debtRate} APR.`,
      `[AI] Asymmetry detected: Negative spread of -%${(debtRate - depositRate).toFixed(1)}. Capital destruction imminent.`,
      `[PLAN] ${fmt(Math.min(idleCash, debtAmount))} vadesiz bakiyeden kredi kartı borcuna ayrıldı.`,
      `[LEDGER] Sandbox EFT: Credit Card 44** **** **** 1982 kaydı oluşturuldu.`,
      optimizedCash > 0 ? `[LEDGER] Kalan ${fmt(optimizedCash)} gecelik repo sandbox havuzuna yönlendirildi.` : `[LEDGER] Kalan borç yapılandırıldı.`,
      "[EXEC] Kullanıcı onayıyla sandbox ledger güncellendi."
    ];

    const dynamicChart = [
      { month: '1. Ay', bleeding: -monthlyBleed, optimized: monthlyGain },
      { month: '2. Ay', bleeding: -(monthlyBleed * 2), optimized: monthlyGain * 2 },
      { month: '3. Ay', bleeding: -(monthlyBleed * 3), optimized: monthlyGain * 3 },
      { month: '4. Ay', bleeding: -(monthlyBleed * 4), optimized: monthlyGain * 4 },
    ];

    return { dynamicLogs, dynamicChart, monthlyBleed, monthlyGain, netDifference };
  };

  const [simulationData, setSimulationData] = useState({ logs: [], chart: [], bleed: 0, gain: 0, net: 0 });

  const startSimulation = () => {
    setStep(0);
    setLogs([]);
    const data = generateLogsAndChart();
    setSimulationData(data);

    let t1;
    let currentLogIndex = 0;
    const interval = setInterval(() => {
      setLogs(prev => [...prev, data.dynamicLogs[currentLogIndex]].filter(Boolean));
      currentLogIndex++;
      if (currentLogIndex === 5) {
        clearInterval(interval);
        t1 = setTimeout(() => setStep(1), 1000);
      }
    }, 800);
  };

  useEffect(() => {
    startSimulation();
  }, []);

  useEffect(() => {
    let t2, interval;
    if (step === 2) {
      let currentLogIndex = 5;
      interval = setInterval(() => {
        setLogs(prev => [...prev, (simulationData.dynamicLogs || [])[currentLogIndex] || generateLogsAndChart().dynamicLogs[currentLogIndex]].filter(Boolean));
        currentLogIndex++;
        if (currentLogIndex >= 9) {
          clearInterval(interval);
          t2 = setTimeout(() => setStep(3), 1500);
        }
      }, 600);
    }
    return () => {
      clearInterval(interval);
      clearTimeout(t2);
    };
  }, [step]);

  return (
    <>
      <style>{`
        .matrix-bg {
          background-image: linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .log-text { font-family: 'Fira Code', monospace; font-size: 13px; color: #10B981; margin: 4px 0; }
        .radar-scan {
          position: absolute; top: 0; left: 0; right: 0; height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(59,130,246,0.1) 50%, transparent);
          animation: scan 3s linear infinite;
        }
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        <PageHeader
          icon={<Cpu size={24} />}
          color="#3B82F6"
          title="Self-Driving Money"
          subtitle="Boşta nakit ve pahalı borç asimetrisini sandbox ledger üzerinde optimize eden onaylı ajan."
          badge="Sandbox Ajan"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flexWrap: 'wrap' }}>
          
          {/* LEFT: TERMINAL & LOGS */}
          <div className="animate-enter" style={{ background: '#050714', border: `1px solid rgba(59,130,246,0.3)`, borderRadius: 24, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 400 }}>
            <div style={{ background: 'rgba(59,130,246,0.1)', padding: '12px 20px', borderBottom: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Terminal size={16} color={P.blue} />
              <span style={{ fontSize: 13, fontWeight: 700, color: P.blue, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sandbox Execution Log</span>
            </div>
            
            <div className="matrix-bg" style={{ flex: 1, padding: 24, position: 'relative', overflowY: 'auto' }}>
              {step === 0 && <div className="radar-scan" />}
              {logs.map((log, i) => (
                <div key={i} className="log-text animate-enter" style={{ opacity: i === logs.length - 1 ? 1 : 0.6, animationDelay: '0s' }}>
                  {log}
                </div>
              ))}
              {(step === 0 || step === 2) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <RefreshCw size={14} color="#10B981" className="spin" />
                  <span className="log-text">İşleniyor...</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: ACTION CARDS & SETTINGS */}
          <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24, animationDelay: '0.1s' }}>
            
            {/* INPUTS */}
            <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: P.text1, margin: '0 0 16px' }}>Otonom Ajan Parametreleri</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: P.text2, fontWeight: 700, display: 'block', marginBottom: 4 }}>Boşta Nakit (TL)</label>
                  <input type="number" value={idleCash} onChange={e => setIdleCash(Number(e.target.value))} style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: `1px solid ${P.border}`, background: P.bg0, color: P.text1, fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: P.text2, fontWeight: 700, display: 'block', marginBottom: 4 }}>Gecelik Faiz (%)</label>
                  <input type="number" step="0.1" value={depositRate} onChange={e => setDepositRate(Number(e.target.value))} style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: `1px solid ${P.border}`, background: P.bg0, color: P.text1, fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: P.text2, fontWeight: 700, display: 'block', marginBottom: 4 }}>KK Borcu (TL)</label>
                  <input type="number" value={debtAmount} onChange={e => setDebtAmount(Number(e.target.value))} style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: `1px solid ${P.border}`, background: P.bg0, color: P.text1, fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: P.text2, fontWeight: 700, display: 'block', marginBottom: 4 }}>KK Faizi (%)</label>
                  <input type="number" step="0.1" value={debtRate} onChange={e => setDebtRate(Number(e.target.value))} style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: `1px solid ${P.border}`, background: P.bg0, color: P.text1, fontSize: 14 }} />
                </div>
              </div>
              <button onClick={startSimulation} disabled={step === 0 || step === 2} style={{ width: '100%', marginTop: 16, padding: 12, borderRadius: 12, background: P.bg3, border: `1px solid ${P.border}`, color: P.text1, fontSize: 14, fontWeight: 800, cursor: (step === 0 || step === 2) ? 'not-allowed' : 'pointer' }}>
                Parametreleri Yeniden Tara
              </button>
            </div>

            {/* STATE 1: ASYMMETRY FOUND */}
            {step >= 1 && (
              <div style={{ background: step === 3 ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${step === 3 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 24, padding: 32, transition: 'all 0.5s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  {step === 3 ? <CheckCircle2 size={28} color={P.green} /> : <AlertTriangle size={28} color={P.red} />}
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>
                    {step === 3 ? 'Asimetri Çözüldü' : 'Kritik Asimetri Tespit Edildi'}
                  </h2>
                </div>

                {step !== 3 ? (
                  <>
                    <p style={{ fontSize: 14, color: P.text2, lineHeight: 1.6, marginBottom: 24 }}>
                      Vadesiz hesabınızda boşta bekleyen <strong style={{ color: '#fff' }}>{fmt(idleCash)}</strong> nakit bulunurken, kredi kartınızda aylık <strong style={{ color: P.red }}>%{debtRate} faiz</strong> işleyen <strong style={{ color: '#fff' }}>{fmt(debtAmount)}</strong> borcunuz tespit edildi. Bu durum her ay {fmt(simulationData.bleed)} zarara yol açıyor.
                    </p>
                    <button 
                      onClick={() => setStep(2)}
                      disabled={step === 2}
                      style={{ width: '100%', padding: 16, borderRadius: 16, background: 'linear-gradient(135deg, #3B82F6, #7C3AED)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 800, cursor: step === 2 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}
                    >
                      {step === 2 ? <><RefreshCw size={18} className="spin" /> Sandbox Arbitraj Başlatıldı</> : <><Zap size={18} /> Sandbox Arbitrajı Başlat</>}
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 14, color: P.green, lineHeight: 1.6, marginBottom: 24, fontWeight: 600 }}>
                      Sandbox ajan boşta duran nakdi kredi kartı borcuna yönlendirerek aylık zarar senaryosunu ledger üzerinde kapattı.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.1)`, padding: 16, borderRadius: 16 }}>
                        <p style={{ fontSize: 11, color: P.text3, textTransform: 'uppercase', fontWeight: 800, margin: '0 0 4px' }}>Aylık Engellenen Zarar</p>
                        <p style={{ fontSize: 24, color: '#fff', fontWeight: 900, margin: 0 }}>{fmt(simulationData.bleed)}</p>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.1)`, padding: 16, borderRadius: 16 }}>
                        <p style={{ fontSize: 11, color: P.text3, textTransform: 'uppercase', fontWeight: 800, margin: '0 0 4px' }}>Yeni DeFi Getirisi</p>
                        <p style={{ fontSize: 24, color: P.green, fontWeight: 900, margin: 0 }}>{fmt(simulationData.gain)} / ay</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* CHART */}
            {step >= 1 && (
              <div className="animate-enter" style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 24, animationDelay: '0.2s', flex: 1 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: P.text2, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={16} color={P.text3} /> 4 Aylık Projeksiyon
                </h3>
                <div style={{ height: 180, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simulationData.chart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBleed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={P.red} stopOpacity={0.5}/>
                          <stop offset="95%" stopColor={P.red} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={P.green} stopOpacity={0.5}/>
                          <stop offset="95%" stopColor={P.green} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke={P.text3} fontSize={11} axisLine={false} tickLine={false} />
                      <YAxis stroke={P.text3} fontSize={11} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12 }} />
                      <Area type="monotone" dataKey="bleeding" stroke={P.red} fillOpacity={1} fill="url(#colorBleed)" name="Aptal Para (Zarar)" />
                      {step === 3 && (
                        <Area type="monotone" dataKey="optimized" stroke={P.green} fillOpacity={1} fill="url(#colorOpt)" name="Akıllı Para (Kâr)" />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
