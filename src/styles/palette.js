/**
 * FinCoach AI — Merkezi Renk Paleti  ·  "Graphite & Platinum"
 * ---------------------------------------------------------------
 * Tasarım yönü: koyu grafit zemin, platin (fırçalanmış metal) marka aksanı,
 * veri için gerçekçi jade / tuğla / çelik / kil tonları.
 * Sarı–altın ve yapay-zekâ klişesi mor–camgöbeği paleti kullanılmaz.
 *
 * Tüm sayfa ve componentler bu dosyadan import eder (single source of truth).
 * Not: Eski anahtar isimleri (purple, gold, cyan...) geriye dönük uyumluluk
 * için korunmuştur; değerleri yeni marka paletine bağlanmıştır.
 */
export const P = {
  /* ── Marka: Platin ── */
  accent:      '#C3CBD3',
  accentLight: '#E4E9ED',
  accentSoft:  '#F1F4F6',
  accentDeep:  '#8B949D',
  accentDim:   'rgba(195,203,211,0.12)',
  accentGlow:  'rgba(195,203,211,0.28)',

  /* Geriye dönük uyum */
  gold:        '#C3CBD3',
  goldLight:   '#E4E9ED',
  goldSoft:    '#F1F4F6',
  goldDeep:    '#8B949D',
  goldDim:     'rgba(195,203,211,0.12)',
  goldGlow:    'rgba(195,203,211,0.28)',
  purple:      '#C3CBD3',
  purpleLight: '#E4E9ED',
  purpleDim:   'rgba(195,203,211,0.12)',
  purpleGlow:  'rgba(195,203,211,0.26)',

  /* ── Semantik / veri ── */
  green:       '#34C08A',   // jade — gelir, olumlu
  greenLight:  '#63D6AA',
  greenDeep:   '#1E8A62',
  red:         '#DB5C4E',   // tuğla — gider, uyarı
  redLight:    '#EC8A7E',
  amber:       '#D2894F',   // kil — dikkat (sarı değil)
  blue:        '#6E93C4',   // çelik — bilgi
  copper:      '#C0705C',
  pink:        '#C0705C',   // eski "pink" anahtarı → bakır (11 yerde kullanılıyordu)
  teal:        '#45939C',
  sage:        '#8FA98C',
  slate:       '#8892A0',
  cyan:        '#45939C',

  /* ── Arkaplan katmanları (CSS değişkenlerine bağlı) ── */
  bg0:  'var(--bg-main)',
  bg1:  'var(--bg-sidebar)',
  bg2:  'var(--bg-surface)',
  bg3:  'var(--bg-surface-soft)',
  bg4:  'var(--bg-surface-soft)',  // yükseltilmiş yüzey (7 yerde kullanılıyordu)
  ink:  'var(--ink)',

  /* ── Kenarlık ── */
  border:      'var(--border-color)',
  borderHover: 'var(--border-hover)',

  /* ── Metin ── */
  text1: 'var(--text-primary)',
  text2: 'var(--text-secondary)',
  text3: 'var(--text-muted)',

  /* ── Yüzey gradyanları ── */
  gradBrand:  'linear-gradient(135deg, #F1F4F6 0%, #C3CBD3 46%, #8B949D 100%)',
  gradInk:    'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))',
  gradMoney:  'linear-gradient(135deg, #63D6AA 0%, #34C08A 100%)',
};

/** Grafik kategori serisi — doygunluğu düşük, "gerçekçi" seri */
export const SERIES = [
  '#34C08A', // jade
  '#6E93C4', // çelik
  '#D2894F', // kil
  '#DB5C4E', // tuğla
  '#45939C', // teal
  '#8FA98C', // adaçayı
  '#C3CBD3', // platin
  '#8892A0', // arduvaz
];

export default P;
