import { memo, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Calendar, Flame } from 'lucide-react';
import { P } from '../../styles/palette';
import { RENKLER, DAY_MS } from '../../utils/goalHelpers';
import { fmt } from '../../utils/categories';

/**
 * Hedef kartı — aktif veya tamamlanmış tek bir hedefi gösterir.
 * React.memo ile gereksiz re-render'lar engellendi.
 */
const GoalCard = memo(function GoalCard({ hedef, onEdit, onDelete, onQuickAdd, isCompleted = false }) {
  const mevcut  = Number(hedef.currentAmount) || 0;
  const target  = Number(hedef.targetAmount) || 1;
  const pct     = Math.min(100, (mevcut / target) * 100);
  const renk    = RENKLER.find((r) => r.id === hedef.color) || RENKLER[0];
  const kalan   = target - mevcut;
  const kalanGun = Math.ceil((new Date(hedef.deadline) - new Date()) / DAY_MS);
  const kalanAy  = Math.max(1, Math.ceil(kalanGun / 30));
  const aylik$   = kalan > 0 && kalanGun > 0 ? Math.ceil(kalan / kalanAy) : 0;
  const urgent   = !isCompleted && kalanGun > 0 && kalanGun < 30;

  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', borderRadius: 24, padding: 26, background: P.bg2,
        border: `1px solid rgba(${renk.glow}, ${hover ? '0.32' : '0.14'})`,
        overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        transform: hover ? 'translateY(-5px)' : 'none',
        boxShadow: hover ? `0 18px 56px rgba(${renk.glow}, 0.14)` : 'none',
      }}
    >
      {/* Glow orb */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${renk.hex}, transparent)`, pointerEvents: 'none', opacity: hover ? 0.22 : 0.12, transition: 'opacity 0.3s' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 24, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 54, height: 54, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, background: `rgba(${renk.glow}, 0.12)`, border: `1px solid rgba(${renk.glow}, 0.2)` }}>
            {hedef.icon}
          </div>
          <div>
            <p style={{ fontSize: 17, fontWeight: 800, color: P.text1, margin: '0 0 5px', lineHeight: 1.2 }}>{hedef.name}</p>
            {isCompleted ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: P.green, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.22)', padding: '3px 10px', borderRadius: 99 }}>
                <CheckCircle size={10} /> Tamamlandı
              </span>
            ) : (
              <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: P.text3, margin: 0 }}>
                {urgent && <Flame size={12} color="#f59e0b" />}
                <Calendar size={12} /> {kalanGun > 0 ? `${kalanGun} gün kaldı` : 'Süresi doldu'}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons — appear on hover */}
        <div style={{ display: 'flex', gap: 4, opacity: hover ? 1 : 0, transition: 'opacity 0.2s' }}>
          {!isCompleted && onQuickAdd && (
            <button
              onClick={() => onQuickAdd(hedef.id, 500)}
              title="500₺ Hızlı Ekle"
              style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.25)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Plus size={14} />
            </button>
          )}
          <button onClick={onEdit} title="Düzenle" style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: `1px solid ${P.border}`, color: P.text2, cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.18)'; e.currentTarget.style.color = '#c4b5fd'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = P.text2; }}>
            <Edit2 size={14} />
          </button>
          <button onClick={onDelete} title="Sil" style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: `1px solid ${P.border}`, color: P.text2, cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.15)'; e.currentTarget.style.color = '#f87171'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = P.text2; }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, marginBottom: 8, position: 'relative', zIndex: 1 }}>
        <span style={{ color: P.text1 }}>{fmt(mevcut)}</span>
        <span style={{ color: P.text3 }}>{fmt(target)}</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <div style={{ height: '100%', borderRadius: 99, transition: 'width 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)', width: `${pct}%`, background: `linear-gradient(90deg, ${renk.hex}cc, ${renk.hex})`, boxShadow: `0 0 10px rgba(${renk.glow},0.55)` }} />
      </div>
      <p style={{ fontSize: 11, fontWeight: 600, color: P.text3, marginTop: 6, position: 'relative', zIndex: 1 }}>{Math.round(pct)}% tamamlandı</p>

      {/* Footer */}
      {!isCompleted && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: `1px solid ${P.border}`, position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 12, color: P.text3 }}>Kalan: <strong style={{ color: '#fff', fontWeight: 700 }}>{fmt(kalan)}</strong></span>
          {aylik$ > 0 && (
            <span style={{ fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 8, background: `rgba(${renk.glow}, 0.12)`, color: renk.hex, border: `1px solid rgba(${renk.glow}, 0.25)` }}>
              Bu ay: {fmt(aylik$)}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

export default GoalCard;
