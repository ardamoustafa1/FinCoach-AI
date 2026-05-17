import { useState } from 'react';
import { P } from '../../styles/palette';

export default function ActionButton({ onClick, label, color = P.purple, variant = 'fill', disabled }) {
  const [hov, setHov] = useState(false);
  const isFill = variant === 'fill';
  const isDanger = variant === 'danger';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '8px 18px', borderRadius: 11, fontSize: 13, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        border: isFill ? 'none' : `1px solid ${isDanger ? 'rgba(239,68,68,0.3)' : `${color}40`}`,
        background: isFill
          ? `linear-gradient(135deg, ${color}, ${color}cc)`
          : isDanger
            ? hov ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.08)'
            : hov ? `${color}25` : `${color}12`,
        color: isFill ? '#fff' : isDanger ? P.red : color,
        boxShadow: isFill && hov ? `0 8px 20px ${color}50` : 'none',
        transform: isFill && hov ? 'translateY(-1px)' : 'none',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}
