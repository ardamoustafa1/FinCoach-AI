/**
 * ChartTooltip — Tüm Recharts grafikleri için özelleştirilmiş tooltip bileşeni.
 * Uygulamanın tema sistemine uygun, koyu arka planlı ve tutarlı görünüm sağlar.
 *
 * @param {{ active?: boolean, payload?: Array<{color?: string, name?: string, value?: number|string}>, label?: string, formatter?: (v: any) => string }} props
 */
const P = {
  bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)',
  text2: 'var(--text-secondary)',
};

export default function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background: P.bg3,
      border: `1px solid ${P.border}`,
      borderRadius: 12,
      padding: '10px 14px',
      fontSize: 12,
    }}>
      <p style={{
        color: P.text2,
        marginBottom: 6,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '2px 0', fontWeight: 600 }}>
          {p.name}: {formatter && p.value !== undefined ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}
