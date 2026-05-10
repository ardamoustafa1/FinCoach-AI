import { useState, useMemo } from 'react';
import { X } from 'lucide-react';

const fmt = (v) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const GUN_ISIMLERI = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function renk(tutar, maxTutar) {
  if (tutar === 0) return 'bg-surface-100 dark:bg-surface-800';
  const oran = Math.min(tutar / maxTutar, 1);
  if (oran < 0.25) return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';
  if (oran < 0.5) return 'bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200';
  if (oran < 0.75) return 'bg-blue-400 dark:bg-blue-700/60 text-white dark:text-blue-100';
  return 'bg-blue-600 dark:bg-blue-600 text-white';
}

export default function HeatmapCalendar({ islemler }) {
  const [seciliGun, setSeciliGun] = useState(null);

  // Mayıs 2025 takvimi oluştur
  const { gunler, maxTutar } = useMemo(() => {
    const yil = 2025, ay = 5;
    const gunSayisi = new Date(yil, ay, 0).getDate();
    const ilkGunHafta = (new Date(yil, ay - 1, 1).getDay() + 6) % 7; // Pzt=0

    const gunMap = {};
    islemler
      .filter(i => i.tarih.startsWith('2025-05'))
      .forEach(i => {
        const gun = parseInt(i.tarih.split('-')[2], 10);
        gunMap[gun] = (gunMap[gun] || 0) + i.tutar;
      });

    let max = 0;
    const arr = [];
    // Boş hücreler (aybaşı offset)
    for (let i = 0; i < ilkGunHafta; i++) arr.push(null);
    for (let d = 1; d <= gunSayisi; d++) {
      const t = gunMap[d] || 0;
      if (t > max) max = t;
      arr.push({ gun: d, tutar: t });
    }
    return { gunler: arr, maxTutar: max || 1 };
  }, [islemler]);

  const gunIslemleri = useMemo(() => {
    if (!seciliGun) return [];
    const prefix = `2025-05-${String(seciliGun).padStart(2, '0')}`;
    return islemler.filter(i => i.tarih === prefix).sort((a, b) => b.tutar - a.tutar);
  }, [islemler, seciliGun]);

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
        Günlük Harcama Haritası
      </h2>
      <p className="text-xs text-surface-700 dark:text-surface-200 mb-4">Mayıs 2025 · Güne tıklayarak detay görün</p>

      {/* Gün başlıkları */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {GUN_ISIMLERI.map(g => (
          <div key={g} className="text-center text-[10px] font-semibold text-surface-700 dark:text-surface-200 py-1">{g}</div>
        ))}
      </div>

      {/* Takvim grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {gunler.map((g, i) => {
          if (!g) return <div key={`e${i}`} />;
          const cls = renk(g.tutar, maxTutar);
          const isSelected = seciliGun === g.gun;
          return (
            <button
              key={g.gun}
              onClick={() => setSeciliGun(isSelected ? null : g.gun)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs cursor-pointer
                transition-all duration-200 hover:scale-105 hover:shadow-md
                ${cls}
                ${isSelected ? 'ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-surface-900' : ''}`}
            >
              <span className="font-semibold leading-none">{g.gun}</span>
              {g.tutar > 0 && (
                <span className="text-[9px] leading-none mt-0.5 opacity-80">
                  {g.tutar >= 1000 ? `${(g.tutar / 1000).toFixed(1)}k` : Math.round(g.tutar)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Renk skalası */}
      <div className="flex items-center gap-2 mt-4 text-[10px] text-surface-700 dark:text-surface-200">
        <span>Az</span>
        <div className="flex gap-0.5">
          <div className="w-4 h-3 rounded-sm bg-surface-100 dark:bg-surface-800" />
          <div className="w-4 h-3 rounded-sm bg-blue-100 dark:bg-blue-900/40" />
          <div className="w-4 h-3 rounded-sm bg-blue-200 dark:bg-blue-800/50" />
          <div className="w-4 h-3 rounded-sm bg-blue-400 dark:bg-blue-700/60" />
          <div className="w-4 h-3 rounded-sm bg-blue-600 dark:bg-blue-600" />
        </div>
        <span>Çok</span>
      </div>

      {/* Modal – seçili gün detayı */}
      {seciliGun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSeciliGun(null)}>
          <div className="w-full max-w-md bg-white dark:bg-surface-850 rounded-2xl shadow-2xl p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                {seciliGun} Mayıs 2025
              </h3>
              <button onClick={() => setSeciliGun(null)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors cursor-pointer">
                <X className="w-5 h-5 text-surface-700 dark:text-surface-200" />
              </button>
            </div>
            {gunIslemleri.length === 0 ? (
              <p className="text-center text-surface-700 dark:text-surface-200 py-6">Bu gün harcama yok 🎉</p>
            ) : (
              <>
                <p className="text-sm text-surface-700 dark:text-surface-200 mb-3">
                  Toplam: <span className="font-bold text-danger-500">{fmt(gunIslemleri.reduce((s, t) => s + t.tutar, 0))}</span>
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {gunIslemleri.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                      <div>
                        <p className="text-sm font-medium text-surface-900 dark:text-white">{tx.aciklama}</p>
                        <p className="text-xs text-surface-700 dark:text-surface-200">{tx.magaza} · {tx.kategori}</p>
                      </div>
                      <span className="text-sm font-bold text-danger-500">{fmt(tx.tutar)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
