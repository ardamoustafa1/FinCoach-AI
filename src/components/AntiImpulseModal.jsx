import { useState, useEffect } from 'react';
import { Camera, Lock, ShieldAlert, BrainCircuit, Activity, Eye, ShieldCheck, HeartPulse, Clock } from 'lucide-react';

export default function AntiImpulseModal({ tx = {}, onCancel, onConfirm, onCoolOff }) {
  const [step, setStep] = useState(0); 
  // 0: Intercepted Warning, 1: Camera Access & Scanning, 2: Analysis Results (Blocked)

  useEffect(() => {
    if (step === 1) {
      // Simulate scanning
      const t = setTimeout(() => {
        setStep(2);
      }, 4500);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(5, 7, 20, 0.95)', backdropFilter: 'blur(24px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'fadeIn 0.3s ease'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes scanline { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
        @keyframes pulseAlert { 0%, 100% { box-shadow: 0 0 0 0 rgba(219,92,78, 0.4); } 50% { box-shadow: 0 0 0 20px rgba(219,92,78, 0); } }
      `}</style>
      
      <div style={{
        width: '100%', maxWidth: 480, background: '#0A0B0C',
        border: step === 2 ? '1px solid #DB5C4E' : '1px solid rgba(195,203,211,0.3)',
        borderRadius: 24, overflow: 'hidden', position: 'relative',
        boxShadow: step === 2 ? '0 0 60px rgba(219,92,78,0.2)' : '0 0 60px rgba(195,203,211,0.2)',
        animation: 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Step 0: Intercept Warning */}
        {step === 0 && (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(219,92,78,0.1)', border: '1px solid rgba(219,92,78,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'pulseAlert 2s infinite' }}>
              <ShieldAlert size={32} color="#DB5C4E" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 12 }}>Dürtüsel Harcama Koruması</h2>
            <p style={{ fontSize: 15, color: '#9BA1A6', lineHeight: 1.6, marginBottom: 24 }}>
              Gece saatlerinde <strong>{tx?.magaza || 'bu mağazadan'}</strong> tek seferde <strong>₺{Number(tx?.tutar || 0).toLocaleString('tr-TR')}</strong> değerinde bir işlem deniyorsun. Bu bir "Dürtüsel Alışveriş (Dopamine-hunting)" olabilir.
            </p>
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(195,203,211,0.1)', border: '1px solid rgba(195,203,211,0.2)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
               <BrainCircuit size={24} color="#E4E9ED" style={{ flexShrink: 0 }} />
               <p style={{ fontSize: 13, color: '#DFE3E7', margin: 0 }}>İşleme onay vermeden önce FinCoach AI'ın biyometrik duygu analizi yapmasına izin ver.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => setStep(1)} style={{ padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg, #C3CBD3, #C0705C)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(195,203,211,0.4)' }}>
                Biyometrik Analizi Başlat
              </button>
              <button onClick={onCancel} style={{ padding: '14px', borderRadius: 14, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9BA1A6', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                İşlemi İptal Et
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Scanning */}
        {step === 1 && (
          <div style={{ padding: 40, textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 24px', borderRadius: '50%', overflow: 'hidden', border: '4px solid rgba(195,203,211,0.3)', background: '#1e1b4b' }}>
               <Camera size={48} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
               {/* Facial Mesh Mock */}
               <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(195,203,211,0.4) 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.5 }} />
               {/* Scan Line */}
               <div style={{ position: 'absolute', left: 0, right: 0, height: 4, background: '#34C08A', boxShadow: '0 0 20px #34C08A', animation: 'scanline 2s ease-in-out infinite' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Biyometrik Tarama</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#34C08A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={14} /> Kalp atış hızı analiz ediliyor...</span>
              <span style={{ fontSize: 13, color: '#6E93C4', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Eye size={14} /> Gözbebeği büyümesi ölçülüyor...</span>
              <span style={{ fontSize: 13, color: '#E4E9ED', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><HeartPulse size={14} /> Mikro mimikler taranıyor...</span>
            </div>
          </div>
        )}

        {/* Step 2: Blocked / Cool-off */}
        {step === 2 && (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: 'rgba(219,92,78,0.15)', border: '1px solid rgba(219,92,78,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Lock size={32} color="#DB5C4E" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#DB5C4E', letterSpacing: '-0.02em', marginBottom: 12 }}>Stres Faktörü Tespit Edildi!</h2>
            <p style={{ fontSize: 15, color: '#DFE3E7', lineHeight: 1.6, marginBottom: 24 }}>
              Şu an yüz mimiklerinden ve kalp atış hızından stresli ve <strong>"Dopamine-hunting"</strong> (duygusal alışveriş) modunda olduğunu tespit ettik.
            </p>
            <div style={{ background: '#171717', borderRadius: 16, padding: 20, marginBottom: 28, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <p style={{ fontSize: 13, color: '#9BA1A6', margin: '0 0 12px' }}>Sana özel bir koruma kalkanı devrede:</p>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li style={{ fontSize: 14, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={16} color="#34C08A" /> Harcama işlemi durduruldu.</li>
                <li style={{ fontSize: 14, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={16} color="#E4E9ED" /> Paranız 24 saatliğine Soğuma (Cool-off) kasasına alındı.</li>
                <li style={{ fontSize: 14, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}><BrainCircuit size={16} color="#6E93C4" /> Psikolojik zaafların engellendi.</li>
              </ul>
            </div>
            <button onClick={onCoolOff} style={{ width: '100%', padding: '16px', borderRadius: 16, background: '#DB5C4E', border: 'none', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(219,92,78,0.3)' }}>
              Anladım, Harcamayı Ertele
            </button>
            <button onClick={onConfirm} style={{ marginTop: 16, background: 'none', border: 'none', color: '#6B7075', fontSize: 13, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
              (Acil durum, işlemi zorla onayla)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
