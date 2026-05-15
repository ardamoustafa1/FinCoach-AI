/**
 * PageHeader — Unified page header component for consistent design across all pages.
 * Usage:
 *   <PageHeader icon={<Calculator size={24} />} color="#EC4899"
 *     title="Vergi Asistanı" subtitle="Yasal kesintilerinizi hesaplayın" badge="AI Powered" />
 */

const P = {
  text1: 'var(--text-primary)', text2: 'var(--text-secondary)',
  bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)', border: 'var(--border-color)',
};

export default function PageHeader({ icon, color = '#7C3AED', title, subtitle, badge, children }) {
  return (
    <div style={{
      padding: '32px 0 28px',
      animation: 'fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        {/* Left: icon + text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: `${color}18`, border: `1px solid ${color}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${color}20`,
          }}>
            {/* Clone icon with correct color */}
            <span style={{ color }}>{icon}</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', margin: 0 }}>
                {title}
              </h1>
              {badge && (
                <span style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
                  color, background: `${color}15`, border: `1px solid ${color}30`,
                  padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase',
                }}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p style={{ fontSize: 14, color: P.text2, margin: '4px 0 0', lineHeight: 1.5 }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: optional action buttons */}
        {children && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {children}
          </div>
        )}
      </div>

      {/* Divider with color accent */}
      <div style={{
        marginTop: 20, height: 1,
        background: `linear-gradient(90deg, ${color}40, transparent 70%)`,
      }} />
    </div>
  );
}

/** Reusable stat card used in page summaries */
export function StatCard({ label, value, sub, color = '#7C3AED', icon }) {
  return (
    <div style={{
      background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20,
      padding: '20px 24px', position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.boxShadow = `0 0 24px ${color}15`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Glow blob */}
      <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: color, opacity: 0.07, filter: 'blur(40px)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: P.text2, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>{label}</p>
          <p style={{ fontSize: 26, fontWeight: 900, color, letterSpacing: '-0.02em', margin: '0 0 4px' }}>{value}</p>
          {sub && <p style={{ fontSize: 12, color: P.text2, margin: 0 }}>{sub}</p>}
        </div>
        {icon && (
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color }}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Unified loading spinner */
export function PageLoader({ message = 'Yükleniyor...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(124,58,237,0.15)', borderTopColor: '#7C3AED', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontSize: 14, fontWeight: 600, color: P.text2, letterSpacing: '0.04em' }}>{message}</p>
    </div>
  );
}

/** Unified section heading */
export function SectionTitle({ children, color = '#7C3AED' }) {
  return (
    <h2 style={{ fontSize: 13, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 3, height: 14, background: color, borderRadius: 99, display: 'inline-block' }} />
      {children}
    </h2>
  );
}
