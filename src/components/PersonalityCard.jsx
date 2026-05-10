import { useMemo, useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Lightbulb, ChevronDown } from 'lucide-react';
import { kisilikTipiBelirle } from '../utils/spendingPersonality';

export default function PersonalityCard({ islemler }) {
  const [gorunum, setGorunum] = useState(false);
  const [acik, setAcik] = useState(true);

  const tip = useMemo(() => kisilikTipiBelirle(islemler), [islemler]);

  useEffect(() => {
    const t = setTimeout(() => setGorunum(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      borderRadius: 20, padding: '24px 28px',
      background: 'rgba(255,255,255,0.035)',
      border: `1px solid ${tip.renk}28`,
      boxShadow: `0 4px 32px ${tip.glow || tip.renk}18`,
      transition: 'all 0.7s ease',
      opacity: gorunum ? 1 : 0,
      transform: gorunum ? 'none' : 'translateY(16px)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `${tip.renk}12`, filter: 'blur(50px)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 54, height: 54, borderRadius: 18, flexShrink: 0, background: `${tip.renk}20`, border: `1px solid ${tip.renk}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: `0 4px 16px ${tip.renk}30` }}>
            {tip.emoji}
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: tip.renk, marginBottom: 4 }}>Harcama Kişiliğin</p>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{tip.ad}</h3>
          </div>
        </div>
        <button onClick={() => setAcik(!acik)} style={{ padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
          <ChevronDown size={18} color="#94A3B8" style={{ transform: acik ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s ease' }} />
        </button>
      </div>

      {/* Collapsible content */}
      <div style={{ overflow: 'hidden', maxHeight: acik ? '800px' : '0px', transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1)', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 14, color: '#94A3B8', marginTop: 16, lineHeight: 1.75 }}>{tip.aciklama}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
          <div style={{ borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Güçlü Yön</p>
              <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.55 }}>{tip.guclu}</p>
            </div>
          </div>
          <div style={{ borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <AlertTriangle size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Dikkat Et</p>
              <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.55 }}>{tip.dikkat}</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Lightbulb size={15} color={tip.renk} />
            <p style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>Sana Özel Tavsiyeler</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tip.tavsiyeler.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ width: 18, height: 18, borderRadius: 6, background: `${tip.renk}22`, border: `1px solid ${tip.renk}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: tip.renk, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
