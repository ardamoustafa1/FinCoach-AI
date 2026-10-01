import { useEffect, useState } from 'react';
import { Bot, CheckCircle2, Loader2 } from 'lucide-react';

export default function AgentSimulation({ provider }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1500);
    const t2 = setTimeout(() => setStep(2), 3500);
    const t3 = setTimeout(() => setStep(3), 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{ marginTop: 12, background: '#101113', borderRadius: 16, border: '1px solid rgba(195,203,211,0.3)', padding: 16, overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Bot size={18} color="#E4E9ED" />
        <span style={{ fontSize: 13, fontWeight: 800, color: '#E4E9ED', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Ajan Akışı</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {step >= 1 ? <CheckCircle2 size={18} color="#34C08A" /> : <Loader2 size={18} color="#6B7075" style={{ animation: 'spin 1s linear infinite' }} />}
          <span style={{ fontSize: 13, color: step >= 1 ? '#F2F4F5' : '#6B7075', fontWeight: 600 }}>Headless tarayıcı adımı simüle edildi ({provider})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {step >= 2 ? <CheckCircle2 size={18} color="#34C08A" /> : step === 1 ? <Loader2 size={18} color="#6E93C4" style={{ animation: 'spin 1s linear infinite' }} /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />}
          <span style={{ fontSize: 13, color: step >= 2 ? '#F2F4F5' : step === 1 ? '#6E93C4' : '#6B7075', fontWeight: 600 }}>Abonelik iptal formu demo olarak dolduruluyor...</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {step >= 3 ? <CheckCircle2 size={18} color="#34C08A" /> : step === 2 ? <Loader2 size={18} color="#D2894F" style={{ animation: 'spin 1s linear infinite' }} /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />}
          <span style={{ fontSize: 13, color: step >= 3 ? '#34C08A' : step === 2 ? '#D2894F' : '#6B7075', fontWeight: step >= 3 ? 800 : 600 }}>{step >= 3 ? 'Demo iptal akışı tamamlandı.' : 'Onay bekleniyor...'}</span>
        </div>
      </div>
      {step >= 3 && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at center, rgba(52,192,138,0.15) 0%, transparent 70%)', animation: 'ping 1.5s ease-out' }} />}
    </div>
  );
}
