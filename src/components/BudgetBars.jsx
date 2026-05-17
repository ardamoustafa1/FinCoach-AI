import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ShoppingCart, UtensilsCrossed, Bus, Tv, Zap, ShoppingBag, Gamepad2, Heart } from 'lucide-react';

import { P } from '../styles/palette';
/* ─── Palette ─── */

const KAT_IKONLARI = {
  Market: { icon: ShoppingCart, renk: '#10b981' },
  'Yemek Siparişi': { icon: UtensilsCrossed, renk: '#f59e0b' },
  Ulaşım: { icon: Bus, renk: '#6366f1' },
  Abonelik: { icon: Tv, renk: '#a855f7' },
  Fatura: { icon: Zap, renk: '#3b82f6' },
  Alışveriş: { icon: ShoppingBag, renk: '#ec4899' },
  Eğlence: { icon: Gamepad2, renk: '#f97316' },
  Sağlık: { icon: Heart, renk: '#14b8a6' },
};

const fmt = (v) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

function BudgetRow({ kategori, harcanan, limit }) {
  const [width, setWidth] = useState(0);
  const timerRef = useRef(null);
  const pct = limit > 0 ? (harcanan / limit) * 100 : 0;
  const displayPct = Math.min(pct, 100);

  useEffect(() => {
    timerRef.current = setTimeout(() => setWidth(displayPct), 80);
    return () => clearTimeout(timerRef.current);
  }, [displayPct]);

  const barColor = pct >= 100 ? P.red : pct >= 80 ? P.amber : P.green;
  const katInfo = KAT_IKONLARI[kategori] || { icon: ShoppingBag, renk: '#94a3b8' };
  const Icon = katInfo.icon;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
      {/* Icon */}
      <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: `${katInfo.renk}18`, border: `1px solid ${katInfo.renk}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={17} style={{ color: katInfo.renk }} />
      </div>

      {/* Label + Bar */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: P.text1 }}>{kategori}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {pct >= 100 && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(239,68,68,0.15)', color: P.red, border: '1px solid rgba(239,68,68,0.3)' }}>
                Aşıldı!
              </span>
            )}
            {pct >= 80 && pct < 100 && <AlertTriangle size={13} color={P.amber} />}
            <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 100 ? P.red : pct >= 80 ? P.amber : P.text2 }}>%{Math.round(pct)}</span>
          </div>
        </div>
        {/* Track */}
        <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: barColor, width: `${width}%`, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 8px ${barColor}55` }} />
        </div>
      </div>

      {/* Amounts */}
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 90 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: pct >= 100 ? P.red : pct >= 80 ? P.amber : P.text1 }}>{fmt(harcanan)}</p>
        <p style={{ fontSize: 11, color: P.text3 }}>{fmt(limit)}</p>
      </div>
    </div>
  );
}

export default function BudgetBars({ harcamalar, limitler }) {
  const satirlar = Object.entries(limitler)
    .map(([kat, limit]) => ({ kategori: kat, harcanan: harcamalar[kat] || 0, limit, pct: limit > 0 ? ((harcamalar[kat] || 0) / limit) * 100 : 0 }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(124,58,237,0.06)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: P.text1, letterSpacing: '-0.01em' }}>Bütçe Limitleri</h2>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 99, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', letterSpacing: '0.08em' }}>
          Mayıs 2025
        </span>
      </div>
      <p style={{ fontSize: 12, color: P.text3, marginBottom: 4 }}>Kategorilere göre aylık harcama takibi</p>

      <div>
        {satirlar.map(s => <BudgetRow key={s.kategori} {...s} />)}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${P.border}` }}>
        {[
          { color: P.green, label: 'Normal (0–79%)' },
          { color: P.amber, label: 'Uyarı (80–99%)' },
          { color: P.red, label: 'Aşıldı (100%+)' },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: P.text3 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
