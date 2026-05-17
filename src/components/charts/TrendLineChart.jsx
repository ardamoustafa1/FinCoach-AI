import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceArea,
} from 'recharts';

const P = {
  purple: '#7C3AED', green: '#10B981', red: '#EF4444',
  bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)',
  text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)',
};

const fmt = (v) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const AY_ISIMLERI = ['', 'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const DEMO_GIDER_SERISI = {
  '2024-12': 14000,
  '2025-01': 12600,
  '2025-02': 14850,
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const gelir = payload.find(p => p.dataKey === 'gelir')?.value || 0;
  const gider = payload.find(p => p.dataKey === 'gider')?.value || 0;
  const fark = gelir - gider;
  return (
    <div style={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', fontSize: 13 }}>
      <p style={{ fontWeight: 700, color: P.text1, marginBottom: 8 }}>{label}</p>
      <p style={{ color: '#818cf8', marginBottom: 3 }}>Gelir: {fmt(gelir)}</p>
      <p style={{ color: '#f87171', marginBottom: 6 }}>Gider: {fmt(gider)}</p>
      <div style={{ borderTop: `1px solid ${P.border}`, paddingTop: 6 }}>
        <p style={{ color: fark >= 0 ? P.green : P.red, fontWeight: 700 }}>Net: {fmt(fark)}</p>
      </div>
    </div>
  );
}

export default function TrendLineChart({ islemler, gelirler }) {
  const chartData = useMemo(() => {
    const aylar = [
      { yil: 2024, ay: 12 }, { yil: 2025, ay: 1 }, { yil: 2025, ay: 2 },
      { yil: 2025, ay: 3 },  { yil: 2025, ay: 4 }, { yil: 2025, ay: 5 },
    ];
    return aylar.map(({ yil, ay }) => {
      const prefix = `${yil}-${String(ay).padStart(2, '0')}`;
      const gider = islemler.filter(i => i.tarih.startsWith(prefix)).reduce((s, i) => s + i.tutar, 0);
      const gelir = gelirler.filter(g => g.tarih.startsWith(prefix)).reduce((s, g) => s + g.tutar, 0);
      return {
        name: `${AY_ISIMLERI[ay]} ${yil === 2024 ? "'24" : "'25"}`,
        gelir: gelir || (ay <= 2 && yil === 2025 ? 18000 : gelir) || (yil === 2024 ? 17500 : 0),
        gider: gider || DEMO_GIDER_SERISI[prefix] || 0,
        ay,
      };
    });
  }, [islemler, gelirler]);

  const refAreas = useMemo(() => {
    const areas = [];
    for (let i = 0; i < chartData.length - 1; i++) {
      if (chartData[i].gider > chartData[i].gelir || chartData[i + 1].gider > chartData[i + 1].gelir) {
        areas.push({ x1: chartData[i].name, x2: chartData[i + 1].name });
      }
    }
    return areas;
  }, [chartData]);

  return (
    <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -40, left: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(124,58,237,0.06)', filter: 'blur(36px)', pointerEvents: 'none' }} />
      <h2 style={{ fontSize: 17, fontWeight: 800, color: P.text1, letterSpacing: '-0.01em', marginBottom: 3 }}>6 Aylık Trend</h2>
      <p style={{ fontSize: 12, color: P.text3, marginBottom: 16 }}>Gelir ve gider karşılaştırması</p>

      <ResponsiveContainer width="100%" height={300} minHeight={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: P.text3, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: P.text3, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={(val) => <span style={{ fontSize: 12, color: P.text2 }}>{val === 'gelir' ? 'Gelir' : 'Gider'}</span>} />
          {refAreas.map((a, i) => (
            <ReferenceArea key={i} x1={a.x1} x2={a.x2} fill="#ef4444" fillOpacity={0.06} />
          ))}
          <Line type="monotone" dataKey="gelir" stroke={P.purple} strokeWidth={2.5}
            dot={{ r: 4, fill: P.purple, strokeWidth: 2, stroke: '#0D0F1E' }}
            activeDot={{ r: 6, fill: '#A78BFA' }}
            animationDuration={1500} animationEasing="ease-out"
          />
          <Line type="monotone" dataKey="gider" stroke={P.red} strokeWidth={2.5}
            dot={{ r: 4, fill: P.red, strokeWidth: 2, stroke: '#0D0F1E' }}
            activeDot={{ r: 6, fill: '#f87171' }}
            animationDuration={1500} animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
