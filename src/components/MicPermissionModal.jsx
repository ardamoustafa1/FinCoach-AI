import { useEffect, useState } from 'react';
import { Mic, X, Shield, Zap, MessageSquare, CheckCircle } from 'lucide-react';
import { P } from '../styles/palette';

export default function MicPermissionModal({ onAllow, onDeny }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mount animasyonu
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const features = [
    { icon: Zap,            text: 'Sesli harcama ekle — saniyeler içinde' },
    { icon: MessageSquare,  text: 'Doğal dilde konuş, AI anlasın' },
    { icon: Shield,         text: 'Ses kaydedilmez, sadece metne çevrilir' },
    { icon: CheckCircle,    text: 'Dilediğinde izni geri alabilirsin' },
  ];

  return (
    <>
      <style>{`
        @keyframes mic-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes mic-modal-in {
          from { opacity: 0; transform: translate(-50%, -50%) translateY(32px) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%, -50%) translateY(0)    scale(1); }
        }
        @keyframes mic-ring {
          0%,100% { transform: scale(1);   opacity: 0.6; }
          50%      { transform: scale(1.5); opacity: 0;   }
        }
        @keyframes mic-glow-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(195,203,211,0.5), 0 24px 64px rgba(195,203,211,0.3); }
          50%      { box-shadow: 0 0 0 16px rgba(195,203,211,0), 0 24px 64px rgba(195,203,211,0.5); }
        }
        .mic-allow-btn:hover { opacity: 0.88 !important; transform: translateY(-2px) !important; }
        .mic-deny-btn:hover  { background: rgba(255,255,255,0.08) !important; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onDeny}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(12px)',
          animation: 'mic-backdrop-in 0.25s ease both',
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mic-modal-title"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10001,
          width: 'min(420px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          background: 'linear-gradient(160deg, #121417 0%, #101113 100%)',
          border: '1px solid rgba(195,203,211,0.3)',
          borderRadius: 28,
          padding: '40px 32px 32px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s',
          animation: 'mic-modal-in 0.35s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Close button */}
        <button
          onClick={onDeny}
          aria-label="Kapat"
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: P.text3, transition: 'all 0.2s',
          }}
        >
          <X size={16} />
        </button>

        {/* Animated mic icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ position: 'relative', width: 96, height: 96 }}>
            {/* Pulsing rings */}
            {[1, 2].map(i => (
              <div key={i} style={{
                position: 'absolute',
                inset: -i * 12,
                borderRadius: '50%',
                border: '2px solid rgba(195,203,211,0.3)',
                animation: `mic-ring ${1.4 + i * 0.4}s ease-out ${i * 0.3}s infinite`,
              }} />
            ))}
            {/* Core button */}
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: 'linear-gradient(135deg, #C3CBD3, #8B949D)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'mic-glow-pulse 2s ease-in-out infinite',
              position: 'relative', zIndex: 1,
            }}>
              <Mic size={40} color="#fff" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2
          id="mic-modal-title"
          style={{
            textAlign: 'center',
            fontSize: 22, fontWeight: 900,
            color: '#F2F4F5',
            marginBottom: 8, letterSpacing: '-0.02em',
          }}
        >
          Sesli Asistanı Etkinleştir
        </h2>

        <p style={{
          textAlign: 'center',
          fontSize: 14, color: P.text2,
          lineHeight: 1.7, marginBottom: 28,
        }}>
          Mikrofona izin vererek harcamalarını sesle ekleyebilir,<br />
          AI koçuna doğal dilde sorular sorabilirsin.
        </p>

        {/* Feature list */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: 12,
          marginBottom: 28,
        }}>
          {features.map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: 'rgba(195,203,211,0.15)',
                border: '1px solid rgba(195,203,211,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={15} color="#E4E9ED" />
              </div>
              <span style={{ fontSize: 13, color: P.text2, fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Privacy note */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(52,192,138,0.08)',
          border: '1px solid rgba(52,192,138,0.2)',
          borderRadius: 12, padding: '10px 14px',
          marginBottom: 24,
        }}>
          <Shield size={14} color="#34C08A" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#9BE0C2', fontWeight: 600 }}>
            Ses verilerin hiçbir zaman sunucuya kaydedilmez. Yalnızca metne dönüştürülür.
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="mic-allow-btn"
            onClick={onAllow}
            style={{
              width: '100%', padding: '16px',
              borderRadius: 16, border: 'none',
              background: 'linear-gradient(135deg, #C3CBD3, #8B949D)',
              color: '#fff', fontSize: 15, fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 12px 32px rgba(195,203,211,0.4)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Mic size={18} />
            Mikrofona İzin Ver
          </button>

          <button
            className="mic-deny-btn"
            onClick={onDeny}
            style={{
              width: '100%', padding: '13px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: P.text3, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            Şimdi Değil
          </button>
        </div>
      </div>
    </>
  );
}
