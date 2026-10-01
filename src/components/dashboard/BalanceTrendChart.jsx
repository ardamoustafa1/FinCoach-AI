/**
 * BalanceTrendChart — Bakiye trend alanı grafiği.
 * 1A / 3A / 6A / 1Y zaman dilimi filtresi ve çizilerek gelen alan eğrisi.
 *
 * @param {{ data: Array<{month?: string, bakiye?: number}> }} props
 */
import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import GlassCard from './GlassCard';
import ChartTooltip from './ChartTooltip';
import { P } from '../../styles/palette';

const fmt = (v) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(v);

const fmtShort = (v) =>
  Math.abs(v) >= 1000 ? `₺${(v / 1000).toFixed(1)}B` : `₺${v}`;

const RANGES = ['1A', '3A', '6A', '1Y'];

export default function BalanceTrendChart({ data }) {
  const [range, setRange] = useState('1Y');

  const filtered = (() => {
    if (range === '1A') return data.slice(-1);
    if (range === '3A') return data.slice(-3);
    if (range === '6A') return data.slice(-6);
    return data;
  })();

  return (
    <GlassCard style={{ padding: '28px 30px' }}>
      {/* Başlık satırı */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap', marginBottom: 26,
      }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 5 }}>
            Bakiye Trendi
          </h3>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Son 12 aylık bakiye gelişimi</p>
        </div>

        {/* Zaman filtresi */}
        <div style={{ display: 'flex', gap: 6, padding: 4, borderRadius: 999, border: '1px solid var(--border-color)' }}>
          {RANGES.map((t) => (
            <button
              key={t}
              onClick={() => setRange(t)}
              className="num"
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 11.5,
                border: 'none',
                background: range === t ? 'rgba(52,192,138,0.14)' : 'transparent',
                color: range === t ? P.green : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all .4s var(--ease-out-expo)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="draw-in">
        <ResponsiveContainer width="100%" height={230} minHeight={230}>
          <AreaChart data={filtered} margin={{ top: 5, right: 5, bottom: 0, left: 10 }}>
            <defs>
              <linearGradient id="balanceGradChart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={P.green} stopOpacity={0.34} />
                <stop offset="55%" stopColor={P.green} stopOpacity={0.08} />
                <stop offset="100%" stopColor={P.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
            <Tooltip cursor={{ stroke: 'var(--hairline)' }} content={<ChartTooltip formatter={fmt} />} />
            <Area
              type="monotone"
              dataKey="bakiye"
              name="Bakiye"
              stroke={P.green}
              strokeWidth={2}
              fill="url(#balanceGradChart)"
              dot={false}
              activeDot={{ r: 4.5, fill: P.green, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
