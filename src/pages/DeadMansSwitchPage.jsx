import { useState, useEffect } from 'react';
import { Skull, FileWarning, Fingerprint, Database, Network, Clock, CheckCircle2, ChevronRight, Lock, Terminal, RefreshCw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import useStore from '../store/useStore';
import { fmt } from '../utils/categories';

import { P } from '../styles/palette';

export default function DeadMansSwitchPage() {
  const [step, setStep] = useState(0); 
  const [logs, setLogs] = useState([]);
  
  const [tvl, setTvl] = useState(235400);
  const [inactivityDays, setInactivityDays] = useState(180);
  const [heirAddress, setHeirAddress] = useState('0x9B2c...1D4');

  useEffect(() => {
    const goals = useStore.getState().goals || [];
    const totalAssets = goals.reduce((acc, g) => acc + (Number(g.currentAmount) || 0), 0);
    if (totalAssets > 0) {
      setTvl(totalAssets);
    }
  }, []);

  const getDynamicLogs = () => [
    `[ORACLE] Pinging user activity logs... ${inactivityDays} days since last login.`,
    "[ORACLE] Polling e-Devlet & National Health DB APIs...",
    "[ORACLE] WARNING: Critical status confirmed via Medical API.",
    `[SYS] Condition Met: 'No heartbeat / No login > ${inactivityDays} Days'`,
    "[SANDBOX] Fetching encrypted Dead Man's Switch contract (0x7F9a...2B4)",
    `[SANDBOX] Verifying heir signature... (Address: ${heirAddress})`,
    `[LEDGER] Unlocking ${fmt(tvl)} sandbox custody record...`,
    "[LEDGER] Probate checklist attached; transfer package executed in sandbox.",
    "[SYS] Asset transfer package completed successfully."
  ];

  const startSimulation = () => {
    setStep(0);
    setLogs([]);
  };

  useEffect(() => {
    let timer;
    if (step === 0) {
      timer = setTimeout(() => setStep(1), 2000); // Trigger alert
    }
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    let currentLogIndex = 0;
    let timer, interval;
    if (step === 2) {
      const dynamicLogs = getDynamicLogs();
      interval = setInterval(() => {
        const nextMsg = dynamicLogs[currentLogIndex];
        if (nextMsg) {
          setLogs(prev => [...prev, nextMsg]);
        }
        currentLogIndex++;
        if (currentLogIndex >= dynamicLogs.length) {
          clearInterval(interval);
          timer = setTimeout(() => setStep(3), 1500);
        }
      }, 700);
    }
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [step, inactivityDays, heirAddress, tvl]);

  return (
    <>
      <style>{`
        .web3-bg {
          background-image: 
            radial-gradient(circle at 100% 0%, rgba(124, 58, 237, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 0% 100%, rgba(239, 68, 68, 0.05) 0%, transparent 50%);
        }
        .code-font { font-family: 'Fira Code', monospace; }
        .glitch { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; }
        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
        .pulse-border {
          animation: pulse-border 2s infinite;
        }
        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

      <div className="web3-bg" style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40, minHeight: '100%' }}>
        <PageHeader
          icon={<Skull size={24} />}
          color="#EF4444"
          title="Dead Man's Switch (Web3 Vasiyet)"
          subtitle="İnaktiflik ve oracle sinyallerine göre dijital varlık devir paketini sandbox custody ledger üzerinde çalıştırır."
          badge="Custody Sandbox"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          
          {/* CONTRACT STATUS CARD */}
          <div className="animate-enter" style={{ background: P.bg2, border: `1px solid ${step === 1 ? P.red : step === 3 ? P.green : P.border}`, borderRadius: 24, padding: 32, transition: 'all 0.5s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className={step === 1 ? 'pulse-border' : ''} style={{ width: 48, height: 48, borderRadius: 12, background: step === 3 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {step === 3 ? <CheckCircle2 size={24} color={P.green} /> : <FileWarning size={24} color={P.red} />}
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Smart Contract 0x7F9a...2B4</h2>
                  <p className="code-font" style={{ fontSize: 12, color: P.text3, margin: 0 }}>Network: FinCoach Sandbox Ledger</p>
                </div>
              </div>
              <div style={{ padding: '6px 12px', borderRadius: 99, background: step === 3 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${step === 3 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: step === 3 ? P.green : P.red, textTransform: 'uppercase' }}>
                  {step === 0 ? 'MONITORING' : step === 1 ? 'CRITICAL ALERT' : step === 2 ? 'EXECUTING' : 'COMPLETED'}
                </span>
              </div>
            </div>

            {/* Config Inputs (Dynamic Setup) */}
            {step === 0 && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16, marginBottom: 24, border: `1px dashed ${P.border}` }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 13, color: P.text2 }}>Kontrat Parametreleri (Test)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: P.text3, marginBottom: 4, display: 'block' }}>Kilitli Varlık (TVL - ₺)</label>
                    <input type="number" value={tvl} onChange={e => setTvl(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: 8, background: P.bg0, border: `1px solid ${P.border}`, color: '#fff', fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: P.text3, marginBottom: 4, display: 'block' }}>İnaktiflik Süresi (Gün)</label>
                    <input type="number" value={inactivityDays} onChange={e => setInactivityDays(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: 8, background: P.bg0, border: `1px solid ${P.border}`, color: '#fff', fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: P.text3, marginBottom: 4, display: 'block' }}>Varis Adresi (ETH)</label>
                    <input type="text" value={heirAddress} onChange={e => setHeirAddress(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 8, background: P.bg0, border: `1px solid ${P.border}`, color: '#fff', fontSize: 14 }} />
                  </div>
                </div>
              </div>
            )}

            {/* Contract Details */}
            {step > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.05)`, padding: 16, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Database size={16} color={P.text3} /> <span style={{ fontSize: 13, color: P.text2 }}>Kilitli Varlık (TVL)</span></div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{fmt(tvl)}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.05)`, padding: 16, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Network size={16} color={P.text3} /> <span style={{ fontSize: 13, color: P.text2 }}>Atanan Yasal Varis</span></div>
                  <span className="code-font" style={{ fontSize: 13, color: P.purple }}>{heirAddress}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.05)`, padding: 16, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={16} color={P.text3} /> <span style={{ fontSize: 13, color: P.text2 }}>Tetikleyici Şart (Condition)</span></div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{inactivityDays} Gün İnaktiflik</span>
                </div>
              </div>
            )}

            {step === 1 && (
              <button 
                onClick={() => setStep(2)}
                style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'linear-gradient(135deg, #EF4444, #991B1B)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 30px rgba(239,68,68,0.4)' }}
              >
                <Fingerprint size={18} /> Otonom Transfer Paketini Onayla
              </button>
            )}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: P.green, fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Lock size={18} /> Varlık Devir Paketi Tamamlandı
                </div>
                <button onClick={startSimulation} style={{ padding: '12px', borderRadius: 12, background: P.bg3, border: `1px solid ${P.border}`, color: P.text1, fontWeight: 700, cursor: 'pointer' }}>Testi Sıfırla</button>
              </div>
            )}
            {step === 0 && (
              <div style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.05)`, color: P.text3, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <RefreshCw size={14} className="spin" /> Oracle Veri Akışı Bekleniyor... (Simülasyon Aktif)
              </div>
            )}
          </div>

          {/* RIGHT: EVM EXECUTION TERMINAL */}
          <div className="animate-enter" style={{ background: '#050714', border: `1px solid ${P.border}`, borderRadius: 24, padding: 24, position: 'relative', display: 'flex', flexDirection: 'column', animationDelay: '0.1s' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: P.text2, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: 16 }}>
              <Terminal size={16} /> Sandbox Execution Console
            </h3>

            <div className="code-font" style={{ flex: 1, fontSize: 13, lineHeight: 1.8, color: '#a1a1aa' }}>
              {step === 0 && <span style={{ opacity: 0.5 }}>Standby. Listening to sandbox oracle checks...</span>}
              {step === 1 && (
                <div style={{ color: P.red, fontWeight: 700, marginBottom: 16 }}>
                  [FATAL] Oracle triggered. User inactive &gt; {inactivityDays} days.<br/>
                  [FATAL] Hospital API status code: 410 (Gone).<br/>
                  [REQ] Awaiting contract execution confirmation...
                </div>
              )}
              {step >= 2 && logs.map((log, i) => (
                <div key={i} style={{ 
                  color: (log && (log.includes('ERROR') || log.includes('WARNING'))) ? P.red : (log && log.includes('success')) ? P.green : '#a1a1aa',
                  marginBottom: 8,
                  display: 'flex', alignItems: 'flex-start', gap: 8
                }}>
                  <ChevronRight size={14} style={{ marginTop: 4, flexShrink: 0 }} />
                  <span>{log || ''}</span>
                </div>
              ))}
              {step === 2 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: P.purple, marginTop: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: P.purple, animation: 'pulse 1s infinite' }} />
                  Processing sandbox ledger package...
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
