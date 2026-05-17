import { AlertTriangle } from 'lucide-react';
import { fmt } from '../../utils/categories';

import { P } from '../../styles/palette';
export default function UnusualSpendingModal({ alert, onNormal, onReview }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div style={{ width: '100%', maxWidth: 420, background: P.bg2, border: `1px solid ${P.amber}33`, borderRadius: 22, padding: '28px', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', animation: 'fadeUp 0.25s ease' }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: `${P.amber}18`, border: `1px solid ${P.amber}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <AlertTriangle size={22} color={P.amber} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: P.text1, marginBottom: 8 }}>Alışılmadık harcama</h3>
        <p style={{ fontSize: 13, color: P.text2, lineHeight: 1.75, marginBottom: 14 }}>
          Bu harcama sana alışılmadık geliyor{' '}
          <span style={{ fontWeight: 700, color: P.text1 }}>(Ort: {fmt(alert.average)}, Bu: {fmt(alert.amount)})</span>
        </p>
        <div style={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: P.text1 }}>{alert.transaction.magaza || alert.transaction.aciklama}</p>
          <p style={{ fontSize: 11, color: P.text3, marginTop: 3 }}>{alert.transaction.kategori} · {alert.transaction.tarih}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onNormal} style={{ padding: '11px', borderRadius: 12, border: `1px solid ${P.border}`, background: 'transparent', color: P.text2, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = P.bg3; e.currentTarget.style.color = P.text1; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = P.text2; }}>
            Normal, yanlış alarm
          </button>
          <button onClick={onReview} style={{ padding: '11px', borderRadius: 12, border: 'none', background: P.amber, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            İnceleyeceğim
          </button>
        </div>
      </div>
    </div>
  );
}
