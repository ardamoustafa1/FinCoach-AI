/**
 * StatCard — Dashboard finansal özet kartı (KPI bileşeni).
 * Gelir, gider, bakiye ve hedef sayacı gibi metrikleri
 * animasyonlu sayı ve renk kodlu ikon ile gösterir.
 *
 * @param {{ label: string, value: number, icon: React.ComponentType, color: string, change?: number, isCurrency?: boolean, delay?: number }} props
 */
import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import GlassCard from './GlassCard';
import AnimNumber from './AnimNumber';

const P = {
  text1: 'var(--text-primary)',
  text2: 'var(--text-secondary)',
  text3: 'var(--text-muted)',
  green: '#10B981',
  red: '#EF4444',
};

export default function StatCard({ label, value, icon: Icon, color, change, isCurrency = true, delay = 0 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const isPositive = (change ?? 0) > 0;
  const numVal = Number(value) || 0;

  return (
    <GlassCard
      glow
      style={{
        padding: '22px 24px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(16px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, background 0.3s, border 0.3s, box-shadow 0.3s`,
      }}
    >
      {/* Arka plan degrade */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 100, height: 100, borderRadius: '50%',
        background: color, opacity: 0.08, filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: P.text3, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
            {label}
          </p>
          <p style={{ fontSize: 26, fontWeight: 800, color: P.text1, lineHeight: 1, marginBottom: 8 }}>
            {isCurrency ? (
              <>
                <span style={{ fontSize: 16, fontWeight: 600, color: P.text2, marginRight: 2 }}>₺</span>
                <AnimNumber value={numVal} />
              </>
            ) : (
              <AnimNumber value={numVal} />
            )}
          </p>

          {change !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {isPositive
                ? <ArrowUpRight size={12} color={P.green} />
                : <ArrowDownRight size={12} color={P.red} />}
              <span style={{ fontSize: 12, color: isPositive ? P.green : P.red, fontWeight: 600 }}>
                {Math.abs(change)}% bu ay
              </span>
            </div>
          )}
        </div>

        <div style={{
          width: 46, height: 46, borderRadius: 14,
          background: `${color}22`,
          border: `1px solid ${color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </GlassCard>
  );
}
