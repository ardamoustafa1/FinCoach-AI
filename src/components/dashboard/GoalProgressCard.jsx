/**
 * GoalProgressCard — Hedef ilerleme satırı.
 * Görünür alana girince dolan ilerleme çubuğu ve monospace tutarlar.
 *
 * @param {{ goal: import('../../types').Goal, colorIndex: number }} props
 */
import { P } from '../../styles/palette';

const GOAL_COLORS = [P.green, P.blue, P.accent, P.amber];

const fmt = (v) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(v);

export default function GoalProgressCard({ goal, colorIndex }) {
  const current = Number(goal.current ?? goal.mevcut ?? goal.currentAmount ?? 0);
  const target = Number(goal.target ?? goal.hedef ?? goal.targetAmount ?? 1) || 1;
  const pct = Math.min((current / target) * 100, 100);
  const color = GOAL_COLORS[colorIndex % GOAL_COLORS.length];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 9 }}>
        <span style={{
          fontSize: 13, fontWeight: 550, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {goal.title || goal.baslik || goal.name || `Hedef ${colorIndex + 1}`}
        </span>
        <span className="num" style={{ fontSize: 12, color, flexShrink: 0 }}>{Math.round(pct)}%</span>
      </div>

      <div style={{ background: 'var(--hairline)', borderRadius: 999, height: 5, overflow: 'hidden' }}>
        <div
          className="fill-bar"
          style={{
            height: '100%', borderRadius: 999,
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            boxShadow: `0 0 10px ${color}4D`,
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
        <span className="num" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{fmt(current)}</span>
        <span className="num" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{fmt(target)}</span>
      </div>
    </div>
  );
}
