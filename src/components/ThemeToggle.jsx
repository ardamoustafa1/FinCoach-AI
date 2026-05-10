import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export default function ThemeToggle({ theme, onToggle }) {
  const [hov, setHov] = useState(false);
  const isDark = theme === 'dark';
  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label={isDark ? 'Açık moda geç' : 'Koyu moda geç'}
      style={{
        position: 'relative', width: 52, height: 30, borderRadius: 10,
        background: isDark ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.08)',
        border: `1px solid ${isDark ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.12)'}`,
        cursor: 'pointer', flexShrink: 0,
        transition: 'all 0.3s ease',
        boxShadow: hov ? '0 0 12px rgba(124,58,237,0.3)' : 'none',
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: isDark ? 24 : 3,
        width: 22, height: 22, borderRadius: 8,
        background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 2px 8px rgba(124,58,237,0.5)',
      }}>
        {isDark
          ? <Moon size={11} color="#fff" />
          : <Sun size={11} color="#fff" />
        }
      </div>
    </button>
  );
}
