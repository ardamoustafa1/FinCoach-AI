import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ShoppingCart, UtensilsCrossed, Bus, Tv, Zap, ShoppingBag, Gamepad2, Heart } from 'lucide-react';

// ─── Kategori ikon haritası ───────────────────────────────────
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

const fmt = (v) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);

// ─── Tek bütçe satırı ────────────────────────────────────────
function BudgetRow({ kategori, harcanan, limit }) {
  const [width, setWidth] = useState(0);
  const timerRef = useRef(null);
  const pct = limit > 0 ? (harcanan / limit) * 100 : 0;
  const displayPct = Math.min(pct, 100);

  // Mount'ta animasyonlu dolum
  useEffect(() => {
    timerRef.current = setTimeout(() => setWidth(displayPct), 80);
    return () => clearTimeout(timerRef.current);
  }, [displayPct]);

  // Renk eşikleri
  const barColor =
    pct >= 100 ? '#ef4444' :
    pct >= 80  ? '#f59e0b' :
                 '#10b981';

  const katInfo = KAT_IKONLARI[kategori] || { icon: ShoppingBag, renk: '#94a3b8' };
  const Icon = katInfo.icon;

  return (
    <div className="flex items-center gap-3 py-3">
      {/* İkon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${katInfo.renk}18` }}
      >
        <Icon className="w-4 h-4" style={{ color: katInfo.renk }} />
      </div>

      {/* Orta: isim + progress bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-surface-900 dark:text-white truncate">
            {kategori}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {pct >= 100 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-danger-500/15 text-danger-500 border border-danger-500/30">
                Limit aşıldı!
              </span>
            )}
            {pct >= 80 && pct < 100 && (
              <AlertTriangle className="w-3.5 h-3.5 text-warn-500" />
            )}
            <span className={`text-xs font-semibold ${
              pct >= 100 ? 'text-danger-500' :
              pct >= 80  ? 'text-warn-500' :
                           'text-surface-700 dark:text-surface-200'
            }`}>
              %{Math.round(pct)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${width}%`,
              backgroundColor: barColor,
              boxShadow: `0 0 8px ${barColor}55`,
            }}
          />
        </div>
      </div>

      {/* Sağ: harcanan / limit */}
      <div className="text-right shrink-0 w-28">
        <p className={`text-sm font-bold ${
          pct >= 100 ? 'text-danger-500' :
          pct >= 80  ? 'text-warn-500' :
                       'text-surface-900 dark:text-white'
        }`}>
          {fmt(harcanan)}
        </p>
        <p className="text-xs text-surface-700 dark:text-surface-200">{fmt(limit)}</p>
      </div>
    </div>
  );
}

// ─── Ana BudgetBars bileşeni ──────────────────────────────────
export default function BudgetBars({ harcamalar, limitler }) {
  const satirlar = Object.entries(limitler)
    .map(([kat, limit]) => ({
      kategori: kat,
      harcanan: harcamalar[kat] || 0,
      limit,
      pct: limit > 0 ? ((harcamalar[kat] || 0) / limit) * 100 : 0,
    }))
    .sort((a, b) => b.pct - a.pct); // En yüksek % üstte

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
          Bütçe Limitleri
        </h2>
        <span className="text-xs text-surface-700 dark:text-surface-200 bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-lg">
          Mayıs 2025
        </span>
      </div>
      <p className="text-xs text-surface-700 dark:text-surface-200 mb-4">
        Kategorilere göre aylık harcama takibi
      </p>

      <div className="divide-y divide-surface-100 dark:divide-surface-800">
        {satirlar.map((s) => (
          <BudgetRow key={s.kategori} {...s} />
        ))}
      </div>

      {/* Alt renk göstergesi */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-surface-100 dark:border-surface-800 text-xs text-surface-700 dark:text-surface-200">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-500 inline-block" />
          Normal (%0–79)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-warn-500 inline-block" />
          Uyarı (%80–99)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-danger-500 inline-block" />
          Aşıldı (%100+)
        </span>
      </div>
    </div>
  );
}
