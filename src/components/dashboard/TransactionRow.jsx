/**
 * TransactionRow — Son işlemler listesi için tekil işlem satırı.
 * Gelir/gider renk kodlaması, hover geçişi ve monospace tutar hizası.
 *
 * @param {{ tx: import('../../types').Transaction, index: number, onClick?: (tx: any) => void }} props
 */
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { P } from '../../styles/palette';

const fmt = (v) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(v);

export default function TransactionRow({ tx, onClick }) {
  const isIncome = tx.type === 'income' || tx.tur === 'gelir';
  const amount = Math.abs(Number(tx.amount || tx.tutar || 0));
  const color = isIncome ? P.green : P.red;
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;

  return (
    <div
      onClick={() => onClick?.(tx)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '11px 14px', borderRadius: 13,
        background: 'transparent',
        border: '1px solid transparent',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background .35s var(--ease-out-expo), border-color .35s ease, transform .35s var(--ease-out-expo)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${color}0D`;
        e.currentTarget.style.borderColor = `${color}2E`;
        e.currentTarget.style.transform = 'translateX(3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 11, flexShrink: 0,
          background: `${color}12`, border: `1px solid ${color}2A`,
          display: 'grid', placeItems: 'center',
        }}>
          <Icon size={15} color={color} strokeWidth={2} />
        </span>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontSize: 13.5, fontWeight: 550, color: 'var(--text-primary)', marginBottom: 3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {tx.title || tx.baslik || tx.aciklama || tx.magaza || 'İşlem'}
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tx.category || tx.kategori || 'Genel'} · {tx.date || tx.tarih || '—'}
          </p>
        </div>
      </div>

      <p className="num" style={{ fontSize: 13.5, color, flexShrink: 0 }}>
        {isIncome ? '+' : '−'}{fmt(amount)}
      </p>
    </div>
  );
}
