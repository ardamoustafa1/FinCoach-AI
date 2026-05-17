/**
 * GlassCard — Tüm uygulama genelinde kullanılan temel kart bileşeni.
 * Hover efekti, glow (ışıma) efekti ve geçiş animasyonlarını destekler.
 *
 * @param {{ children: React.ReactNode, style?: React.CSSProperties, hover?: boolean, glow?: boolean, onClick?: () => void, className?: string }} props
 */
import { useState } from 'react';

import { P } from '../../styles/palette';
export default function GlassCard({ children, style = {}, hover = true, glow = false, onClick, className }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={className}
      style={{
        background: isHovered && hover ? P.bg3 : P.bg2,
        border: `1px solid ${isHovered && hover ? P.borderHover : P.border}`,
        borderRadius: 20,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered && hover ? 'translateY(-2px)' : 'none',
        boxShadow: isHovered && glow ? `0 0 32px ${P.purpleGlow}` : '0 4px 24px rgba(0,0,0,0.4)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
