/**
 * BalanceTrendChart — Bakiye trend alanı grafik bileşeni.
 * 1A / 3A / 6A / 1Y zaman dilimi filtrelemesini ve
 * Recharts AreaChart'ı kapsülleyen bağımsız bileşen.
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

const P = {
  purple: '#7C3AED',
  purpleLight: '#A78BFA',
  purpleDim: 'rgba(124,58,237,0.15)',
  text1: 'var(--text-primary)',
  text3: 'var(--text-muted)',
  border: 'var(--border-color)',
};

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
    <GlassCard style={{ padding: '28px 32px', marginBottom: 24 }}>
      {/* Başlık satırı */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: P.text1, marginBottom: 4 }}>
            Bakiye Trendi
          </h2>
          <p style={{ fontSize: 13, color: P.text3 }}>Son 12 aylık bakiye gelişimi</p>
        </div>

        {/* Zaman filtresi */}
        <div style={{ display: 'flex', gap: 8 }}>
          {RANGES.map((t) => (
            <button
              key={t}
              onClick={() => setRange(t)}
              style={{
                padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                border: `1px solid ${range === t ? P.purple : P.border}`,
                background: range === t ? P.purpleDim : 'transparent',
                color: range === t ? P.purpleLight : P.text3,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220} minHeight={220}>
        <AreaChart data={filtered} margin={{ top: 5, right: 5, bottom: 0, left: 10 }}>
          <defs>
            <linearGradient id="balanceGradChart" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={P.purple} stopOpacity={0.4} />
              <stop offset="100%" stopColor={P.purple} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: P.text3, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: P.text3, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
          <Tooltip content={<ChartTooltip formatter={fmt} />} />
          <Area
            type="monotone"
            dataKey="bakiye"
            stroke={P.purple}
            strokeWidth={2.5}
            fill="url(#balanceGradChart)"
            dot={false}
            activeDot={{ r: 5, fill: P.purple, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
