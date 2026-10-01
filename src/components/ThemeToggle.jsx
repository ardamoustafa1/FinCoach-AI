import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { P } from '../styles/palette';

export default function ThemeToggle({ theme, onToggle }) {
  const [hov, setHov] = useState(false);
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label={isDark ? 'Açık moda geç' : 'Koyu moda geç'}
      title={isDark ? 'Açık mod' : 'Koyu mod'}
      style={{
        width: 38, height: 38, borderRadius: 999,
        flexShrink: 0, cursor: 'pointer',
        display: 'grid', placeItems: 'center',
        background: hov ? 'rgba(195,203,211,0.10)' : 'transparent',
        border: `1px solid ${hov ? 'rgba(52,192,138,0.45)' : 'var(--border-color)'}`,
        color: hov ? P.green : 'var(--text-secondary)',
        transition: 'all .4s var(--ease-out-expo)',
      }}
    >
      {/* İki ikonluk şerit; sadece biri görünür */}
      <span style={{ display: 'block', width: 16, height: 16, overflow: 'hidden' }}>
        <span style={{
          display: 'block',
          transform: isDark ? 'translateY(0)' : 'translateY(-16px)',
          transition: 'transform .55s var(--ease-out-expo)',
        }}>
          <Moon size={16} strokeWidth={1.8} style={{ display: 'block' }} />
          <Sun size={16} strokeWidth={1.8} style={{ display: 'block' }} />
        </span>
      </span>
    </button>
  );
}
