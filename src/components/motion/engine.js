/**
 * FinCoach AI — Motion Engine
 * Paylaşılan IntersectionObserver, rAF döngüsü ve scroll hook'ları.
 * (Bileşenler `./index.jsx` içinde; bu dosya yalnızca yardımcı dışa aktarımlar
 *  barındırır — Fast Refresh uyumluluğu için ayrıldı.)
 */
import { useEffect, useRef, useState } from 'react';

export const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* — Paylaşılan reveal observer — */
let _io = null;
const _ioCallbacks = new WeakMap();

function getObserver() {
  if (_io) return _io;
  _io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const cb = _ioCallbacks.get(entry.target);
        if (cb) cb(entry);
        entry.target.classList.add('is-in');
        _io.unobserve(entry.target);
        _ioCallbacks.delete(entry.target);
      });
    },
    { rootMargin: '0px 0px -4% 0px', threshold: 0.05 },
  );
  return _io;
}

/** Elemanı görünür olduğunda `.is-in` ile işaretler. */
export function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReduced()) { el.classList.add('is-in'); setInView(true); return undefined; }

    if (options.once === false) {
      const io = new IntersectionObserver(
        ([e]) => {
          setInView(e.isIntersecting);
          el.classList.toggle('is-in', e.isIntersecting);
        },
        { rootMargin: '0px 0px -4% 0px', threshold: options.threshold ?? 0.05 },
      );
      io.observe(el);
      return () => io.disconnect();
    }

    const io = getObserver();
    _ioCallbacks.set(el, () => setInView(true));
    io.observe(el);
    return () => { io.unobserve(el); _ioCallbacks.delete(el); };
  }, [options.once, options.threshold]);

  return [ref, inView];
}

/* — Paylaşılan rAF scroll döngüsü — */
const _scrollSubs = new Set();
let _rafId = null;
let _timerId = null;
let _listening = false;

function tick() {
  const vh = window.innerHeight;
  _scrollSubs.forEach((fn) => { try { fn(vh); } catch { /* yoksay */ } });
}

/** rAF ile çalışır; kare akışı kısıtlanmışsa (arka plan sekmesi, güç tasarrufu)
 *  zamanlayıcı yedeği devreye girer — böylece scroll'a bağlı içerik hiçbir
 *  koşulda görünmez kalmaz. */
function flush() {
  if (_rafId != null) { cancelAnimationFrame(_rafId); _rafId = null; }
  if (_timerId != null) { clearTimeout(_timerId); _timerId = null; }
  tick();
}

function schedule() {
  if (_rafId == null) _rafId = requestAnimationFrame(flush);
  if (_timerId == null) _timerId = setTimeout(flush, 120);
}

export function subscribeScroll(fn) {
  _scrollSubs.add(fn);
  if (!_listening) {
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    _listening = true;
  }
  // İlk değeri senkron hesapla: sayfa scroll pozisyonuyla açılsa bile doğru başlar.
  try { fn(window.innerHeight); } catch { /* yoksay */ }
  schedule();
  return () => {
    _scrollSubs.delete(fn);
    if (_scrollSubs.size === 0 && _listening) {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      _listening = false;
    }
  };
}

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);


/** Elemanın viewport içindeki ilerlemesini 0→1 döner. */
export function useScrollProgress(ref, { from = 1, to = -0.2 } = {}) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (prefersReduced()) { setP(0.5); return undefined; }
    return subscribeScroll((vh) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = (from - to) * vh + r.height;
      const done = from * vh - r.top;
      setP(clamp01(done / total));
    });
  }, [ref, from, to]);
  return p;
}

