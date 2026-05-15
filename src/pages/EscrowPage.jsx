import { useState } from 'react';
import { Lock, ShieldCheck, Activity, ShieldAlert, Cpu, CheckCircle2, XCircle } from 'lucide-react';

const P = {
  purple: '#7C3AED', blue: '#3B82F6', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)'
};

export default function EscrowPage() {
  const [unlockStatus, setUnlockStatus] = useState('idle'); // idle, requesting, verifying, rejected, approved

  const handleUnlock = () => {
    setUnlockStatus('requesting');
    
    setTimeout(() => {
      setUnlockStatus('verifying');
      
      setTimeout(() => {
        setUnlockStatus('rejected');
      }, 4000);
    }, 2000);
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-enter { animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .matrix-bg {
          background-image: radial-gradient(rgba(124, 58, 237, 0.1) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .shake-animation { animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake { 0%, 100% {transform: translateX(0);} 10%, 30%, 50%, 70%, 90% {transform: translateX(-10px);} 20%, 40%, 60%, 80% {transform: translateX(10px);} }
      `}</style>

      <div className="pt-24 pb-32 px-6 max-w-4xl mx-auto matrix-bg" style={{ minHeight: '100vh' }}>
        
        {/* HEADER */}
        <div className="animate-enter" style={{
          background: `linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(59,130,246,0.05) 100%)`,
          border: `1px solid ${P.border}`, borderRadius: 24, padding: '32px', marginBottom: 40,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Lock size={20} color={P.amber} />
              <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.amber }}>Web3 Smart Contract Escrow</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              Kilitli Acil Durum Fonu
            </h1>
            <p style={{ fontSize: 14, color: P.text2, margin: 0, maxWidth: 650, lineHeight: 1.6 }}>
              Kendi birikiminize karşı en büyük tehdit yine sizsiniz. İradesizce para harcamayı önlemek için acil durum fonunuz bir <strong>Ethereum Akıllı Sözleşmesine (Smart Contract)</strong> kilitlenir. Bu para sadece API üzerinden hastane faturası veya kaza raporu doğrulanırsa çekilebilir.
            </p>
          </div>
        </div>

        {/* SMART CONTRACT INTERFACE */}
        <div className="animate-enter" style={{ background: P.bg0, border: `1px solid ${P.border}`, borderRadius: 32, overflow: 'hidden', animationDelay: '0.1s', opacity: 0, boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
          
          <div style={{ padding: '40px', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: 1, background: `linear-gradient(90deg, transparent, ${P.amber}, transparent)` }} />
            
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(245,158,11,0.1)', border: `2px solid rgba(245,158,11,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
               <Lock size={36} color={P.amber} />
            </div>

            <p style={{ fontSize: 13, color: P.text3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>KİLİTLİ BAKİYE</p>
            <h2 style={{ fontSize: 56, fontWeight: 900, color: P.text1, letterSpacing: '-0.03em', margin: '0 0 8px' }}>120.000 ₺</h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 8, border: `1px solid ${P.border}` }}>
              <span style={{ fontSize: 11, color: P.text3, fontFamily: 'monospace' }}>0x8aA9...3F9c</span>
              <ShieldCheck size={14} color={P.green} />
            </div>
          </div>

          {/* ACTION AREA */}
          <div style={{ background: P.bg2, padding: 40, borderTop: `1px solid ${P.border}` }}>
            {unlockStatus === 'idle' && (
               <div style={{ textAlign: 'center' }}>
                 <p style={{ fontSize: 14, color: P.text2, marginBottom: 24 }}>Bu fon sadece sağlık veya kaza gibi ekstrem acil durumlar için ayrılmıştır.</p>
                 <button onClick={handleUnlock} style={{ padding: '18px 40px', borderRadius: 16, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', fontSize: 16, fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(245,158,11,0.3)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                   Kilidi Aç ve Para Çek
                 </button>
               </div>
            )}

            {unlockStatus !== 'idle' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <div className="animate-enter" style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(59,130,246,0.1)', padding: 20, borderRadius: 16, border: `1px solid rgba(59,130,246,0.2)` }}>
                   <div style={{ width: 40, height: 40, borderRadius: '50%', background: P.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={20} color="#fff" /></div>
                   <div>
                     <p style={{ fontSize: 15, fontWeight: 800, color: P.text1, margin: 0 }}>Para Çekme Talebi Alındı</p>
                     <p style={{ fontSize: 13, color: P.text2, margin: '4px 0 0' }}>Akıllı Sözleşmeye (Smart Contract) talep iletildi.</p>
                   </div>
                   <CheckCircle2 size={24} color={P.blue} style={{ marginLeft: 'auto' }} />
                </div>

                {unlockStatus === 'verifying' || unlockStatus === 'rejected' ? (
                  <div className="animate-enter" style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(124,58,237,0.1)', padding: 20, borderRadius: 16, border: `1px solid rgba(124,58,237,0.2)` }}>
                     <div style={{ width: 40, height: 40, borderRadius: '50%', background: P.purple, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {unlockStatus === 'verifying' ? <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Cpu size={20} color="#fff" />}
                     </div>
                     <div>
                       <p style={{ fontSize: 15, fontWeight: 800, color: P.text1, margin: 0 }}>Oracle API Doğrulaması (E-Devlet & Hastane)</p>
                       <p style={{ fontSize: 13, color: P.text2, margin: '4px 0 0' }}>Sisteminizde kayıtlı acil bir fatura veya rapor aranıyor...</p>
                     </div>
                     {unlockStatus === 'rejected' && <CheckCircle2 size={24} color={P.purple} style={{ marginLeft: 'auto' }} />}
                  </div>
                ) : null}

                {unlockStatus === 'rejected' && (
                  <div className={`animate-enter shake-animation`} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, background: 'rgba(239,68,68,0.1)', padding: 24, borderRadius: 16, border: `1px solid rgba(239,68,68,0.4)` }}>
                     <div style={{ width: 40, height: 40, borderRadius: '50%', background: P.red, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ShieldAlert size={20} color="#fff" /></div>
                     <div>
                       <p style={{ fontSize: 16, fontWeight: 900, color: P.red, margin: '0 0 8px' }}>ERİŞİM REDDEDİLDİ (SMART CONTRACT BLOKESİ)</p>
                       <p style={{ fontSize: 14, color: P.text1, margin: 0, lineHeight: 1.6 }}>
                         Oracle ağları E-Devlet, SGK ve Hastane veri tabanlarında adınıza kayıtlı bir <strong>acil durum raporu veya faturası bulamadı.</strong> Bu paranın tatil veya dürtüsel alışveriş için çekilmek istendiği tespit edilmiştir. İradenizi korumak adına para sözleşmede kilitli kalacaktır.
                       </p>
                       <button onClick={() => setUnlockStatus('idle')} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 8, background: P.bg0, border: `1px solid ${P.border}`, color: P.text1, fontWeight: 700, cursor: 'pointer' }}>Geri Dön</button>
                     </div>
                     <XCircle size={24} color={P.red} style={{ flexShrink: 0 }} />
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
