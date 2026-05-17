/**
 * AnimNumber — Sayısal değerleri smooth ease-out animasyonuyla render eden bileşen.
 * requestAnimationFrame tabanlı, 4. dereceden ease-out eğrisi kullanır.
 *
 * @param {{ value: number, prefix?: string, suffix?: string, duration?: number }} props
 */
import { useState, useEffect, useRef } from 'react';

export default function AnimNumber({ value, prefix = '', suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Quartic ease-out: değer hedefine hızlı yaklaşır, sonra yavaşlar
      const ease = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(target * ease));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span>
      {prefix}{display.toLocaleString('tr-TR')}{suffix}
    </span>
  );
}
