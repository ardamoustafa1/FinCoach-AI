import { useState, useEffect } from 'react';
import { Skull, FileWarning, Fingerprint, Database, Network, Clock, CheckCircle2, ChevronRight, Lock, Terminal } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const P = {
  purple: '#7C3AED', blue: '#3B82F6', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)'
};

const LOG_MESSAGES = [
  "[ORACLE] Pinging user activity logs... 180 days since last login.",
  "[ORACLE] Polling e-Devlet & National Health DB APIs...",
  "[ORACLE] WARNING: Critical status confirmed via Medical API.",
  "[SYS] Condition Met: 'No heartbeat / No login > 180 Days'",
  "[WEB3] Fetching encrypted Dead Man's Switch contract (0x7F9a...2B4)",
  "[WEB3] Verifying heir signature... (Address: 0x9B2c...1D4)",
  "[EVM] Unlocking 2.45 BTC and 14,500 USDC from cold storage...",
  "[EVM] Bypassing probate and legal friction... Executing transaction.",
  "[SYS] Asset transfer completed successfully on-chain."
];

export default function DeadMansSwitchPage() {
  const [step, setStep] = useState(0); 
  // 0: Monitoring, 1: Triggered/Alert, 2: Smart Contract Execution, 3: Completed
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 2000); // Trigger alert
      return () => clearTimeout(timer);
    }
    
    if (step === 2) {
      let currentLogIndex = 0;
      const interval = setInterval(() => {
        setLogs(prev => [...prev, LOG_MESSAGES[currentLogIndex]]);
        currentLogIndex++;
        if (currentLogIndex >= LOG_MESSAGES.length) {
          clearInterval(interval);
          setTimeout(() => setStep(3), 1500);
        }
      }, 700);
      return () => clearInterval(interval);
    }
  }, [step]);

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
          subtitle="Ölüm veya koma durumunda dijital varlıkları hukuki engele takılmadan saniyeler içinde yasal varise aktaran Akıllı Sözleşme."
          badge="DeFi & Oracles"
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
                  <p className="code-font" style={{ fontSize: 12, color: P.text3, margin: 0 }}>Network: Ethereum Mainnet</p>
                </div>
              </div>
              <div style={{ padding: '6px 12px', borderRadius: 99, background: step === 3 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${step === 3 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: step === 3 ? P.green : P.red, textTransform: 'uppercase' }}>
                  {step === 0 ? 'MONITORING' : step === 1 ? 'CRITICAL ALERT' : step === 2 ? 'EXECUTING' : 'COMPLETED'}
                </span>
              </div>
            </div>

            {/* Contract Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.05)`, padding: 16, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Database size={16} color={P.text3} /> <span style={{ fontSize: 13, color: P.text2 }}>Kilitli Varlık (TVL)</span></div>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>$235,400.00</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.05)`, padding: 16, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Network size={16} color={P.text3} /> <span style={{ fontSize: 13, color: P.text2 }}>Atanan Yasal Varis</span></div>
                <span className="code-font" style={{ fontSize: 13, color: P.purple }}>0x9B2c...1D4</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.05)`, padding: 16, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={16} color={P.text3} /> <span style={{ fontSize: 13, color: P.text2 }}>Tetikleyici Şart (Condition)</span></div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>180 Gün İnaktiflik / Vefat</span>
              </div>
            </div>

            {step === 1 && (
              <button 
                onClick={() => setStep(2)}
                style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'linear-gradient(135deg, #EF4444, #991B1B)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 30px rgba(239,68,68,0.4)' }}
              >
                <Fingerprint size={18} /> Otonom Transferi Onayla (Bypass Probate)
              </button>
            )}
            {step === 3 && (
              <div style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: P.green, fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Lock size={18} /> Varlıklar Başarıyla Varise Aktarıldı
              </div>
            )}
            {step === 0 && (
              <div style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.05)`, color: P.text3, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                Oracle Veri Akışı Bekleniyor...
              </div>
            )}
          </div>

          {/* RIGHT: EVM EXECUTION TERMINAL */}
          <div className="animate-enter" style={{ background: '#050714', border: `1px solid ${P.border}`, borderRadius: 24, padding: 24, position: 'relative', display: 'flex', flexDirection: 'column', animationDelay: '0.1s' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: P.text2, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: 16 }}>
              <Terminal size={16} /> EVM Execution Console
            </h3>

            <div className="code-font" style={{ flex: 1, fontSize: 13, lineHeight: 1.8, color: '#a1a1aa' }}>
              {step === 0 && <span style={{ opacity: 0.5 }}>Standby. Listening to Chainlink Oracles...</span>}
              {step === 1 && (
                <div style={{ color: P.red, fontWeight: 700, marginBottom: 16 }}>
                  [FATAL] Oracle triggered. User inactive &gt; 180 days.<br/>
                  [FATAL] Hospital API status code: 410 (Gone).<br/>
                  [REQ] Awaiting contract execution confirmation...
                </div>
              )}
              {step >= 2 && logs.map((log, i) => (
                <div key={i} style={{ 
                  color: log.includes('ERROR') || log.includes('WARNING') ? P.red : log.includes('success') ? P.green : '#a1a1aa',
                  marginBottom: 8,
                  display: 'flex', alignItems: 'flex-start', gap: 8
                }}>
                  <ChevronRight size={14} style={{ marginTop: 4, flexShrink: 0 }} />
                  <span>{log}</span>
                </div>
              ))}
              {step === 2 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: P.purple, marginTop: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: P.purple, animation: 'pulse 1s infinite' }} />
                  Processing on blockchain...
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
