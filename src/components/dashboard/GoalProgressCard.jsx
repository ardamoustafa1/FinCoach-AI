import { P } from '../../styles/palette';
/**
 * GoalProgressCard — Hedef ilerleme kartı bileşeni.
 * Hedef başlığı, animasyonlu ilerleme çubuğu ve mevcut/hedef tutarlarını gösterir.
 *
 * @param {{ goal: import('../../types').Goal, colorIndex: number }} props
 */

const GOAL_COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#3B82F6'];

const fmt = (v) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(v);

export default function GoalProgressCard({ goal, colorIndex }) {
  const current = Number(goal.current || goal.mevcut || 0);
  const target = Number(goal.target || goal.hedef || 1);
  const pct = Math.min((current / target) * 100, 100);
  const color = GOAL_COLORS[colorIndex % GOAL_COLORS.length];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: P.text1 }}>
          {goal.title || goal.baslik || `Hedef ${colorIndex + 1}`}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{Math.round(pct)}%</span>
      </div>

      {/* Animasyonlu ilerleme çubuğu */}
      <div style={{ background: P.bg3, borderRadius: 999, height: 6, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 999, background: color,
          width: `${pct}%`,
          transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 8px ${color}60`,
        }} />
      </div>

      {/* Alt etiketler */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <span style={{ fontSize: 11, color: P.text3 }}>{fmt(current)}</span>
        <span style={{ fontSize: 11, color: P.text3 }}>{fmt(target)}</span>
      </div>
    </div>
  );
}
