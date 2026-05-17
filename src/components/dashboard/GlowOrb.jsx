/**
 * GlowOrb — Arka plan dekoratif ışık efekti.
 * Sayfanın ambiyans atmosferini oluşturan mutlak konumlandırılmış degrade küre.
 *
 * @param {{ color?: string, size?: number, top?: number|string, left?: number|string, right?: number|string, bottom?: number|string, opacity?: number }} props
 */
export default function GlowOrb({
  color = '#7C3AED',
  size = 320,
  top,
  left,
  right,
  bottom,
  opacity = 0.18,
}) {
  return (
    <div style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      filter: `blur(${size * 0.38}px)`,
      opacity,
      top,
      left,
      right,
      bottom,
      pointerEvents: 'none',
      zIndex: 0,
    }} />
  );
}
