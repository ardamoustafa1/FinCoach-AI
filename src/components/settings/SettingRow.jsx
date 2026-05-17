import { useState } from 'react';
import { P } from '../../styles/palette';

export default function SettingRow({ icon: Icon, iconColor = P.purple, title, subtitle, action }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 24px', borderRadius: 18,
        background: hov ? P.bg3 : P.bg2,
        border: `1px solid ${hov ? P.borderHover : P.border}`,
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        transform: hov ? 'translateY(-1px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: `${iconColor}1A`, border: `1px solid ${iconColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={19} color={iconColor} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: P.text1, marginBottom: 2 }}>{title}</p>
          {subtitle && <p style={{ fontSize: 12, color: P.text3 }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{action}</div>
    </div>
  );
}
