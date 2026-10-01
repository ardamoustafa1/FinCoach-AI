/**
 * GoalsPage paylaşılan sabitler ve yardımcı fonksiyonlar
 * Tüm hedef componentleri bu dosyadan import eder.
 */
export const IKONLAR = ['✈️', '🚗', '🏠', '💍', '📱', '🎓', '💰', '🏖️', '🎮', '🛋️'];

export const RENKLER = [
  { id: 'violet',  hex: '#C3CBD3', glow: '195,203,211' },
  { id: 'emerald', hex: '#34C08A', glow: '52,192,138' },
  { id: 'fuchsia', hex: '#C0705C', glow: '192,112,92' },
  { id: 'rose',    hex: '#DB5C4E', glow: '219,92,78'  },
  { id: 'amber',   hex: '#D2894F', glow: '210,137,79' },
  { id: 'cyan',    hex: '#45939C', glow: '69,147,156'  },
];

export const KESINTI_KATEGORILERI = [
  { id: 'yemek-siparisi',  ad: 'Yemek Siparişi',  icon: '🍔', aylik: 2400, varsayilan: 50 },
  { id: 'abonelikler',     ad: 'Abonelikler',      icon: '📺', aylik:  680, varsayilan: 25 },
  { id: 'disarida-yemek',  ad: 'Dışarıda Yemek',  icon: '🍽️', aylik: 1800, varsayilan: 20 },
  { id: 'alisveris',       ad: 'Alışveriş',        icon: '🛍️', aylik: 3200, varsayilan:  0 },
  { id: 'eglence',         ad: 'Eğlence',          icon: '🎭', aylik:  920, varsayilan: 15 },
];

export const HAZIR_HEDEFLER = [
  { name: 'Acil Durum Fonu', targetAmount: 100000, currentAmount: 0, deadline: '2026-12-31', icon: '🛡️', color: '#8B949D' },
  { name: 'Tatil Birikimi',  targetAmount:  60000, currentAmount: 0, deadline: '2026-08-15', icon: '✈️', color: '#34C08A' },
  { name: 'Borç Kapatma',    targetAmount:  40000, currentAmount: 0, deadline: '2026-07-01', icon: '✅', color: '#DB5C4E' },
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
