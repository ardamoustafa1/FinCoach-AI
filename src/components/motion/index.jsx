/**
 * FinCoach AI — Motion Primitives
 * ────────────────────────────────────────────────────────────────
 * Sıfır bağımlılıklı, yüksek performanslı scroll animasyon motoru.
 *  · Tek bir paylaşılan IntersectionObserver  → reveal
 *  · Tek bir paylaşılan rAF döngüsü            → parallax / scroll-linked
 *  · prefers-reduced-motion tam desteği
 */
import {
  useEffect, useRef, useState, useCallback, useMemo, createElement,
} from 'react';
import { useInView, subscribeScroll, prefersReduced, clamp01 } from './engine';

/* ═══════════════ Reveal ═══════════════ */

/**
 * Görünür alana girince açılan sarmalayıcı.
 * variant: up | down | left | right | scale | blur | rise | tilt | curtain | fade
 */
export function Reveal({
  children,
  variant = 'up',
  delay = 0,
  as = 'div',
  className = '',
  style,
  once = true,
  ...rest
}) {
  const [ref] = useInView({ once });
  return createElement(
    as,
    {
      ref,
      'data-reveal': variant,
      className,
      style: { '--reveal-delay': `${delay}ms`, ...style },
      ...rest,
    },
    children,
  );
}

