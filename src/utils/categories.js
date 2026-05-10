// Kategori renk ve ikon haritası — tüm sayfalar paylaşır
export const KAT_RENKLER = {
  Market:          { bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', dot: '#10b981' },
  'Yemek Siparişi':{ bg: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',   dot: '#f97316' },
  Ulaşım:          { bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',   dot: '#6366f1' },
  Abonelik:        { bg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',   dot: '#a855f7' },
  Fatura:          { bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',         dot: '#3b82f6' },
  Alışveriş:       { bg: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',         dot: '#ec4899' },
  Sağlık:          { bg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',         dot: '#14b8a6' },
  Eğlence:         { bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',      dot: '#f59e0b' },
  Maaş:            { bg: 'bg-green-500/15 text-green-600 dark:text-green-400',      dot: '#22c55e' },
};

export const KAT_FALLBACK = { bg: 'bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200', dot: '#64748b' };

export function katRenk(kategori) {
  return KAT_RENKLER[kategori] || KAT_FALLBACK;
}

export const TUM_KATEGORILER = Object.keys(KAT_RENKLER);

export const fmt = (v) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency', currency: 'TRY',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(v);
