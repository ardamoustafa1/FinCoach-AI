import { useState, useEffect } from 'react';
import { Cpu, Zap, ArrowRight, ShieldCheck, Activity, Terminal, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/PageHeader';

const P = {
  purple: '#7C3AED', blue: '#3B82F6', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)'
};

const LOG_MESSAGES = [
  "[SYS] Initializing Self-Driving Money Engine...",
  "[API] Fetching Open Banking Balances (Akbank, Garanti)...",
  "[SCAN] Analyzing Vadesiz (Idle) Accounts... 20,000 TL detected.",
  "[SCAN] Analyzing Credit Card Debt... 15,000 TL debt detected at %5.5 APR.",
  "[AI] Asymmetry detected: Negative spread of -%5.5. Capital destruction imminent.",
  "[PLAN] Withdrawing 15,000 TL from Vadesiz...",
  "[PLAN] Executing EFT to Credit Card 44** **** **** 1982...",
  "[PLAN] Routing remaining 5,000 TL to Overnight Repo Protocol (Yield: %3.1)...",
  "[EXEC] Waiting for user authorization or auto-approve flag..."
];

export default function AutonomousAgentPage() {
  const [step, setStep] = useState(0); 
  // 0: Scanning, 1: Asymmetry Found, 2: Executing, 3: Completed
  const [logs, setLogs] = useState([]);
  
  // Fake chart data to show the "Bleeding" vs "Optimized"
  const chartData = [
    { month: '1. Ay', bleeding: -825, optimized: 155 },
    { month: '2. Ay', bleeding: -1650, optimized: 310 },
    { month: '3. Ay', bleeding: -2475, optimized: 465 },
    { month: '4. Ay', bleeding: -3300, optimized: 620 },
  ];

  useEffect(() => {
    if (step === 0) {
      let currentLogIndex = 0;
      const interval = setInterval(() => {
        setLogs(prev => [...prev, LOG_MESSAGES[currentLogIndex]]);
        currentLogIndex++;
        if (currentLogIndex === 5) { // Pause at "Asymmetry detected"
          clearInterval(interval);
          setTimeout(() => setStep(1), 1000);
        }
      }, 800);
      return () => clearInterval(interval);
    }
    
    if (step === 2) {
      // Execute Arbitrage
      let currentLogIndex = 5;
      const interval = setInterval(() => {
        setLogs(prev => [...prev, LOG_MESSAGES[currentLogIndex]]);
        currentLogIndex++;
        if (currentLogIndex >= LOG_MESSAGES.length) {
          clearInterval(interval);
          setTimeout(() => setStep(3), 1500);
        }
      }, 600);
      return () => clearInterval(interval);
    }
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
          title="Self-Driving Money (Otonom Ajan)"
          subtitle="Paranızı kendi kendine yöneten yapay zeka. Enflasyon ve faiz asimetrilerini anında kapatır."
          badge="BETA - Kurumsal"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flexWrap: 'wrap' }}>
          
          {/* LEFT: TERMINAL & LOGS */}
          <div className="animate-enter" style={{ background: '#050714', border: `1px solid rgba(59,130,246,0.3)`, borderRadius: 24, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 400 }}>
            <div style={{ background: 'rgba(59,130,246,0.1)', padding: '12px 20px', borderBottom: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Terminal size={16} color={P.blue} />
              <span style={{ fontSize: 13, fontWeight: 700, color: P.blue, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Agentic Execution Log</span>
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

          {/* RIGHT: ACTION CARDS */}
          <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24, animationDelay: '0.1s' }}>
            
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
                      Vadesiz hesabınızda boşta bekleyen <strong style={{ color: '#fff' }}>20.000 TL</strong> nakit bulunurken, kredi kartınızda aylık <strong style={{ color: P.red }}>%5.5 faiz</strong> işleyen <strong style={{ color: '#fff' }}>15.000 TL</strong> borcunuz tespit edildi. Bu durum her ay 825 TL zarara yol açıyor.
                    </p>
                    <button 
                      onClick={() => setStep(2)}
                      disabled={step === 2}
                      style={{ width: '100%', padding: 16, borderRadius: 16, background: 'linear-gradient(135deg, #3B82F6, #7C3AED)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 800, cursor: step === 2 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}
                    >
                      {step === 2 ? <><RefreshCw size={18} className="spin" /> Otonom Arbitraj Başlatıldı</> : <><Zap size={18} /> Otonom Arbitrajı Başlat (Borcu Kapat)</>}
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 14, color: P.green, lineHeight: 1.6, marginBottom: 24, fontWeight: 600 }}>
                      ✅ Otonom ajan boşta duran paranızı kullanarak kredi kartı borcunuzu saniyeler içinde kapattı. Kalan 5.000 TL, gecelik repoya aktarıldı.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.1)`, padding: 16, borderRadius: 16 }}>
                        <p style={{ fontSize: 11, color: P.text3, textTransform: 'uppercase', fontWeight: 800, margin: '0 0 4px' }}>Aylık Engellenen Zarar</p>
                        <p style={{ fontSize: 24, color: '#fff', fontWeight: 900, margin: 0 }}>₺825,00</p>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.1)`, padding: 16, borderRadius: 16 }}>
                        <p style={{ fontSize: 11, color: P.text3, textTransform: 'uppercase', fontWeight: 800, margin: '0 0 4px' }}>Yeni DeFi Getirisi</p>
                        <p style={{ fontSize: 24, color: P.green, fontWeight: 900, margin: 0 }}>₺155,00 / ay</p>
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
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