/** Çocuklarını sırayla açan kap. */
export function Stagger({ children, step = 90, variant = 'up', start = 0, className, style, ...rest }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div className={className} style={style} {...rest}>
      {items.filter(Boolean).map((child, i) => (
        <Reveal key={i} variant={variant} delay={start + i * step}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}

/* ═══════════════ Tipografi hareketi ═══════════════ */

/** Kelimeleri alttan yukarı akıtarak açar. */
export function SplitWords({
  text,
  className = '',
  style,
  step = 55,
  delay = 0,
  as = 'span',
  highlight = [],
  highlightColor = 'var(--jade)',
}) {
  const [ref] = useInView();
  const words = String(text).split(' ');
  return createElement(
    as,
    { ref, className: `${className}`, style },
    words.map((w, i) => (
      <span className="split-word" key={`${w}-${i}`}>
        <span
          style={{
            '--w-delay': `${delay + i * step}ms`,
            ...(highlight.includes(i)
              ? { color: highlightColor, fontWeight: 300 }
              : null),
          }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      </span>
    )),
  );
}

/**
 * Scroll ilerlemesine bağlı olarak harf harf aydınlanan paragraf.
 * Uzun manifesto cümleleri için.
 */
export function ScrollLitText({ text, className = '', style, dim = 0.42 }) {
  const ref = useRef(null);
  const words = useMemo(() => String(text).split(' '), [text]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (prefersReduced()) { setProgress(1); return undefined; }
    return subscribeScroll((vh) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // Metin ekranın %78'inden %28'ine yolculuk ederken aydınlanır
      const p = clamp01((vh * 0.82 - r.top) / (r.height + vh * 0.46));
      setProgress(p);
    });
  }, []);

  const lit = progress * words.length;

  return (
    <p ref={ref} className={className} style={style}>
      {words.map((w, i) => {
        const local = clamp01(lit - i);
        return (
          <span
            key={i}
            style={{
              opacity: dim + (1 - dim) * local,
              transition: 'opacity .25s linear',
            }}
          >
            {w}{i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </p>
  );
}

/* ═══════════════ Parallax & scroll-linked ═══════════════ */

/** Scroll'a göre dikey öteleme. speed>0 yavaş, <0 hızlı akar. */
export function Parallax({ children, speed = 0.18, className = '', style, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    if (prefersReduced()) return undefined;
    return subscribeScroll((vh) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-center * speed).toFixed(2)}px, 0)`;
    });
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform', ...style }} {...rest}>
      {children}
    </div>
  );
}

/** Sticky sahne: içeri girildiğinde 0→1 ilerleme veren render-prop. */
export function StickyScene({ height = '320vh', children, className = '', style }) {
  const wrapRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (prefersReduced()) { setProgress(0.5); return undefined; }
    return subscribeScroll((vh) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const travel = r.height - vh;
      setProgress(travel > 0 ? clamp01(-r.top / travel) : 0);
    });
  }, []);

  return (
    <section ref={wrapRef} className={className} style={{ position: 'relative', height, ...style }}>
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {typeof children === 'function' ? children(progress) : children}
      </div>
    </section>
  );
}

/** Sayfanın üstünde altın scroll ilerleme çizgisi. */
export function ScrollProgressBar({ height = 2 }) {
  const ref = useRef(null);
  useEffect(() => subscribeScroll(() => {
    const el = ref.current;
    if (!el) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    el.style.transform = `scaleX(${max > 0 ? doc.scrollTop / max : 0})`;
  }), []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height,
      zIndex: 1000, pointerEvents: 'none',
    }}>
      <div
        ref={ref}
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, #8B949D, #F1F4F6 45%, #C3CBD3)',
          transform: 'scaleX(0)',
          transformOrigin: '0 50%',
          willChange: 'transform',
        }}
      />
    </div>
  );
}

/* ═══════════════ Sayı sayacı ═══════════════ */

export function Counter({
  to,
  from = 0,
  duration = 1900,
  decimals = 0,
  prefix = '',
  suffix = '',
  locale = 'tr-TR',
  className = '',
  style,
}) {
  const [ref, inView] = useInView();
  const [val, setVal] = useState(from);

  useEffect(() => {
    if (!inView) return undefined;
    if (prefersReduced()) { setVal(to); return undefined; }
    let raf;
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      setVal(from + (to - from) * ease(t));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    // Emniyet: kare akışı durdurulursa (arka plan sekmesi, güç tasarrufu)
    // sayaç yarıda kalmasın — süre dolunca kesin değere sabitlenir.
    const settle = setTimeout(() => setVal(to), duration + 400);
    return () => { cancelAnimationFrame(raf); clearTimeout(settle); };
  }, [inView, to, from, duration]);

  const text = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);

  return (
    <span ref={ref} className={`num ${className}`} style={style}>
      {prefix}{text}{suffix}
    </span>
  );
}

/* ═══════════════ Etkileşim ═══════════════ */

/** İmleci manyetik olarak takip eden sarmalayıcı. */
export function Magnetic({ children, strength = 0.32, radius = 90, className = '', style, ...rest }) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
  }, [strength]);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = 'translate3d(0,0,0)';
  }, []);

  return (
    <span
      className={`magnetic ${className}`}
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ display: 'inline-flex', padding: radius ? 0 : 0, ...style }}
      {...rest}
    >
      {children}
    </span>
  );
}

/** 3B eğilen kart + imleç spot ışığı. */
export function Tilt({
  children,
  max = 8,
  className = '',
  style,
  glare = true,
  scale = 1.012,
  ...rest
}) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform =
      `perspective(1100px) rotateX(${(0.5 - py) * max * 2}deg) rotateY(${(px - 0.5) * max * 2}deg) scale(${scale})`;
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  }, [max, scale]);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(1100px) rotateX(0) rotateY(0) scale(1)';
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`${glare ? 'spotlight ' : ''}${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform .6s var(--ease-out-expo)',
        willChange: 'transform',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** İmleç spot ışığı (eğilme yok). */
export function Spotlight({ children, className = '', style, ...rest }) {
  const onMove = useCallback((e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  }, []);

  return (
    <div onMouseMove={onMove} className={`spotlight ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
}

/* ═══════════════ Marquee ═══════════════ */

export function Marquee({ children, duration = 42, reverse = false, className = '', style }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div className={`marquee-mask ${className}`} style={style}>
      <div
        className={`marquee${reverse ? ' marquee-reverse' : ''}`}
        style={{ '--marquee-duration': `${duration}s` }}
      >
        {[0, 1].map((dup) => (
          <div key={dup} style={{ display: 'flex', alignItems: 'center' }} aria-hidden={dup === 1}>
            {items}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ Dekoratif ═══════════════ */

/** Yumuşak, sürüklenen ışık kümesi. */
export function Aurora({ color = 'rgba(195,203,211,0.28)', size = 520, top, left, right, bottom, duration = 18, delay = 0 }) {
  return (
    <div
      className="aurora"
      aria-hidden="true"
      style={{
        width: size, height: size, background: color,
        top, left, right, bottom,
        '--aurora-duration': `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

/** İnce çizgi ızgara — mimari altlık. */
export function GridLines({ opacity = 0.05, size = 78, fade = true }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage:
          `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        color: 'var(--text-primary)',
        opacity,
        maskImage: fade ? 'radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 78%)' : undefined,
        WebkitMaskImage: fade ? 'radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 78%)' : undefined,
      }}
    />
  );
}

export default Reveal;
