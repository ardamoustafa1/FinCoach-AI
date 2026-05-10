import { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector,
} from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

const RENKLER = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316',
];

const fmt = (v) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

/* Aktif dilim render fonksiyonu */
function ActiveShape(props) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16}
        startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.4} />
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#94a3b8" fontSize={13}>{payload.name}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#f1f5f9" fontWeight={700} fontSize={15}>{fmt(value)}</text>
      <text x={cx} y={cy + 30} textAnchor="middle" fill="#64748b" fontSize={12}>%{(percent * 100).toFixed(1)}</text>
    </g>
  );
}

export default function CategoryPieChart({ islemler }) {
  const [activeIdx, setActiveIdx] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);

  const pieData = useMemo(() => {
    const map = {};
    islemler.forEach((i) => {
      map[i.kategori] = (map[i.kategori] || 0) + i.tutar;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [islemler]);

  const toplam = pieData.reduce((s, d) => s + d.value, 0);

  const catIslemler = useMemo(() => {
    if (!expandedCat) return [];
    return islemler
      .filter((i) => i.kategori === expandedCat)
      .sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
  }, [islemler, expandedCat]);

  const handlePieClick = (_, idx) => {
    const cat = pieData[idx]?.name;
    setExpandedCat(expandedCat === cat ? null : cat);
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
        Kategori Dağılımı
      </h2>
      <p className="text-xs text-surface-700 dark:text-surface-200 mb-4">Dilime tıklayarak detay görün</p>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%" cy="50%"
            innerRadius={65} outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            activeIndex={activeIdx}
            activeShape={ActiveShape}
            onMouseEnter={(_, idx) => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
            onClick={handlePieClick}
            animationBegin={0}
            animationDuration={1200}
            animationEasing="ease-out"
            style={{ cursor: 'pointer' }}
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={RENKLER[i % RENKLER.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }}
            formatter={(v, name) => [fmt(v), name]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
        {pieData.map((d, i) => (
          <button key={d.name} onClick={() => setExpandedCat(expandedCat === d.name ? null : d.name)}
            className={`flex items-center gap-1.5 text-xs cursor-pointer transition-colors ${expandedCat === d.name ? 'text-white font-semibold' : 'text-surface-700 dark:text-surface-200 hover:text-white'}`}>
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: RENKLER[i % RENKLER.length] }} />
            {d.name} ({((d.value / toplam) * 100).toFixed(0)}%)
          </button>
        ))}
      </div>

      {/* Açılır işlem listesi */}
      {expandedCat && (
        <div className="mt-4 border-t border-surface-200 dark:border-surface-700 pt-4 animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
              {expandedCat} İşlemleri ({catIslemler.length})
            </h3>
            <button onClick={() => setExpandedCat(null)} className="text-surface-700 dark:text-surface-200 hover:text-white cursor-pointer">
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {catIslemler.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-50 dark:bg-surface-800/50 text-sm">
                <div>
                  <p className="text-surface-900 dark:text-white font-medium">{tx.aciklama}</p>
                  <p className="text-xs text-surface-700 dark:text-surface-200">{tx.tarih}</p>
                </div>
                <span className="text-danger-500 font-semibold">{fmt(tx.tutar)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
