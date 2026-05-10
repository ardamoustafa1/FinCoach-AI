import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const fmt = (v) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function LimitBanner({ asimlar, persistent = false }) {
  const [kapali, setKapali] = useState(false);

  if ((!persistent && kapali) || asimlar.length === 0) return null;

  return (
    <div style={{
      padding: '16px 20px', borderRadius: 16,
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.28)',
      boxShadow: '0 4px 24px rgba(239,68,68,0.12)',
      animation: 'fadeSlideUp 0.4s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#f87171', marginBottom: 8 }}>
              {asimlar.length === 1 ? 'Bütçe limiti aşıldı!' : `${asimlar.length} kategoride limit aşıldı!`}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {asimlar.map(({ kategori, harcanan, limit }) => (
                <span key={kategori} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 99,
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                  fontSize: 12, fontWeight: 700, color: '#F1F5F9',
                }}>
                  {kategori}
                  <span style={{ color: '#f87171', fontWeight: 600 }}>{fmt(harcanan)} / {fmt(limit)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {!persistent && (
          <button onClick={() => setKapali(true)} style={{
            padding: 6, borderRadius: 8,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0,
            transition: 'background 0.15s',
          }}>
            <X size={15} color="#ef4444" />
          </button>
        )}
      </div>
    </div>
  );
}
