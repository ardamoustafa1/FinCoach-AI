import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, X, Pencil, Trash2, Check, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { TUM_KATEGORILER, fmt } from '../../utils/categories';

import { P } from '../../styles/palette';
const CAT_COLORS = {
  Market: '#34C08A', Ulaşım: '#6E93C4', Fatura: '#D2894F', Eğlence: '#C7CED5',
  Yemek: '#DB5C4E', 'Yemek Siparişi': '#C0705C', Alışveriş: '#C0705C',
  Sağlık: '#45939C', Eğitim: '#AAB3BB', Diğer: '#6B7075',
};
const CAT_ICONS = {
  Market: '🛒', Ulaşım: '🚌', Fatura: '📄', Eğlence: '🎮',
  Yemek: '🍔', 'Yemek Siparişi': '🛵', Alışveriş: '🛍️',
  Sağlık: '💊', Eğitim: '📚', Diğer: '💳',
};

export function GlowOrb({ color, size = 300, style = {} }) {
  return (
    <div style={{
      position: 'absolute', width: size, height: size, borderRadius: '50%',
      background: color, filter: `blur(${size * 0.42}px)`, opacity: 0.1,
      pointerEvents: 'none', zIndex: 0, ...style,
    }} />
  );
}

export function KatBadge({ kategori }) {
  const color = CAT_COLORS[kategori] || P.text3;
  const icon = CAT_ICONS[kategori] || '💳';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999,
      background: `${color}15`, color,
      fontSize: 11, fontWeight: 700,
      border: `1px solid ${color}25`,
    }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      {kategori || '—'}
    </span>
  );
}

export function FiltreBadge({ etiket, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 8,
      background: P.purpleDim, color: P.purpleLight,
      fontSize: 11, fontWeight: 700,
      border: `1px solid rgba(195,203,211,0.3)`,
    }}>
      {etiket}
      <button aria-label={`${etiket} filtresini kaldır`} onClick={onRemove} style={{
        background: 'none', border: 'none', color: 'inherit',
        cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
        opacity: 0.7,
      }}><X size={11} /></button>
    </span>
  );
}

