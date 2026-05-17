/**
 * TransactionRow — Son işlemler listesi için tekil işlem satır bileşeni.
 * Stagger animasyonu, hover renk geçişi ve gelir/gider renk kodlamasını içerir.
 *
 * @param {{ tx: import('../../types').Transaction, index: number, onClick?: (tx: any) => void }} props
 */
import { useState, useEffect } from 'react';

const P = {
  bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)',
  text1: 'var(--text-primary)',
  text3: 'var(--text-muted)',
  green: '#10B981',
  red: '#EF4444',
};

const fmt = (v) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(v);

export default function TransactionRow({ tx, index, onClick }) {
  const isIncome = tx.type === 'income' || tx.tur === 'gelir';
  const amount = Math.abs(Number(tx.amount || tx.tutar || 0));
  const color = isIncome ? P.green : P.red;

  const [vis, setVis] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVis(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      onClick={() => onClick?.(tx)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderRadius: 14,
        background: vis ? P.bg3 : 'transparent',
        border: `1px solid ${vis ? P.border : 'transparent'}`,
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : 'translateX(-12px)',
        transition: `all 0.4s ease ${index * 80}ms`,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${color}0D`;
        e.currentTarget.style.borderColor = `${color}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = P.bg3;
        e.currentTarget.style.borderColor = P.border;
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          {isIncome ? '📈' : '📉'}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: P.text1, marginBottom: 2 }}>
            {tx.title || tx.baslik || 'İşlem'}
          </p>
          <p style={{ fontSize: 12, color: P.text3 }}>
            {tx.category || tx.kategori || 'Genel'} · {tx.date || tx.tarih || '—'}
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color }}>
          {isIncome ? '+' : '-'}{fmt(amount)}
        </p>
      </div>
    </div>
  );
}
