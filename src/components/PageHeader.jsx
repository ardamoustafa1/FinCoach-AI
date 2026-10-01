/**
 * PageHeader — Tüm sayfalarda ortak, sinematik sayfa başlığı.
 *
 * Kullanım (değişmedi):
 *   <PageHeader icon={<Calculator size={24} />} color="#34C08A"
 *     title="Vergi Asistanı" subtitle="Yasal kesintilerinizi hesaplayın" badge="AI Destekli" />
 */
import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { P } from '../styles/palette';

/** Başlığı kelime kelime akıtan yardımcı. */
function TitleReveal({ text, color }) {
  const words = String(text || '').split(' ');
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <span aria-label={text}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="split-word" aria-hidden="true">
          <span
            style={{
              '--w-delay': `${i * 68}ms`,
              transform: on ? 'translateY(0)' : 'translateY(112%)',
              opacity: on ? 1 : 0,
              ...(i === words.length - 1 && words.length > 1 ? { color } : null),
            }}
          >
            {w}{i < words.length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </span>
  );
}

export default function PageHeader({ icon, color = P.green, title, subtitle, badge, children }) {
  const [hov, setHov] = useState(false);
  const ref = useRef(null);

  const openTour = () => {
    window.dispatchEvent(new CustomEvent('fincoach:open-tour'));
  };

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="spotlight"
      style={{
        position: 'relative',
        padding: '40px 0 26px',
        isolation: 'isolate',
        overflow: 'hidden',
      }}
    >
      {/* Sinematik zemin */}
      <div
        aria-hidden="true"
        className="aurora"
        style={{
          width: 460, height: 460, top: -260, left: -140,
          background: `${color}22`, filter: 'blur(80px)',
          '--aurora-duration': '20s',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '58px 58px',
          color: 'var(--text-primary)',
          opacity: 0.035,
          maskImage: 'radial-gradient(ellipse 70% 130% at 12% 0%, #000 10%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 130% at 12% 0%, #000 10%, transparent 72%)',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
        {/* Sol: ikon + metin */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, minWidth: 0 }}>
          <span
            style={{
              width: 52, height: 52, borderRadius: 15, flexShrink: 0,
              background: `${color}14`, border: `1px solid ${color}30`,
              display: 'grid', placeItems: 'center', color,
              boxShadow: `0 12px 32px ${color}1A`,
              animation: 'fade-in-up .8s var(--ease-out-expo) both',
            }}
          >
            {icon}
          </span>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1
                className="display"
                style={{ fontSize: 'clamp(27px, 3.1vw, 40px)', color: 'var(--text-primary)', lineHeight: 1.06 }}
              >
                <TitleReveal text={title} color={color} />
              </h1>
              {badge && (
                <span
                  className="eyebrow"
                  style={{
                    fontSize: 9, letterSpacing: '0.18em', color,
                    background: `${color}14`, border: `1px solid ${color}30`,
                    padding: '4px 10px', borderRadius: 99,
                    animation: 'fade-in-up .8s var(--ease-out-expo) .35s both',
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p
                style={{
                  fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 640,
                  animation: 'fade-in-up .9s var(--ease-out-expo) .28s both',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Sağ: aksiyonlar + tanıtım */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
            animation: 'fade-in-up .8s var(--ease-out-expo) .18s both',
          }}
        >
          {children}
          <button
            onClick={openTour}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            title="Tanıtımı tekrar göster"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 14px', borderRadius: 99,
              background: hov ? `${color}14` : 'transparent',
              border: `1px solid ${hov ? `${color}55` : 'var(--border-color)'}`,
              color: hov ? color : 'var(--text-muted)',
              fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all .4s var(--ease-out-expo)',
            }}
          >
            <Sparkles size={13} style={{ flexShrink: 0 }} />
            Tanıtım
          </button>
        </div>
      </div>

      {/* Soldan sağa çizilen ayırıcı */}
      <div style={{ marginTop: 26, height: 1, background: 'var(--hairline)', overflow: 'hidden' }}>
        <div
          className="fill-bar"
          style={{
            height: '100%', width: '100%',
            background: `linear-gradient(90deg, ${color}, ${color}22 34%, transparent 72%)`,
          }}
        />
      </div>
    </div>
  );
}

/** Sayfa özetlerinde kullanılan tekrar kullanılabilir istatistik kartı */
export function StatCard({ label, value, sub, color = P.green, icon }) {
  return (
    <div
      className="glass-card spotlight"
      style={{ padding: '22px 24px' }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
    >
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 120, height: 120,
        background: color, opacity: 0.07, filter: 'blur(38px)', pointerEvents: 'none', borderRadius: '50%',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
        <div style={{ minWidth: 0 }}>
          <p className="eyebrow" style={{ fontSize: 9.5, letterSpacing: '0.2em', marginBottom: 12 }}>{label}</p>
          <p className="num kpi-underline" style={{ fontSize: 26, color, marginBottom: 10, lineHeight: 1, display: 'inline-block' }}>{value}</p>
          {sub && <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{sub}</p>}
        </div>
        {icon && (
          <span style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: `${color}14`, border: `1px solid ${color}30`,
            display: 'grid', placeItems: 'center', color,
          }}>
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}

/** Ortak yükleme göstergesi */
export function PageLoader({ message = 'Yükleniyor...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 18 }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '2px solid rgba(195,203,211,0.14)', borderTopColor: P.green,
        animation: 'spin .9s linear infinite',
      }} />
      <p className="eyebrow" style={{ fontSize: 9.5 }}>{message}</p>
    </div>
  );
}

/** Ortak bölüm başlığı */
export function SectionTitle({ children, color = P.green }) {
  return (
    <h2 style={{
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: 'var(--font-sans)',
      fontSize: 10.5, fontWeight: 600, letterSpacing: '0.22em',
      textTransform: 'uppercase', color: 'var(--text-muted)',
      margin: '0 0 18px',
    }}>
      <span style={{ width: 18, height: 1, background: color, display: 'inline-block' }} />
      {children}
    </h2>
  );
}
