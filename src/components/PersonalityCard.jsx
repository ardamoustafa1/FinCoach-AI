import { useMemo, useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Lightbulb, ChevronDown } from 'lucide-react';
import { kisilikTipiBelirle } from '../utils/spendingPersonality';

export default function PersonalityCard({ islemler }) {
  const [gorunum, setGorunum] = useState(false);
  const [acik, setAcik] = useState(true);

  const tip = useMemo(() => kisilikTipiBelirle(islemler), [islemler]);

  // Sayfa açılınca 300ms sonra fade-in
  useEffect(() => {
    const t = setTimeout(() => setGorunum(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`
        rounded-2xl border p-6 transition-all duration-700 ease-out
        bg-gradient-to-br ${tip.bg} ${tip.border}
        ${gorunum ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ boxShadow: `0 4px 32px ${tip.glow}22` }}
    >
      {/* ── Başlık satırı ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Emoji balonu */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-lg"
            style={{ background: `${tip.renk}20`, border: `1px solid ${tip.renk}40` }}
          >
            {tip.emoji}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5"
              style={{ color: tip.renk }}>
              Harcama Kişiliğin
            </p>
            <h3 className="text-xl font-extrabold text-surface-900 dark:text-white leading-tight">
              {tip.ad}
            </h3>
          </div>
        </div>

        {/* Aç/Kapa */}
        <button
          onClick={() => setAcik(!acik)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0 mt-1"
        >
          <ChevronDown
            className="w-5 h-5 text-surface-700 dark:text-surface-200 transition-transform duration-300"
            style={{ transform: acik ? 'rotate(0deg)' : 'rotate(-90deg)' }}
          />
        </button>
      </div>

      {/* ── İçerik (açılır/kapanır) ── */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: acik ? '600px' : '0px' }}
      >
        {/* Açıklama */}
        <p className="text-sm text-surface-700 dark:text-surface-200 mt-4 leading-relaxed">
          {tip.aciklama}
        </p>

        {/* Güçlü / Dikkat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div
            className="rounded-xl p-3.5 flex items-start gap-2.5"
            style={{ background: '#10b98112', border: '1px solid #10b98122' }}
          >
            <CheckCircle className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-accent-600 dark:text-accent-400 mb-0.5">Güçlü Yön</p>
              <p className="text-xs text-surface-700 dark:text-surface-200 leading-snug">{tip.guclu}</p>
            </div>
          </div>
          <div
            className="rounded-xl p-3.5 flex items-start gap-2.5"
            style={{ background: '#f59e0b12', border: '1px solid #f59e0b22' }}
          >
            <AlertTriangle className="w-4 h-4 text-warn-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-warn-500 mb-0.5">Dikkat Et</p>
              <p className="text-xs text-surface-700 dark:text-surface-200 leading-snug">{tip.dikkat}</p>
            </div>
          </div>
        </div>

        {/* Tavsiyeler */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4" style={{ color: tip.renk }} />
            <p className="text-sm font-semibold text-surface-900 dark:text-white">
              Sana Özel Tavsiyeler
            </p>
          </div>
          <ul className="space-y-2">
            {tip.tavsiyeler.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-surface-700 dark:text-surface-200
                           rounded-xl px-3.5 py-2.5 bg-white/30 dark:bg-white/5"
              >
                <span className="leading-5">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
