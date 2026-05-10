import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { aySkoru, skorGecmisi } from '../utils/healthScore';
import { getBudgetLimits } from '../utils/storage';

// ─── Renk eşikleri ───────────────────────────────────────────
function skorRenk(s) {
  if (s >= 71) return '#10b981';
  if (s >= 41) return '#f59e0b';
  return '#ef4444';
}

function skorEtiket(s) {
  if (s >= 71) return 'Sağlıklı';
  if (s >= 41) return 'Orta';
  return 'Riskli';
}

// ─── SVG Dairesel Progress ───────────────────────────────────
const R = 80;
const CX = 100;
const CY = 105;
const CIRC = 2 * Math.PI * R;
// Yay: 220° (sol alttan sağ alta, üstten geçen)
const AÇI = 220;
const GAP_ORAN = (360 - AÇI) / 360;
const STROKE_GAP = CIRC * GAP_ORAN;
const ARC_LEN = CIRC - STROKE_GAP;

function polarToXY(angleDeg, r) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function ArcProgress({ skor, renk }) {
  const [animSkor, setAnimSkor] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const sure = 2000;
    const baslangic = performance.now();
    const tick = (now) => {
      const t = Math.min((now - baslangic) / sure, 1);
      const eased = t < 1 ? 1 - Math.pow(2, -10 * t) : 1;
      setAnimSkor(eased * skor);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [skor]);

  // strokeDashoffset: ARC_LEN'nin tamamı = 0 skor, 0 = tam dolu
  const offset = ARC_LEN * (1 - animSkor / 100);

  // Rotasyon: yayın başlangıcı sol-alt (-110° = 250° konumuna)
  const rotation = 250 - AÇI / 2; // -160 → transform ile 250

  return (
    <svg width="200" height="210" className="mx-auto drop-shadow-xl">
      {/* Arkaplan arc (gri) */}
      <circle
        cx={CX} cy={CY} r={R}
        fill="none"
        stroke="currentColor"
        className="text-surface-200 dark:text-surface-700"
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={`${ARC_LEN} ${STROKE_GAP}`}
        transform={`rotate(${rotation + AÇI / 2 + 90 - 180} ${CX} ${CY})`}
        style={{ transform: `rotate(${160}deg)`, transformOrigin: `${CX}px ${CY}px` }}
      />
      {/* Öön arc (renkli, animasyonlu) */}
      <circle
        cx={CX} cy={CY} r={R}
        fill="none"
        stroke={renk}
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={`${ARC_LEN} ${STROKE_GAP}`}
        strokeDashoffset={offset}
        style={{
          transform: `rotate(160deg)`,
          transformOrigin: `${CX}px ${CY}px`,
          transition: 'stroke 0.5s ease',
          filter: `drop-shadow(0 0 8px ${renk}88)`,
        }}
      />
      {/* Skor sayısı */}
      <text x={CX} y={CY - 8} textAnchor="middle" fontSize={40} fontWeight={800} fill={renk}>
        {Math.round(animSkor)}
      </text>
      <text x={CX} y={CY + 16} textAnchor="middle" fontSize={13} fill="#94a3b8" fontWeight={500}>
        / 100
      </text>
      <text x={CX} y={CY + 38} textAnchor="middle" fontSize={14} fill={renk} fontWeight={700}>
        {skorEtiket(animSkor)}
      </text>
    </svg>
  );
}

// ─── Alt Metrik Satırı ────────────────────────────────────────
function MetrikBar({ etiket, puan, max }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW((puan / max) * 100), 100);
    return () => clearTimeout(t);
  }, [puan, max]);

  const renk = puan / max >= 0.8 ? '#10b981' : puan / max >= 0.5 ? '#f59e0b' : '#ef4444';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-surface-700 dark:text-surface-200 font-medium">{etiket}</span>
        <span className="font-bold" style={{ color: renk }}>{puan} / {max}p</span>
      </div>
      <div className="h-2.5 rounded-full bg-surface-100 dark:bg-surface-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${w}%`, backgroundColor: renk, boxShadow: `0 0 6px ${renk}66` }}
        />
      </div>
    </div>
  );
}

// ─── Skor Geçmişi Tooltip ────────────────────────────────────
function SkorTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface-900 border border-surface-700 rounded-xl p-3 shadow-xl max-w-[200px] text-xs">
      <p className="font-bold text-white mb-1">{d.name}</p>
      <p style={{ color: skorRenk(d.skor) }} className="font-bold text-sm mb-1.5">{d.skor} / 100</p>
      <p className="text-surface-200 leading-snug">{d.yorum}</p>
    </div>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────
export default function HealthScore({ islemler, gelirler }) {
  const { skor, metrikler, gecmis } = useMemo(() => {
    const limitler = getBudgetLimits();
    const { toplam, metrikler } = aySkoru(islemler, gelirler, 2025, 5, limitler);
    const gecmis = skorGecmisi(islemler, gelirler);
    return { skor: toplam, metrikler, gecmis };
  }, [islemler, gelirler]);

  const renk = skorRenk(skor);
  const metriks = Object.values(metrikler);

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
            Finansal Sağlık Skoru
          </h2>
          <p className="text-xs text-surface-700 dark:text-surface-200 mt-0.5">
            Mayıs 2025 · Gerçek verilerden hesaplandı
          </p>
        </div>
        <span
          className="px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ backgroundColor: `${renk}18`, color: renk, border: `1px solid ${renk}33` }}
        >
          {skorEtiket(skor)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Sol: SVG Daire */}
        <div className="flex flex-col items-center">
          <ArcProgress skor={skor} renk={renk} />

          {/* Alt Metrik Barları */}
          <div className="w-full mt-4 space-y-3">
            {metriks.map((m) => (
              <MetrikBar key={m.etiket} {...m} />
            ))}
          </div>
        </div>

        {/* Sağ: Skor Geçmişi */}
        <div>
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">
            6 Aylık Skor Geçmişi
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={gecmis} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <defs>
                <linearGradient id="skorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <ReferenceLine y={70} stroke="#10b981" strokeDasharray="4 2" opacity={0.5}
                label={{ value: 'İyi', fill: '#10b981', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 2" opacity={0.5}
                label={{ value: 'Orta', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
              <Tooltip content={<SkorTooltip />} />
              <Line
                type="monotone"
                dataKey="skor"
                stroke="#6366f1"
                strokeWidth={3}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      key={payload.name}
                      cx={cx} cy={cy} r={5}
                      fill={skorRenk(payload.skor)}
                      stroke="#1e293b"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 7, fill: '#818cf8', stroke: '#1e293b', strokeWidth: 2 }}
                animationDuration={1800}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Renk skala açıklaması */}
          <div className="flex gap-4 mt-3 text-xs text-surface-700 dark:text-surface-200">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-accent-500 inline-block" />71–100 Sağlıklı
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-warn-500 inline-block" />41–70 Orta
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-danger-500 inline-block" />0–40 Riskli
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
