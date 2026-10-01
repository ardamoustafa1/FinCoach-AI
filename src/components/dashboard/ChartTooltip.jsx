/**
 * ChartTooltip — Tüm Recharts grafikleri için ortak, cam yüzeyli tooltip.
 *
 * @param {{ active?: boolean, payload?: Array<{color?: string, name?: string, value?: number|string}>, label?: string, formatter?: (v: any) => string }} props
 */
export default function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(18px) saturate(140%)',
      WebkitBackdropFilter: 'blur(18px) saturate(140%)',
      border: '1px solid var(--border-color)',
      borderRadius: 13,
      padding: '11px 14px',
      boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
      minWidth: 130,
    }}>
      {label && (
        <p className="eyebrow" style={{ fontSize: 8.5, letterSpacing: '0.2em', marginBottom: 9 }}>
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, margin: '4px 0' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: p.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{p.name}</span>
          </span>
          <span className="num" style={{ fontSize: 12, color: 'var(--text-primary)' }}>
            {formatter && p.value !== undefined ? formatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}
