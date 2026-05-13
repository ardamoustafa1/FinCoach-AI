import { QRCodeSVG } from 'qrcode.react';
import { X, ExternalLink } from 'lucide-react';

export default function DemoQRCodeModal({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 150,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(20px)',
        animation: 'fadeSlideUp 0.3s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: 'linear-gradient(160deg, #1a1030 0%, #0e0c1a 100%)',
          border: '1px solid rgba(124,58,237,0.35)',
          borderRadius: 28, padding: '40px 36px',
          boxShadow: '0 40px 120px rgba(0,0,0,0.8)',
          textAlign: 'center', position: 'relative',
        }}
      >
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94A3B8', transition: 'background 0.15s',
        }}>
          <X size={16} />
        </button>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 99, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', fontSize: 11, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'ping 1.5s ease-out infinite' }} />
          Canlı Demo
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.02em', marginBottom: 8 }}>Uygulamayı Deneyin</h2>
        <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 28, lineHeight: 1.6 }}>
          Kameranızla tarayarak uygulamayı<br />kendi telefonunuzda keşfedin.
        </p>

        {/* QR */}
        <div style={{ display: 'inline-block', padding: 20, background: '#fff', borderRadius: 20, boxShadow: '0 8px 40px rgba(124,58,237,0.3)' }}>
          <QRCodeSVG value="https://fincoach.vercel.app" size={240} level="H" />
        </div>

        {/* URL */}
        <a
          href="https://fincoach.vercel.app"
          target="_blank" rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 24, fontSize: 13, fontWeight: 700, color: '#A78BFA', textDecoration: 'none' }}
        >
          fincoach.vercel.app <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
