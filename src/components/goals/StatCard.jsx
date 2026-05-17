import { useState } from 'react';
import { P } from '../../styles/palette';

export default function StatCard({ label, value, icon: Icon, color, isCurrency = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: 24, borderRadius: 24, background: P.bg2,
        border: `1px solid ${hov ? 'rgba(124,58,237,0.4)' : P.border}`,
        transition: 'all 0.3s ease',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: P.text1, margin: 0 }}>
            {isCurrency ? <><span style={{ fontSize: 16, fontWeight: 600, color: P.text2, marginRight: 2 }}>₺</span>{Math.round(value).toLocaleString('tr-TR')}</> : value}
          </p>
        </div>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: `${color}22`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  );
}
