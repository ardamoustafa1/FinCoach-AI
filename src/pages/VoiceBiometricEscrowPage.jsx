import { useState, useEffect, useRef } from 'react';
import { Mic, Fingerprint, Waves, ShieldCheck, Cpu, Code2, PlayCircle, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const P = {
  purple: '#7C3AED', blue: '#3B82F6', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)'
};

const PHASES = [
  "Awaiting voice input...",
  "Listening to user command...",
  "Processing Speech-to-Text via Whisper API...",
  "Analyzing NLP intent for Web3 execution...",
  "Voice Biometrics: Comparing frequency signatures...",
  "Deepfake Scan: Liveness verification complete.",
  "Biometric Match: 99.87% (Authorized: ARDA)",
  "Compiling Solidity Smart Contract dynamically...",
  "Deploying Time-Locked Escrow to Ethereum Mainnet...",
  "Transaction Confirmed."
];

export default function VoiceBiometricEscrowPage() {
  const [step, setStep] = useState(0); 
  // 0: Idle, 1: Listening, 2: Processing Text/NLP, 3: Biometrics, 4: Contract Gen, 5: Complete
  const [logs, setLogs] = useState([]);
  const [transcript, setTranscript] = useState("");
  
  const handleStartListening = () => {
    if (step !== 0) return;
    setStep(1);
    setLogs(["[SYS] Microphone activated. Listening..."]);
    
    // Simulate typing the transcript
    const fullText = "FinCoach, kardeşim Ali'ye 500 USDC gönder, ama parayı o üniversiteden mezun olana kadar akıllı sözleşmeye kilitle.";
    let i = 0;
    const typeInterval = setInterval(() => {
      setTranscript(fullText.substring(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(typeInterval);
        setTimeout(() => setStep(2), 500);
      }
    }, 40);
  };

  useEffect(() => {
    if (step === 2) {
      setLogs(prev => [...prev, "[NLP] Parsing intent: TRANSFER, AMOUNT: 500 USDC, TO: 'Ali', CONDITION: 'University Graduation'"]);
      setTimeout(() => setStep(3), 2000);
    }
    else if (step === 3) {
      let l = 4;
      const t = setInterval(() => {
        setLogs(prev => [...prev, PHASES[l]]);
        l++;
        if (l === 7) {
          clearInterval(t);
          setTimeout(() => setStep(4), 1500);
        }
      }, 800);
      return () => clearInterval(t);
    }
    else if (step === 4) {
      let l = 7;
      const t = setInterval(() => {
        setLogs(prev => [...prev, PHASES[l]]);
        l++;
        if (l === 10) {
          clearInterval(t);
          setTimeout(() => setStep(5), 1500);
        }
      }, 1000);
      return () => clearInterval(t);
    }
  }, [step]);

  return (
    <>
      <style>{`
        .voice-bg {
          background: radial-gradient(circle at center, rgba(124, 58, 237, 0.05) 0%, transparent 60%);
        }
        .mic-button {
          position: relative;
          transition: transform 0.2s;
        }
        .mic-button:hover { transform: scale(1.05); }
        .mic-pulse::before, .mic-pulse::after {
          content: ''; position: absolute; top: -10px; left: -10px; right: -10px; bottom: -10px;
          border-radius: 50%; border: 2px solid #7C3AED;
          animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        .mic-pulse::after { animation-delay: 1s; }
        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        
        .wave-container { display: flex; alignItems: center; gap: 4px; height: 40px; margin: 20px auto; justify-content: center; }
        .bar { width: 6px; background: #7C3AED; border-radius: 10px; animation: sound 0ms -800ms linear infinite alternate; }
        @keyframes sound { 0% { height: 4px; opacity: 0.5; } 100% { height: 40px; opacity: 1; } }
        
        .code-box { font-family: 'Fira Code', monospace; font-size: 13px; color: #10B981; }
      `}</style>

      <div className="voice-bg" style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40, minHeight: '100%' }}>
        <PageHeader
          icon={<Waves size={24} />}
          color="#7C3AED"
          title="Voice Biometric Smart Escrow"
          subtitle="Sadece sesinizi kullanarak bankacılık ve Web3 işlemlerini biyometrik olarak doğrulayın ve yürütün."
          badge="DeepTech & Web3"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flexWrap: 'wrap' }}>
          
          {/* LEFT: VOICE INTERFACE */}
          <div className="animate-enter" style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 450 }}>
            
            {/* Mic Button */}
            <button 
              onClick={handleStartListening}
              disabled={step !== 0}
              className={`mic-button ${step === 1 ? 'mic-pulse' : ''}`}
              style={{
                width: 100, height: 100, borderRadius: '50%', background: step === 0 ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.2)', border: `2px solid ${P.purple}`, color: P.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: step === 0 ? 'pointer' : 'default', marginBottom: 32, zIndex: 10, boxShadow: step === 0 ? '0 0 20px rgba(124,58,237,0.3)' : 'none'
              }}
            >
              {step === 5 ? <CheckCircle2 size={40} color={P.green} /> : <Mic size={40} />}
            </button>

            {/* Sound Waves */}
            {step === 1 && (
              <div className="wave-container">
                <div className="bar" style={{ animationDuration: '474ms' }}></div>
                <div className="bar" style={{ animationDuration: '433ms' }}></div>
                <div className="bar" style={{ animationDuration: '407ms' }}></div>
                <div className="bar" style={{ animationDuration: '458ms' }}></div>
                <div className="bar" style={{ animationDuration: '400ms' }}></div>
                <div className="bar" style={{ animationDuration: '427ms' }}></div>
                <div className="bar" style={{ animationDuration: '441ms' }}></div>
                <div className="bar" style={{ animationDuration: '419ms' }}></div>
                <div className="bar" style={{ animationDuration: '487ms' }}></div>
                <div className="bar" style={{ animationDuration: '442ms' }}></div>
              </div>
            )}

            {/* Transcript */}
            <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 400 }}>
              {step === 0 ? (
                <p style={{ color: P.text3, fontSize: 16, fontWeight: 600 }}>Tıklayın ve konuşmaya başlayın...</p>
              ) : (
                <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, lineHeight: 1.5 }}>
                  "{transcript}"
                  {step === 1 && <span style={{ opacity: 0.5, animation: 'pulse 1s infinite' }}>|</span>}
                </p>
              )}
            </div>

            {/* Status Indicators */}
            <div style={{ display: 'flex', gap: 16, marginTop: 'auto', opacity: step >= 2 ? 1 : 0, transition: 'opacity 0.5s', width: '100%' }}>
              <div style={{ flex: 1, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid ${step >= 3 ? P.green : P.border}` }}>
                <ShieldCheck size={20} color={step >= 3 ? P.green : P.text3} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 11, color: P.text2, fontWeight: 800 }}>LİVENESS KONTROLÜ</div>
                <div style={{ fontSize: 12, color: step >= 3 ? P.green : P.text3, fontWeight: 900 }}>{step >= 3 ? 'BAŞARILI' : 'BEKLENİYOR'}</div>
              </div>
              <div style={{ flex: 1, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid ${step >= 4 ? P.purple : P.border}` }}>
                <Fingerprint size={20} color={step >= 4 ? P.purple : P.text3} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 11, color: P.text2, fontWeight: 800 }}>SES BİYOMETRİSİ</div>
                <div style={{ fontSize: 12, color: step >= 4 ? P.purple : P.text3, fontWeight: 900 }}>{step >= 4 ? '%99.8 EŞLEŞTİ' : 'BEKLENİYOR'}</div>
              </div>
            </div>

          </div>

          {/* RIGHT: SMART CONTRACT GENERATION & LOGS */}
          <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24, animationDelay: '0.1s' }}>
            
            <div style={{ flex: 1, background: '#050714', border: `1px solid ${P.border}`, borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: 16 }}>
                <Cpu size={20} color={P.text2} />
                <h3 style={{ fontSize: 14, fontWeight: 800, color: P.text1, margin: 0 }}>System Logs & Web3 Engine</h3>
              </div>
              <div className="code-box" style={{ display: 'flex', flexDirection: 'column', gap: 8, height: 200, overflowY: 'auto' }}>
                {logs.map((log, index) => (
                  <div key={index} style={{ color: log.includes('Match') || log.includes('Confirmed') ? P.green : log.includes('Deploying') ? P.purple : '#a1a1aa' }}>
                    &gt; {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Smart Contract Code */}
            <div style={{ flex: 1, background: 'rgba(15,23,42,0.8)', border: `1px solid rgba(59,130,246,0.3)`, borderRadius: 24, padding: 24, opacity: step >= 4 ? 1 : 0, transform: step >= 4 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s' }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Code2 size={20} color={P.blue} />
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>Dynamic Escrow Contract</h3>
                </div>
                {step === 5 && <span style={{ fontSize: 11, background: 'rgba(16,185,129,0.2)', color: P.green, padding: '4px 8px', borderRadius: 4, fontWeight: 800 }}>DEPLOYED</span>}
              </div>
              <pre style={{ margin: 0, padding: 16, background: '#000', borderRadius: 12, fontSize: 11, color: '#e2e8f0', overflowX: 'auto', fontFamily: 'monospace' }}>
{`pragma solidity ^0.8.0;
contract DegreeEscrow {
    address public arbiter = 0xFinCoachOracle;
    address public beneficiary = 0xAliWallet;
    uint public amount = 500 * 10**6; // USDC
    
    function releaseFunds(bool graduated) public {
        require(msg.sender == arbiter, "Only Oracle");
        require(graduated == true, "Condition not met");
        IERC20(usdcToken).transfer(beneficiary, amount);
    }
}`}
              </pre>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
