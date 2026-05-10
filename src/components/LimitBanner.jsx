import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const fmt = (v) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);

export default function LimitBanner({ asimlar }) {
  const [kapali, setKapali] = useState(false);

  if (kapali || asimlar.length === 0) return null;

  return (
    <div className="rounded-2xl border border-danger-500/30 bg-danger-500/8 dark:bg-danger-500/10 p-4 animate-fade-in-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* İkon */}
          <div className="w-9 h-9 rounded-xl bg-danger-500/15 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-danger-500" />
          </div>

          {/* Metinler */}
          <div>
            <p className="text-sm font-semibold text-danger-500 mb-1">
              {asimlar.length === 1
                ? 'Bütçe limiti aşıldı!'
                : `${asimlar.length} kategoride limit aşıldı!`}
            </p>
            <ul className="space-y-0.5">
              {asimlar.map(({ kategori, harcanan, limit }) => (
                <li key={kategori} className="text-sm text-surface-900 dark:text-white">
                  ⚠️{' '}
                  <span className="font-semibold">{kategori}</span> kategorisi
                  limitini aştı!{' '}
                  <span className="text-danger-500 font-bold">
                    ({fmt(harcanan)} / {fmt(limit)})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Kapat butonu */}
        <button
          onClick={() => setKapali(true)}
          className="p-1.5 rounded-lg hover:bg-danger-500/10 transition-colors cursor-pointer shrink-0"
          aria-label="Uyarıyı kapat"
        >
          <X className="w-4 h-4 text-danger-500" />
        </button>
      </div>
    </div>
  );
}
