/**
 * GoalsPage paylaşılan sabitler ve yardımcı fonksiyonlar
 * Tüm hedef componentleri bu dosyadan import eder.
 */
export const IKONLAR = ['✈️', '🚗', '🏠', '💍', '📱', '🎓', '💰', '🏖️', '🎮', '🛋️'];

export const RENKLER = [
  { id: 'violet',  hex: '#7c3aed', glow: '124,58,237' },
  { id: 'emerald', hex: '#10b981', glow: '16,185,129' },
  { id: 'fuchsia', hex: '#d946ef', glow: '217,70,239' },
  { id: 'rose',    hex: '#f43f5e', glow: '244,63,94'  },
  { id: 'amber',   hex: '#f59e0b', glow: '245,158,11' },
  { id: 'cyan',    hex: '#06b6d4', glow: '6,182,212'  },
];

export const KESINTI_KATEGORILERI = [
  { id: 'yemek-siparisi',  ad: 'Yemek Siparişi',  icon: '🍔', aylik: 2400, varsayilan: 50 },
  { id: 'abonelikler',     ad: 'Abonelikler',      icon: '📺', aylik:  680, varsayilan: 25 },
  { id: 'disarida-yemek',  ad: 'Dışarıda Yemek',  icon: '🍽️', aylik: 1800, varsayilan: 20 },
  { id: 'alisveris',       ad: 'Alışveriş',        icon: '🛍️', aylik: 3200, varsayilan:  0 },
  { id: 'eglence',         ad: 'Eğlence',          icon: '🎭', aylik:  920, varsayilan: 15 },
];

export const HAZIR_HEDEFLER = [
  { name: 'Acil Durum Fonu', targetAmount: 100000, currentAmount: 0, deadline: '2026-12-31', icon: '🛡️', color: '#6366f1' },
  { name: 'Tatil Birikimi',  targetAmount:  60000, currentAmount: 0, deadline: '2026-08-15', icon: '✈️', color: '#10b981' },
  { name: 'Borç Kapatma',    targetAmount:  40000, currentAmount: 0, deadline: '2026-07-01', icon: '✅', color: '#ef4444' },
];

export const liraFmt = (v) => `${Math.round(v).toLocaleString('tr-TR')}₺`;
export const DAY_MS  = 86_400_000;

export function ayEkle(tarih, ay) {
  const d = new Date(tarih);
  d.setMonth(d.getMonth() + Math.max(0, Math.ceil(ay)));
  return d;
}

export function tarihFmt(t) {
  return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(t);
}
