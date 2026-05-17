/**
 * FinCoach AI — Merkezi Renk Paleti
 * Tüm sayfa ve componentler bu dosyadan import eder.
 * DRY prensibine uygun tek kaynak (single source of truth).
 */
export const P = {
  // Marka renkleri
  purple:      '#7C3AED',
  purpleLight: '#A78BFA',
  purpleDim:   'rgba(124,58,237,0.15)',
  blue:        '#3B82F6',
  green:       '#10B981',
  red:         '#EF4444',
  amber:       '#F59E0B',
  cyan:        '#06B6D4',

  // Arkaplan katmanları (CSS değişkenlerine bağlı)
  bg0:  'var(--bg-main)',
  bg1:  'var(--bg-sidebar)',
  bg2:  'var(--bg-surface)',
  bg3:  'var(--bg-surface-soft)',

  // Kenarlık
  border:      'var(--border-color)',
  borderHover: 'var(--border-hover)',

  // Metin
  text1: 'var(--text-primary)',
  text2: 'var(--text-secondary)',
  text3: 'var(--text-muted)',
};

export default P;
