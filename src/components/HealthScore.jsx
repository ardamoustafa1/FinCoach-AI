import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { aySkoru, skorGecmisi } from '../utils/healthScore';
import { getBudgetLimits } from '../utils/storage';

/* ─── Helpers ─── */
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

/* ─── SVG Arc ─── */
const R = 80, CX = 100, CY = 105;
const CIRC = 2 * Math.PI * R;
const AÇI = 220;
const STROKE_GAP = CIRC * ((360 - AÇI) / 360);
const ARC_LEN = CIRC - STROKE_GAP;

function ArcProgress({ skor, renk }) {
  const [animSkor, setAnimSkor] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const sure = 2000;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / sure, 1);
      const eased = t < 1 ? 1 - Math.pow(2, -10 * t) : 1;
      setAnimSkor(eased * skor);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [skor]);

  const offset = ARC_LEN * (1 - animSkor / 100);

  return (
    <svg width="200" height="210" style={{ margin: '0 auto', display: 'block', filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.4))' }}>
      <circle
        cx={CX} cy={CY} r={R} fill="none"
        stroke="rgba(255,255,255,0.07)" strokeWidth={14} strokeLinecap="round"
        strokeDasharray={`${ARC_LEN} ${STROKE_GAP}`}
        style={{ transform: `rotate(160deg)`, transformOrigin: `${CX}px ${CY}px` }}
      />
      <circle
        cx={CX} cy={CY} r={R} fill="none"
        stroke={renk} strokeWidth={14} strokeLinecap="round"
        strokeDasharray={`${ARC_LEN} ${STROKE_GAP}`}
        strokeDashoffset={offset}
        style={{ transform: `rotate(160deg)`, transformOrigin: `${CX}px ${CY}px`, transition: 'stroke 0.5s ease', filter: `drop-shadow(0 0 8px ${renk}88)` }}
      />
      <text x={CX} y={CY - 8} textAnchor="middle" fontSize={40} fontWeight={800} fill={renk}>{Math.round(animSkor)}</text>
      <text x={CX} y={CY + 16} textAnchor="middle" fontSize={13} fill="#64748B" fontWeight={500}>/ 100</text>
      <text x={CX} y={CY + 38} textAnchor="middle" fontSize={14} fill={renk} fontWeight={700}>{skorEtiket(animSkor)}</text>
    </svg>
  );
}

/* ─── Metric Bar ─── */
function MetrikBar({ etiket, puan, max }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW((puan / max) * 100), 100);
    return () => clearTimeout(t);
  }, [puan, max]);
  const renk = puan / max >= 0.8 ? '#10b981' : puan / max >= 0.5 ? '#f59e0b' : '#ef4444';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#94A3B8' }}>{etiket}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: renk }}>{puan} / {max}p</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, width: `${w}%`, background: renk, boxShadow: `0 0 6px ${renk}66`, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  );
}

/* ─── Score Tooltip ─── */
function SkorTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#1C2038', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', maxWidth: 200 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>{d.name}</p>
      <p style={{ fontSize: 14, fontWeight: 800, color: skorRenk(d.skor), marginBottom: 4 }}>{d.skor} / 100</p>
      <p style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>{d.yorum}</p>
    </div>
  );
}

/* ─── Main Component ─── */
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
    <div style={{
      background: '#141728', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 20, padding: '24px 28px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: `${renk}10`, filter: 'blur(40px)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.01em', marginBottom: 3 }}>Finansal Sağlık Skoru</h2>
          <p style={{ fontSize: 12, color: '#64748B' }}>Mayıs 2025 · Gerçek verilerden hesaplandı</p>
        </div>
        <span style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: `${renk}18`, color: renk, border: `1px solid ${renk}33` }}>
          {skorEtiket(skor)}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
        {/* Left: Arc + metric bars */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ArcProgress skor={skor} renk={renk} />
          <div style={{ width: '100%', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {metriks.map((m) => <MetrikBar key={m.etiket} {...m} />)}
          </div>
        </div>

        {/* Right: History chart */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', marginBottom: 16 }}>6 Aylık Skor Geçmişi</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={gecmis} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <ReferenceLine y={70} stroke="#10b981" strokeDasharray="4 2" opacity={0.5} label={{ value: 'İyi', fill: '#10b981', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 2" opacity={0.5} label={{ value: 'Orta', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
              <Tooltip content={<SkorTooltip />} />
              <Line
                type="monotone" dataKey="skor"
                stroke="#7C3AED" strokeWidth={2.5}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return <circle key={payload.name} cx={cx} cy={cy} r={5} fill={skorRenk(payload.skor)} stroke="#0D0F1E" strokeWidth={2} />;
                }}
                activeDot={{ r: 7, fill: '#A78BFA', stroke: '#0D0F1E', strokeWidth: 2 }}
                animationDuration={1800}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            {[['#10b981', '71–100 Sağlıklı'], ['#f59e0b', '41–70 Orta'], ['#ef4444', '0–40 Riskli']].map(([c, l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748B' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
