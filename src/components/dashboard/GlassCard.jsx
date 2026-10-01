/**
 * GlassCard — Uygulama genelindeki temel yüzey.
 * Cam efekti, üst kenar ışık çizgisi ve imleç spot ışığı `index.css`
 * içindeki `.glass-card` / `.spotlight` sınıflarından gelir.
 *
 * @param {{ children: React.ReactNode, style?: React.CSSProperties, hover?: boolean, glow?: boolean, onClick?: () => void, className?: string }} props
 */
import { useCallback } from 'react';

export default function GlassCard({ children, style = {}, hover = true, glow = false, onClick, className = '' }) {
  const onMove = useCallback((e) => {
    if (!glow) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  }, [glow]);

  return (
    <div
      className={`glass-card${glow ? ' spotlight' : ''}${hover ? '' : ' no-hover'} ${className}`}
      onMouseMove={onMove}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : undefined,
        ...(hover ? null : { transform: 'none' }),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