export function KatDropdown({ secili, onChange }) {
  const [acik, setAcik] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setAcik(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const toggle = (kat) => onChange(secili.includes(kat) ? secili.filter(k => k !== kat) : [...secili, kat]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setAcik(!acik)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 14px', borderRadius: 12,
          background: P.bg3, border: `1px solid ${acik ? P.borderHover : P.border}`,
          color: P.text2, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H3"/><path d="M21 12H3"/><path d="M21 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/></svg>
        Kategori
        {secili.length > 0 && (
          <span style={{
            background: P.purple, color: '#fff',
            fontSize: 10, fontWeight: 800,
            padding: '1px 6px', borderRadius: 999,
          }}>{secili.length}</span>
        )}
        <ChevronDown size={12} style={{ opacity: 0.5 }} />
      </button>
      {acik && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50,
          width: 220,
          background: P.bg2, border: `1px solid ${P.border}`,
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
        }}>
          {TUM_KATEGORILER.map(kat => (
            <button
              key={kat} onClick={() => toggle(kat)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px', background: 'transparent', border: 'none',
                cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = P.bg3}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 16, height: 16, borderRadius: 5, flexShrink: 0,
                border: `2px solid ${secili.includes(kat) ? P.purple : P.text3}`,
                background: secili.includes(kat) ? P.purple : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {secili.includes(kat) && <Check size={10} color="#fff" />}
              </div>
              <KatBadge kategori={kat} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SortIcon({ kolon, aktif, yon }) {
  if (aktif !== kolon) return <ChevronsUpDown size={13} style={{ opacity: 0.3 }} />;
  return yon === 'asc'
    ? <ChevronUp size={13} color={P.purpleLight} />
    : <ChevronDown size={13} color={P.purpleLight} />;
}

export function StatMini({ label, value, icon, color, delay = 0 }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{
      background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 14,
      padding: '14px 18px', flex: 1, minWidth: 130,
      opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(10px)',
      transition: `all 0.5s ease ${delay}ms`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: P.text3, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <p style={{ fontSize: 20, fontWeight: 800, color }}>{value}</p>
    </div>
  );
}

export function AksiyonButonlari({ tx, onDuzenle, onSil }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <button
        onClick={() => onDuzenle(tx)}
        style={{
          width: 30, height: 30, borderRadius: 8,
          background: P.bg3, border: `1px solid ${P.border}`,
          color: P.text3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = P.purpleDim; e.currentTarget.style.color = P.purpleLight; }}
        onMouseLeave={e => { e.currentTarget.style.background = P.bg3; e.currentTarget.style.color = P.text3; }}
        aria-label="İşlemi Düzenle" title="Düzenle"
      ><Pencil size={13} /></button>
      <button
        onClick={() => onSil(tx)}
        style={{
          width: 30, height: 30, borderRadius: 8,
          background: P.bg3, border: `1px solid ${P.border}`,
          color: P.text3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = `${P.red}18`; e.currentTarget.style.color = P.red; }}
        onMouseLeave={e => { e.currentTarget.style.background = P.bg3; e.currentTarget.style.color = P.text3; }}
        aria-label="İşlemi Sil" title="Sil"
      ><Trash2 size={13} /></button>
    </div>
  );
}

export function TxTableRow({ tx, onDuzenle, onSil }) {
  const [hov, setHov] = useState(false);
  const isGelir = tx.tur === 'gelir';
  const amtColor = isGelir ? P.green : P.red;
  return (
    <>
      <td style={{ padding: '13px 16px', fontSize: 12, color: P.text3, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={12} color={P.text3} />
          {tx.tarih}
        </div>
      </td>
      <td style={{ padding: '13px 16px', maxWidth: 240 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: P.text1, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tx.magaza || '—'}
        </p>
        <p style={{ fontSize: 12, color: P.text3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tx.aciklama}
        </p>
      </td>
      <td style={{ padding: '13px 16px' }}><KatBadge kategori={tx.kategori} /></td>
      <td style={{ padding: '13px 16px', textAlign: 'right' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
          {isGelir ? <ArrowUpRight size={13} color={P.green} /> : <ArrowDownRight size={13} color={P.red} />}
          <span style={{ fontSize: 14, fontWeight: 800, color: amtColor, letterSpacing: '-0.01em' }}>
            {isGelir ? '+' : '-'}{fmt(tx.tutar)}
          </span>
        </div>
      </td>
      <td style={{ padding: '13px 16px' }}>
        <div style={{ opacity: hov ? 1 : 0, transition: 'opacity 0.2s', display: 'flex', justifyContent: 'flex-end' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
          <AksiyonButonlari tx={tx} onDuzenle={onDuzenle} onSil={onSil} />
        </div>
      </td>
    </>
  );
}

export function TxKartRow({ tx, onDuzenle, onSil }) {
  const [hov, setHov] = useState(false);
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 10); return () => clearTimeout(t); }, []);
  const isGelir = tx.tur === 'gelir';
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? P.bg4 : P.bg3,
        border: `1px solid ${hov ? P.borderHover : P.border}`,
        borderRadius: 16, padding: '16px 18px',
        transition: 'all 0.25s',
        transform: hov ? 'translateY(-2px)' : 'none',
        opacity: vis ? 1 : 0,
        animation: vis ? `fadeUp 0.4s ease both` : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <KatBadge kategori={tx.kategori} />
        <AksiyonButonlari tx={tx} onDuzenle={onDuzenle} onSil={onSil} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: P.text1, marginBottom: 3 }}>{tx.magaza || '—'}</p>
      <p style={{ fontSize: 12, color: P.text3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.aciklama}</p>
      {tx.etiketler?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {tx.etiketler.map(e => (
            <span key={e} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: P.bg2, color: P.text3, border: `1px solid ${P.border}` }}>{e}</span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${P.border}` }}>
        <span style={{ fontSize: 11, color: P.text3, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={11} /> {tx.tarih}
        </span>
        <span style={{ fontSize: 14, fontWeight: 800, color: isGelir ? P.green : P.red }}>
          {isGelir ? '+' : '-'}{fmt(tx.tutar)}
        </span>
      </div>
    </div>
  );
}
