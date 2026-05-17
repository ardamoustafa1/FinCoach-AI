import { AlertTriangle } from 'lucide-react';
import { fmt } from '../../utils/categories';

import { P } from '../../styles/palette';
export default function DeleteTransactionConfirm({ islem, onOnayla, onIptal }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onIptal()}
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 24,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 380,
        background: P.bg2, border: `1px solid ${P.border}`,
        borderRadius: 22, padding: '28px 28px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'fadeUp 0.25s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: `${P.red}18`, border: `1px solid ${P.red}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} color={P.red} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1 }}>İşlemi Sil</h3>
        </div>
        <p style={{ fontSize: 13, color: P.text2, marginBottom: 12, lineHeight: 1.7 }}>Bu işlemi silmek istediğine emin misin?</p>
        <div style={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: P.text1 }}>{islem.magaza || islem.aciklama}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: P.red }}>-{fmt(islem.tutar)}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onIptal} style={{
            flex: 1, padding: '11px 0', borderRadius: 12, border: `1px solid ${P.border}`,
            background: 'transparent', color: P.text2, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = P.bg3; e.currentTarget.style.color = P.text1; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = P.text2; }}>
            İptal
          </button>
          <button onClick={onOnayla} style={{
            flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
            background: P.red, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
            boxShadow: `0 4px 16px ${P.red}44`, transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Evet, Sil
          </button>
        </div>
      </div>
    </div>
  );
}
