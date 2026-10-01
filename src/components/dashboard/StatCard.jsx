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
import { P } from '../../styles/palette';

export default function StatCard({ label, value, icon: Icon, color = P.green, change, isCurrency = true, delay = 0 }) {
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
        padding: '24px 26px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(18px)',
        transition: `opacity .7s var(--ease-out-expo) ${delay}ms, transform .8s var(--ease-out-expo) ${delay}ms, box-shadow .5s ease, border-color .4s ease, background .4s ease`,
      }}
    >
      {/* Yumuşak renk imzası */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 130, height: 130, borderRadius: '50%',
        background: color, opacity: 0.07, filter: 'blur(38px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ minWidth: 0 }}>
          <p className="eyebrow" style={{ fontSize: 9.5, letterSpacing: '0.2em', marginBottom: 14 }}>
            {label}
          </p>

          <p className="num" style={{
            fontSize: 28, fontWeight: 500, color: 'var(--text-primary)',
            lineHeight: 1, marginBottom: 10, letterSpacing: '-0.035em',
          }}>
            {isCurrency && (
              <span style={{ fontSize: 17, color: 'var(--text-muted)', marginRight: 3 }}>₺</span>
            )}
            <AnimNumber value={numVal} />
          </p>

          {change !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {isPositive
                ? <ArrowUpRight size={13} color={P.green} strokeWidth={2.2} />
                : <ArrowDownRight size={13} color={P.red} strokeWidth={2.2} />}
              <span className="num" style={{ fontSize: 12, color: isPositive ? P.green : P.red }}>
                {Math.abs(change)}%
              </span>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>bu ay</span>
            </div>
          )}
        </div>

        <span style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: `${color}14`,
          border: `1px solid ${color}2E`,
          display: 'grid', placeItems: 'center',
        }}>
          {Icon && <Icon size={18} color={color} strokeWidth={1.7} />}
        </span>
      </div>
    </GlassCard>
  );
}
