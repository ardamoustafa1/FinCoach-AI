import { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector,
} from 'recharts';
import { ChevronUp } from 'lucide-react';

const RENKLER = ['#7C3AED', '#10b981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14b8a6', '#f97316'];

const P = {
  bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)',
  text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)',
};

const fmt = (v) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

function ActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.4} />
      <text x={cx} y={cy - 10} textAnchor="middle" fill={P.text2} fontSize={12}>{payload.name}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill={P.text1} fontWeight={800} fontSize={15}>{fmt(value)}</text>
      <text x={cx} y={cy + 30} textAnchor="middle" fill={P.text3} fontSize={12}>%{(percent * 100).toFixed(1)}</text>
    </g>
  );
}

export default function CategoryPieChart({ islemler }) {
  const [activeIdx, setActiveIdx] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);

  const pieData = useMemo(() => {
    const map = {};
    islemler.forEach((i) => { map[i.kategori] = (map[i.kategori] || 0) + i.tutar; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [islemler]);

  const toplam = pieData.reduce((s, d) => s + d.value, 0);

  const catIslemler = useMemo(() => {
    if (!expandedCat) return [];
    return islemler.filter((i) => i.kategori === expandedCat).sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
  }, [islemler, expandedCat]);

  const handlePieClick = (_, idx) => {
    const cat = pieData[idx]?.name;
    setExpandedCat(expandedCat === cat ? null : cat);
  };

  return (
    <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(124,58,237,0.06)', filter: 'blur(36px)', pointerEvents: 'none' }} />
      <h2 style={{ fontSize: 17, fontWeight: 800, color: P.text1, letterSpacing: '-0.01em', marginBottom: 3 }}>Kategori Dağılımı</h2>
      <p style={{ fontSize: 12, color: P.text3, marginBottom: 16 }}>Dilime tıklayarak detay görün</p>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={pieData} cx="50%" cy="50%"
            innerRadius={65} outerRadius={100} paddingAngle={3} dataKey="value"
            activeIndex={activeIdx} activeShape={ActiveShape}
            onMouseEnter={(_, idx) => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
            onClick={handlePieClick}
            animationBegin={0} animationDuration={1200} animationEasing="ease-out"
            style={{ cursor: 'pointer' }}
          >
            {pieData.map((_, i) => <Cell key={i} fill={RENKLER[i % RENKLER.length]} stroke="none" />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12, color: P.text1 }}
            formatter={(v, name) => [fmt(v), name]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 12 }}>
        {pieData.map((d, i) => (
          <button key={d.name} onClick={() => setExpandedCat(expandedCat === d.name ? null : d.name)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer',
              color: expandedCat === d.name ? P.text1 : P.text3,
              fontWeight: expandedCat === d.name ? 700 : 500,
              background: 'none', border: 'none', padding: 0, transition: 'color 0.15s',
            }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: RENKLER[i % RENKLER.length], flexShrink: 0, display: 'inline-block' }} />
            {d.name} ({((d.value / toplam) * 100).toFixed(0)}%)
          </button>
        ))}
      </div>

      {/* Expanded transactions */}
      {expandedCat && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${P.border}`, paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: P.text1 }}>{expandedCat} İşlemleri ({catIslemler.length})</h3>
            <button onClick={() => setExpandedCat(null)} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${P.border}`, borderRadius: 8, padding: 4, cursor: 'pointer', color: P.text2, display: 'flex' }}>
              <ChevronUp size={16} />
            </button>
          </div>
          <div style={{ maxHeight: 192, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {catIslemler.map((tx) => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, background: P.bg3, border: `1px solid ${P.border}` }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: P.text1 }}>{tx.aciklama}</p>
                  <p style={{ fontSize: 11, color: P.text3 }}>{tx.tarih}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#EF4444' }}>{fmt(tx.tutar)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
