import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  LayoutList, LayoutGrid, Search, SlidersHorizontal,
  ChevronUp, ChevronDown, ChevronsUpDown, X,
  Pencil, Trash2, ChevronLeft, ChevronRight, Check, Plus, AlertTriangle, Upload,
  RefreshCw, Receipt, Camera, ImagePlus, Loader2, Mic,
  ArrowUpRight, ArrowDownRight, Calendar,
} from 'lucide-react';
import { TUM_KATEGORILER, fmt } from '../utils/categories';
import { getTransactions, saveTransaction, removeTransaction } from '../utils/storage';
import TransactionModal from '../components/TransactionModal';
import CsvUploader from '../components/CsvUploader';
import SubscriptionsTab from '../components/SubscriptionsTab';
import { detectUnusualSpending, saveUnusualSpendingDecision } from '../utils/notifications';
import { useToast } from '../hooks/useToast';
import { authFetch } from '../utils/api';

/* ─── Palette ─── */
const P = {
  purple: '#7C3AED', purpleLight: '#A78BFA',
  purpleDim: 'rgba(124,58,237,0.15)', purpleGlow: 'rgba(124,58,237,0.25)',
  green: '#10B981', greenDim: 'rgba(16,185,129,0.12)',
  red: '#EF4444', redDim: 'rgba(239,68,68,0.12)',
  amber: '#F59E0B', blue: '#3B82F6', pink: '#EC4899',
  bg0: 'var(--bg-main)', bg1: 'var(--bg-sidebar)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)', bg4: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', borderHover: 'var(--border-hover)',
  text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)',
};

const SAYFA_BOYUTU = 20;

const CAT_COLORS = {
  Market: '#10B981', Ulaşım: '#3B82F6', Fatura: '#F59E0B', Eğlence: '#A855F7',
  Yemek: '#EF4444', 'Yemek Siparişi': '#F97316', Alışveriş: '#EC4899',
  Sağlık: '#06B6D4', Eğitim: '#8B5CF6', Diğer: '#64748B',
};
const CAT_ICONS = {
  Market: '🛒', Ulaşım: '🚌', Fatura: '📄', Eğlence: '🎮',
  Yemek: '🍔', 'Yemek Siparişi': '🛵', Alışveriş: '🛍️',
  Sağlık: '💊', Eğitim: '📚', Diğer: '💳',
};

/* ─── GlowOrb ─── */
function GlowOrb({ color, size = 300, style = {} }) {
  return (
    <div style={{
      position: 'absolute', width: size, height: size, borderRadius: '50%',
      background: color, filter: `blur(${size * 0.42}px)`, opacity: 0.1,
      pointerEvents: 'none', zIndex: 0, ...style,
    }} />
  );
}

/* ─── KatBadge ─── */
function KatBadge({ kategori }) {
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

/* ─── FiltreBadge ─── */
function FiltreBadge({ etiket, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 8,
      background: P.purpleDim, color: P.purpleLight,
      fontSize: 11, fontWeight: 700,
      border: `1px solid rgba(124,58,237,0.3)`,
    }}>
      {etiket}
      <button onClick={onRemove} style={{
        background: 'none', border: 'none', color: 'inherit',
        cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
        opacity: 0.7,
      }}><X size={11} /></button>
    </span>
  );
}

/* ─── KatDropdown ─── */
function KatDropdown({ secili, onChange }) {
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
        <SlidersHorizontal size={14} />
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

/* ─── SortIcon ─── */
function SortIcon({ kolon, aktif, yon }) {
  if (aktif !== kolon) return <ChevronsUpDown size={13} style={{ opacity: 0.3 }} />;
  return yon === 'asc'
    ? <ChevronUp size={13} color={P.purpleLight} />
    : <ChevronDown size={13} color={P.purpleLight} />;
}

/* ─── StatMini ─── */
function StatMini({ label, value, icon, color, delay = 0 }) {
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

/* ─── AksiyonButonlari ─── */
function AksiyonButonlari({ tx, onDuzenle, onSil }) {
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
        title="Düzenle"
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
        title="Sil"
      ><Trash2 size={13} /></button>
    </div>
  );
}

/* ─── TxTableRow ─── */
function TxTableRow({ tx, index, onDuzenle, onSil }) {
  const [hov, setHov] = useState(false);
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), Math.min(index * 35, 600)); return () => clearTimeout(t); }, [index]);
  const isGelir = tx.tur === 'gelir';
  const amtColor = isGelir ? P.green : P.red;
  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderBottom: `1px solid ${P.border}`,
        background: hov ? P.bg3 : 'transparent',
        opacity: vis ? 1 : 0,
        transition: `opacity 0.4s ease ${Math.min(index * 25, 500)}ms, background 0.15s`,
      }}
    >
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
        <div style={{ opacity: hov ? 1 : 0, transition: 'opacity 0.2s', display: 'flex', justifyContent: 'flex-end' }}>
          <AksiyonButonlari tx={tx} onDuzenle={onDuzenle} onSil={onSil} />
        </div>
      </td>
    </tr>
  );
}

/* ─── TxKartRow ─── */
function TxKartRow({ tx, index, onDuzenle, onSil }) {
  const [hov, setHov] = useState(false);
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), Math.min(index * 40, 600)); return () => clearTimeout(t); }, [index]);
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
        animation: vis ? `fadeUp 0.4s ease ${Math.min(index * 30, 500)}ms both` : 'none',
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

/* ─── SilOnay ─── */
function SilOnay({ islem, onOnayla, onIptal }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onIptal()}
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 24,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 380,
        background: P.bg2, border: `1px solid ${P.border}`,
        borderRadius: 22, padding: '28px 28px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'fadeUp 0.25s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: `${P.red}18`, border: `1px solid ${P.red}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} color={P.red} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1 }}>İşlemi Sil</h3>
        </div>
        <p style={{ fontSize: 13, color: P.text2, marginBottom: 12, lineHeight: 1.7 }}>Bu işlemi silmek istediğine emin misin?</p>
        <div style={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: P.text1 }}>{islem.magaza || islem.aciklama}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: P.red }}>-{fmt(islem.tutar)}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onIptal} style={{
            flex: 1, padding: '11px 0', borderRadius: 12, border: `1px solid ${P.border}`,
            background: 'transparent', color: P.text2, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = P.bg3; e.currentTarget.style.color = P.text1; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = P.text2; }}>
            İptal
          </button>
          <button onClick={onOnayla} style={{
            flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
            background: P.red, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
            boxShadow: `0 4px 16px ${P.red}44`, transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Evet, Sil
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── AlışılmadıkModal ─── */
function AlisilmadikHarcamaModal({ alert, onNormal, onReview }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div style={{ width: '100%', maxWidth: 420, background: P.bg2, border: `1px solid ${P.amber}33`, borderRadius: 22, padding: '28px', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', animation: 'fadeUp 0.25s ease' }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: `${P.amber}18`, border: `1px solid ${P.amber}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <AlertTriangle size={22} color={P.amber} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: P.text1, marginBottom: 8 }}>Alışılmadık harcama</h3>
        <p style={{ fontSize: 13, color: P.text2, lineHeight: 1.75, marginBottom: 14 }}>
          Bu harcama sana alışılmadık geliyor{' '}
          <span style={{ fontWeight: 700, color: P.text1 }}>(Ort: {fmt(alert.average)}, Bu: {fmt(alert.amount)})</span>
        </p>
        <div style={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: P.text1 }}>{alert.transaction.magaza || alert.transaction.aciklama}</p>
          <p style={{ fontSize: 11, color: P.text3, marginTop: 3 }}>{alert.transaction.kategori} · {alert.transaction.tarih}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onNormal} style={{ padding: '11px', borderRadius: 12, border: `1px solid ${P.border}`, background: 'transparent', color: P.text2, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = P.bg3; e.currentTarget.style.color = P.text1; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = P.text2; }}>
            Normal, yanlış alarm
          </button>
          <button onClick={onReview} style={{ padding: '11px', borderRadius: 12, border: 'none', background: P.amber, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            İnceleyeceğim
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── FisTaraModal ─── */
function FisTaraModal({ onSonuc, onApiError, onKapat }) {
  const [fileInfo, setFileInfo] = useState(null);
  const [compressed, setCompressed] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);

  const drawAndCompress = (file) => {
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSide = 1600;
        const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
        const width = Math.round(image.width * ratio), height = Math.round(image.height * ratio);
        const canvas = canvasRef.current;
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(image, 0, 0, width, height);
        const shouldCompress = file.size > 1024 * 1024;
        const outputMime = file.type === 'image/png' && !shouldCompress ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputMime, shouldCompress ? 0.7 : 0.92);
        setCompressed({ base64: dataUrl.split(',')[1], mimeType: outputMime });
        setFileInfo({ name: file.name, size: file.size, compressed: shouldCompress });
      };
      image.onerror = () => setError('Görüntü net değil, tekrar dene');
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Lütfen bir fotoğraf seç'); return; }
    drawAndCompress(file);
  };

  const handleAnalyze = async () => {
    if (!compressed) return;
    setLoading(true); setError('');
    try {
      const res = await authFetch('/api/ocr', {
        method: 'POST',
        body: JSON.stringify({ image: compressed.base64, mimeType: compressed.mimeType }),
      });
      if (res.status === 422) { setError('Görüntü net değil, tekrar dene'); return; }
      if (!res.ok) throw new Error('api');
      onSonuc(await res.json());
    } catch { onApiError(); } finally { setLoading(false); }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && !loading && onKapat()}
      style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div style={{ width: '100%', maxWidth: 520, background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 22, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', animation: 'fadeUp 0.25s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${P.border}`, background: P.bg3 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: P.text1 }}>Fiş Tara</h2>
            <p style={{ fontSize: 12, color: P.text3, marginTop: 2 }}>Fotoğrafı seç, FinCoach AI tutar ve tarihi çıkarsın.</p>
          </div>
          <button onClick={onKapat} disabled={loading} style={{ width: 34, height: 34, borderRadius: 10, background: P.bg4, border: `1px solid ${P.border}`, color: P.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
          {/* Drop zone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
            style={{ borderRadius: 16, border: `2px dashed ${P.border}`, background: P.bg3, padding: '28px 20px', textAlign: 'center', cursor: 'pointer' }}
            onClick={() => inputRef.current?.click()}
          >
            <div style={{ width: 48, height: 48, borderRadius: 16, background: `${P.green}18`, border: `1px solid ${P.green}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <ImagePlus size={22} color={P.green} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: P.text1, marginBottom: 4 }}>Fotoğrafı buraya sürükle-bırak</p>
            <p style={{ fontSize: 12, color: P.text3, marginBottom: 16 }}>JPG, PNG veya telefon kamerası fotoğrafı</p>
            <button type="button" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }} style={{ padding: '9px 20px', borderRadius: 11, border: 'none', background: `linear-gradient(135deg, ${P.green}, #059669)`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Fotoğraf Seç
            </button>
          </div>
          <canvas ref={canvasRef} style={{ width: '100%', maxHeight: 260, borderRadius: 14, border: `1px solid ${P.border}`, objectFit: 'contain', display: fileInfo ? 'block' : 'none' }} />
          {fileInfo && (
            <div style={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: P.text3 }}>
              <span style={{ fontWeight: 700, color: P.text1 }}>{fileInfo.name}</span>
              {' '}· {(fileInfo.size / 1024 / 1024).toFixed(2)} MB
              {fileInfo.compressed && <span style={{ color: P.purpleLight, fontWeight: 700 }}> · Sıkıştırıldı</span>}
            </div>
          )}
          {error && (
            <div style={{ borderRadius: 10, border: `1px solid ${P.red}30`, background: `${P.red}12`, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: P.red }}>
              {error}
            </div>
          )}
          <button onClick={handleAnalyze} disabled={!compressed || loading} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '13px 0', borderRadius: 13, border: 'none',
            background: !compressed || loading ? P.bg4 : `linear-gradient(135deg, ${P.green}, #059669)`,
            color: !compressed || loading ? P.text3 : '#fff',
            fontSize: 14, fontWeight: 800, cursor: !compressed || loading ? 'not-allowed' : 'pointer',
            boxShadow: compressed && !loading ? `0 4px 16px ${P.green}40` : 'none',
            transition: 'all 0.2s',
          }}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={16} />}
            {loading ? 'Fiş okunuyor...' : 'Analiz Et'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ─── */
export default function TransactionsPage() {
  const toast = useToast();
  const [ham, setHam] = useState(() => getTransactions().sort((a, b) => (b.tarih || '').localeCompare(a.tarih || '')));
  const [gorunum, setGorunum] = useState('tablo');
  const [sayfa, setSayfa] = useState(1);
  const [sortKolon, setSortKolon] = useState('tarih');
  const [sortYon, setSortYon] = useState('desc');
  const [isListening, setIsListening] = useState(false);
  const [headerVis, setHeaderVis] = useState(false);

  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState(null);
  const [taslakIslem, setTaslakIslem] = useState(null);
  const [silinecek, setSilinecek] = useState(null);
  const [alisilmadik, setAlisilmadik] = useState(null);
  const [csvAcik, setCsvAcik] = useState(false);
  const [fisModalAcik, setFisModalAcik] = useState(false);
  const [aktifTab, setAktifTab] = useState('islemler');

  const [aramaHam, setAramaHam] = useState('');
  const [arama, setArama] = useState('');
  const [seciliKatlar, setSeciliKatlar] = useState([]);
  const [tarihBas, setTarihBas] = useState('');
  const [tarihBit, setTarihBit] = useState('');
  const [minTutar, setMinTutar] = useState('');
  const [maxTutar, setMaxTutar] = useState('');

  useEffect(() => { const t = setTimeout(() => setHeaderVis(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setTimeout(() => setArama(aramaHam), 300); return () => clearTimeout(t); }, [aramaHam]);
  useEffect(() => {
    const t = setTimeout(() => setSayfa(1), 0);
    return () => clearTimeout(t);
  }, [arama, seciliKatlar, tarihBas, tarihBit, minTutar, maxTutar]);

  useEffect(() => {
    const handleTxAdded = () => refreshLocal();
    window.addEventListener('transaction_added', handleTxAdded);
    return () => window.removeEventListener('transaction_added', handleTxAdded);
  }, []);

  const handleSort = useCallback((kolon) => {
    if (sortKolon === kolon) setSortYon(y => y === 'asc' ? 'desc' : 'asc');
    else { setSortKolon(kolon); setSortYon('desc'); }
    setSayfa(1);
  }, [sortKolon]);

  /* ─ Sesle ekleme ─ */
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error('Tarayıcınız ses tanımayı desteklemiyor.'); return; }
    const recognition = new SR();
    recognition.lang = 'tr-TR'; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onstart = () => { setIsListening(true); toast.info('Dinliyorum... Konuşun.', { duration: 5000, icon: '🎤' }); };
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      if (!transcript || transcript.trim() === '') {
        toast.error('Ses algılanamadı, lütfen tekrar deneyin.');
        return;
      }
      toast.info(`Anlaşılan: "${transcript}". Analiz ediliyor...`, { duration: 10000, icon: '🧠' });
      try {
        const res = await authFetch('/api/voice', { method: 'POST', body: JSON.stringify({ text: transcript }) });
        if (!res.ok) {
            const errBody = await res.json().catch(()=>({}));
            throw new Error(errBody.error || 'API Hatası');
        }
        const data = await res.json();
        const yeniIslem = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), tarih: new Date().toISOString().slice(0, 10), tutar: data.tutar || '', magaza: data.magaza || '', aciklama: transcript, kategori: data.kategori || 'Diğer', tur: data.tur || 'gider', not: 'Sesli asistan ile eklendi' };
        if (!yeniIslem.tutar) { toast.warning('Tutar tam anlaşılamadı, formu doldurun.'); setTaslakIslem(yeniIslem); setModalAcik(true); return; }
        await saveTransaction(yeniIslem);
        refreshLocal();
        toast.success(`${yeniIslem.magaza || 'İşlem'} (${fmt(yeniIslem.tutar)}) eklendi! ✨`);
      } catch(err) { toast.error(`Analiz hatası: ${err.message}`); }
    };
    recognition.onerror = (e) => { setIsListening(false); if (e.error !== 'no-speech') toast.error('Mikrofon hatası: ' + e.error); };
    recognition.onend = () => { setIsListening(false); };
    recognition.start();
  };

  /* ─ CRUD ─ */
  const refreshLocal = () => {
    const tx = getTransactions();
    setHam(tx.sort((a, b) => (b.tarih || '').localeCompare(a.tarih || '')));
  };

  const handleKaydet = async (form) => {
    const yeniIslemMi = !duzenlenen;
    const kaydedilen = await saveTransaction({ ...form });
    if (yeniIslemMi) { const u = detectUnusualSpending(kaydedilen, ham); if (u) setAlisilmadik(u); }
    refreshLocal(); setModalAcik(false); setDuzenlenen(null); setTaslakIslem(null);
  };

  const handleFisSonucu = (ocr) => {
    if (!ocr.tutar && !ocr.tarih && !ocr.magaza) { toast.error('Görüntü net değil, tekrar dene'); return; }
    const taslak = { tarih: ocr.tarih || new Date().toISOString().slice(0, 10), tutar: ocr.tutar || '', magaza: ocr.magaza || '', aciklama: ocr.magaza ? `${ocr.magaza} fişi` : 'Fişten eklenen işlem', kategori: '', not: 'Fiş tarama ile eklendi' };
    if (!ocr.tutar) toast.warning('Tutarı bulamadım, lütfen manuel gir'); else toast.success('Fiş okundu!');
    setTaslakIslem(taslak); setDuzenlenen(null); setFisModalAcik(false); setModalAcik(true);
  };

  const handleAlisilmadikSecim = (d) => { if (alisilmadik) saveUnusualSpendingDecision(alisilmadik, d); setAlisilmadik(null); };
  const handleSil = async () => { if (!silinecek) return; await removeTransaction(silinecek.id); refreshLocal(); setSilinecek(null); };
  const handleDuzenle = (tx) => { setDuzenlenen(tx); setModalAcik(true); };
  const handleCsvImport = async (islemler) => { 
    const keyFor = (tx) => tx.duplicateKey || [
      tx.tarih,
      Math.round(Number(tx.tutar || 0) * 100),
      String(tx.magaza || tx.aciklama || '').toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim().slice(0, 48),
      tx.tur || 'gider',
    ].join('|');
    const existingKeys = new Set(getTransactions().map(keyFor));
    let imported = 0;
    let skipped = 0;

    for (const tx of islemler) {
      const key = keyFor(tx);
      if (existingKeys.has(key)) {
        skipped += 1;
        continue;
      }
      await saveTransaction({ ...tx });
      existingKeys.add(key);
      imported += 1;
    }
    refreshLocal(); setCsvAcik(false);
    if (imported > 0) toast.success(`${imported} işlem içe aktarıldı${skipped ? `, ${skipped} tekrar atlandı` : ''}.`);
    else toast.info('Yeni işlem bulunamadı; tekrar kayıtlar atlandı.');
  };

  /* ─ Filtreleme ─ */
  const filtrelenmis = useMemo(() => {
    let liste = ham;
    if (arama) liste = liste.filter(i => (i.magaza || i.aciklama || '').toLowerCase().includes(arama.toLowerCase()));
    if (seciliKatlar.length) liste = liste.filter(i => seciliKatlar.includes(i.kategori));
    if (tarihBas) liste = liste.filter(i => i.tarih >= tarihBas);
    if (tarihBit) liste = liste.filter(i => i.tarih <= tarihBit);
    if (minTutar) liste = liste.filter(i => i.tutar >= Number(minTutar));
    if (maxTutar) liste = liste.filter(i => i.tutar <= Number(maxTutar));
    return [...liste].sort((a, b) => {
      let va = a[sortKolon], vb = b[sortKolon];
      if (sortKolon === 'tutar') { va = Number(va); vb = Number(vb); }
      if (va < vb) return sortYon === 'asc' ? -1 : 1;
      if (va > vb) return sortYon === 'asc' ? 1 : -1;
      return 0;
    });
  }, [ham, arama, seciliKatlar, tarihBas, tarihBit, minTutar, maxTutar, sortKolon, sortYon]);

  const toplamSayfa = Math.max(1, Math.ceil(filtrelenmis.length / SAYFA_BOYUTU));
  const sayfadakiler = filtrelenmis.slice((sayfa - 1) * SAYFA_BOYUTU, sayfa * SAYFA_BOYUTU);

  const totalIncome = ham.filter(t => t.tur === 'gelir').reduce((s, t) => s + Math.abs(Number(t.tutar)), 0);
  const totalExpense = ham.filter(t => t.tur === 'gider').reduce((s, t) => s + Math.abs(Number(t.tutar)), 0);

  const aktifFiltreler = [
    arama && { etiket: `"${arama}"`, temizle: () => { setArama(''); setAramaHam(''); } },
    ...seciliKatlar.map(k => ({ etiket: k, temizle: () => setSeciliKatlar(s => s.filter(x => x !== k)) })),
    tarihBas && { etiket: `Başl: ${tarihBas}`, temizle: () => setTarihBas('') },
    tarihBit && { etiket: `Bitiş: ${tarihBit}`, temizle: () => setTarihBit('') },
    minTutar && { etiket: `Min: ${fmt(minTutar)}`, temizle: () => setMinTutar('') },
    maxTutar && { etiket: `Max: ${fmt(maxTutar)}`, temizle: () => setMaxTutar('') },
  ].filter(Boolean);

  const tumunuTemizle = () => { setAramaHam(''); setArama(''); setSeciliKatlar([]); setTarihBas(''); setTarihBit(''); setMinTutar(''); setMaxTutar(''); };

  const inputStyle = {
    padding: '9px 14px', borderRadius: 12,
    background: P.bg3, border: `1px solid ${P.border}`,
    color: P.text1, fontSize: 13, fontFamily: 'inherit',
    transition: 'all 0.2s', outline: 'none',
  };

  const thStyle = {
    padding: '12px 16px', fontSize: 10, fontWeight: 800,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: P.text3, textAlign: 'left', userSelect: 'none',
  };

  return (
    <>
      <style>{`
        @keyframes gradientShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .tx-input:focus { border-color: rgba(124,58,237,0.5) !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important; }
        .tx-scroll::-webkit-scrollbar { width: 4px; }
        .tx-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius:999px; }
        .tab-btn:hover { color: #A78BFA !important; }
      `}</style>

      <div style={{ minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", position: 'relative', overflow: 'hidden' }}>
        <GlowOrb color={P.purple} style={{ top: -100, left: -100 }} />
        <GlowOrb color={P.blue} style={{ bottom: 0, right: -80 }} size={250} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* ── HERO HEADER ── */}
          <div style={{
            background: P.bg1, border: `1px solid ${P.border}`, borderRadius: 20,
            padding: '24px 28px', position: 'relative', overflow: 'hidden',
            opacity: headerVis ? 1 : 0, transform: headerVis ? 'none' : 'translateY(-12px)',
            transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${P.purple},${P.blue},${P.green},${P.purple})`, backgroundSize: '300% 100%', animation: 'gradientShift 4s ease infinite', borderRadius: '20px 20px 0 0' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: P.text3, marginBottom: 10 }}>Harcama Akışı</p>
                <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', marginBottom: 6, lineHeight: 1 }}>İşlemler</h1>
                <p style={{ fontSize: 13, color: P.text3 }}>{filtrelenmis.length} işlem bulundu · fiş tara, filtrele, düzenle</p>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <button onClick={startListening} style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 12,
                  background: isListening ? P.red : `${P.purple}25`, border: `1px solid ${isListening ? P.red + '50' : P.purple + '40'}`,
                  color: isListening ? '#fff' : P.purpleLight,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  animation: isListening ? 'pulse 1s ease-in-out infinite' : 'none',
                }}>
                  <Mic size={15} />
                  <span>{isListening ? 'Dinleniyor...' : 'Sesle Ekle'}</span>
                </button>
                <button onClick={() => setFisModalAcik(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 12, border: `1px solid ${P.green}40`, background: `${P.green}18`, color: P.green, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = `${P.green}28`}
                  onMouseLeave={e => e.currentTarget.style.background = `${P.green}18`}>
                  <Camera size={15} /> Fiş Tara
                </button>
                <button onClick={() => setCsvAcik(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 12, border: `1px solid ${P.border}`, background: csvAcik ? P.bg4 : P.bg3, color: P.text2, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Upload size={15} /> Ekstre Yükle
                </button>
                <button onClick={() => { setDuzenlenen(null); setTaslakIslem(null); setModalAcik(true); }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${P.purple},#4F46E5)`, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 16px ${P.purpleGlow}`, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  <Plus size={16} /> Yeni İşlem
                </button>
                {/* View toggle */}
                {aktifTab === 'islemler' && (
                  <div style={{ display: 'flex', gap: 3, padding: 4, background: P.bg4, borderRadius: 11, border: `1px solid ${P.border}` }}>
                    {[{ k: 'tablo', icon: LayoutList }, { k: 'kart', icon: LayoutGrid }].map(({ k, icon: Icon }) => (
                      <button key={k} onClick={() => setGorunum(k)} style={{
                        width: 34, height: 34, borderRadius: 8, border: 'none',
                        background: gorunum === k ? P.bg2 : 'transparent',
                        color: gorunum === k ? P.purpleLight : P.text3,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                        boxShadow: gorunum === k ? `0 2px 8px rgba(0,0,0,0.3)` : 'none',
                      }}><Icon size={16} /></button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mini stats */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <StatMini label="Toplam Gelir" value={fmt(totalIncome)} icon="📈" color={P.green} delay={100} />
              <StatMini label="Toplam Gider" value={fmt(totalExpense)} icon="📉" color={P.red} delay={180} />
              <StatMini label="Net Bakiye" value={fmt(totalIncome - totalExpense)} icon="💰" color={P.purple} delay={260} />
              <StatMini label="İşlem Sayısı" value={ham.length} icon="📋" color={P.amber} delay={340} />
            </div>
          </div>

          {/* CSV Uploader */}
          {csvAcik && (
            <CsvUploader onImport={handleCsvImport} onKapat={() => setCsvAcik(false)} />
          )}

          {/* ── TABS ── */}
          <div style={{ display: 'flex', gap: 4, padding: 4, background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 14, width: 'fit-content' }}>
            {[
              { k: 'islemler', label: 'İşlemler', icon: Receipt },
              { k: 'abonelikler', label: 'Abonelikler', icon: RefreshCw },
            ].map(({ k, label, icon: Icon }) => (
              <button key={k} className="tab-btn" onClick={() => setAktifTab(k)} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none',
                background: aktifTab === k ? `linear-gradient(135deg,${P.purple},#4F46E5)` : 'transparent',
                color: aktifTab === k ? '#fff' : P.text3,
                fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: aktifTab === k ? `0 4px 12px ${P.purpleGlow}` : 'none',
              }}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {/* ── ABONELİKLER ── */}
          {aktifTab === 'abonelikler' && <SubscriptionsTab islemler={ham} />}

          {aktifTab === 'islemler' && (<>

            {/* ── FİLTRE PANELİ ── */}
            <div style={{ position: 'relative', zIndex: 10, background: P.bg1, border: `1px solid ${P.border}`, borderRadius: 18, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeUp 0.4s ease 0.15s both' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                  <Search size={15} color={P.text3} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input className="tx-input" type="text" value={aramaHam} onChange={e => setAramaHam(e.target.value)}
                    placeholder="Mağaza veya açıklama ara..."
                    style={{ ...inputStyle, paddingLeft: 38, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <KatDropdown secili={seciliKatlar} onChange={setSeciliKatlar} />
                <input className="tx-input" type="date" value={tarihBas} onChange={e => setTarihBas(e.target.value)} style={inputStyle} title="Başlangıç tarihi" />
                <input className="tx-input" type="date" value={tarihBit} onChange={e => setTarihBit(e.target.value)} style={inputStyle} title="Bitiş tarihi" />
                <input className="tx-input" type="number" value={minTutar} onChange={e => setMinTutar(e.target.value)} placeholder="Min ₺" style={{ ...inputStyle, width: 90 }} />
                <input className="tx-input" type="number" value={maxTutar} onChange={e => setMaxTutar(e.target.value)} placeholder="Max ₺" style={{ ...inputStyle, width: 90 }} />
              </div>
              {aktifFiltreler.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  {aktifFiltreler.map((f, i) => <FiltreBadge key={i} etiket={f.etiket} onRemove={f.temizle} />)}
                  <button onClick={tumunuTemizle} style={{ fontSize: 12, fontWeight: 700, color: P.red, background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4, opacity: 0.8 }}>
                    Tüm Filtreleri Temizle
                  </button>
                </div>
              )}
            </div>

            {/* ── TABLO ── */}
            {gorunum === 'tablo' && (
              <div style={{ background: P.bg1, border: `1px solid ${P.border}`, borderRadius: 20, overflow: 'hidden', animation: 'fadeUp 0.4s ease 0.25s both' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: P.bg3, borderBottom: `1px solid ${P.border}` }}>
                        {[
                          { label: 'Tarih', kolon: 'tarih' },
                          { label: 'Mağaza', kolon: 'magaza' },
                          { label: 'Kategori', kolon: 'kategori' },
                          { label: 'Tutar', kolon: 'tutar' },
                        ].map(({ label, kolon }) => (
                          <th key={kolon} style={thStyle}>
                            <button onClick={() => handleSort(kolon)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', transition: 'color 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.color = P.purpleLight}
                              onMouseLeave={e => e.currentTarget.style.color = ''}>
                              {label} <SortIcon kolon={kolon} aktif={sortKolon} yon={sortYon} />
                            </button>
                          </th>
                        ))}
                        <th style={{ ...thStyle, width: 80 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {sayfadakiler.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '56px 20px', textAlign: 'center', color: P.text3 }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>{ham.length === 0 ? '📥' : '🔍'}</div>
                            <p style={{ fontWeight: 800, color: P.text2, marginBottom: 6 }}>{ham.length === 0 ? 'İlk işlemini ekleyelim' : 'Eşleşen işlem bulunamadı'}</p>
                            <p style={{ fontSize: 13, margin: '0 auto 14px', maxWidth: 460 }}>
                              {ham.length === 0 ? 'CSV ekstre yükle, fiş tara, sesle söyle veya manuel ekle. Yeni hesaplar demo veriyle kirlenmeden tertemiz başlar.' : 'Filtreleri temizleyerek tüm işlemleri tekrar görebilirsin.'}
                            </p>
                            <button onClick={ham.length === 0 ? () => setCsvAcik(true) : tumunuTemizle} style={{ marginTop: 10, padding: '8px 16px', borderRadius: 10, border: 'none', background: P.purpleDim, color: P.purpleLight, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              {ham.length === 0 ? <><Upload size={12} /> CSV Yükle</> : <><RefreshCw size={12} /> Filtreleri Temizle</>}
                            </button>
                          </td>
                        </tr>
                      ) : sayfadakiler.map((tx, i) => (
                        <TxTableRow key={tx.id} tx={tx} index={i} onDuzenle={handleDuzenle} onSil={setSilinecek} />
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Table footer */}
                <div style={{ padding: '12px 20px', borderTop: `1px solid ${P.border}`, background: P.bg3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: P.text3 }}>{filtrelenmis.length} / {ham.length} işlem</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[{ color: P.green, icon: ArrowUpRight, value: fmt(totalIncome) }, { color: P.red, icon: ArrowDownRight, value: fmt(totalExpense) }].map(({ color, icon: Icon, value }) => (
                      <span key={color} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, background: `${color}15`, color, fontSize: 11, fontWeight: 700, border: `1px solid ${color}25` }}>
                        <Icon size={11} />{value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── KART ── */}
            {gorunum === 'kart' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
                {sayfadakiler.length === 0
                  ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '56px 20px', color: P.text3 }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>{ham.length === 0 ? '📥' : '🔍'}</div>
                    <p style={{ fontWeight: 800, color: P.text2, marginBottom: 8 }}>{ham.length === 0 ? 'Veri bekleyen temiz hesap' : 'Eşleşen işlem bulunamadı'}</p>
                    <p style={{ fontSize: 13, maxWidth: 440, margin: '0 auto 16px' }}>{ham.length === 0 ? 'İlk verini CSV, fiş tarama, ses veya manuel kayıtla ekleyebilirsin.' : 'Filtreleri temizleyerek tüm işlemleri tekrar görebilirsin.'}</p>
                    <button onClick={ham.length === 0 ? () => setCsvAcik(true) : tumunuTemizle} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: P.purpleDim, color: P.purpleLight, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>{ham.length === 0 ? 'CSV Yükle' : 'Filtreleri Temizle'}</button>
                  </div>
                  : sayfadakiler.map((tx, i) => <TxKartRow key={tx.id} tx={tx} index={i} onDuzenle={handleDuzenle} onSil={setSilinecek} />)}
              </div>
            )}

            {/* ── SAYFALAMA ── */}
            {toplamSayfa > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <span style={{ fontSize: 12, color: P.text3 }}>{sayfa} / {toplamSayfa} sayfa · {filtrelenmis.length} işlem</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button onClick={() => setSayfa(s => Math.max(1, s - 1))} disabled={sayfa === 1} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.bg3, color: P.text2, fontSize: 12, fontWeight: 600, cursor: sayfa === 1 ? 'not-allowed' : 'pointer', opacity: sayfa === 1 ? 0.4 : 1 }}>
                    <ChevronLeft size={14} /> Önceki
                  </button>
                  {Array.from({ length: Math.min(5, toplamSayfa) }, (_, i) => {
                    let p = i + 1;
                    if (toplamSayfa > 5) { if (sayfa <= 3) p = i + 1; else if (sayfa >= toplamSayfa - 2) p = toplamSayfa - 4 + i; else p = sayfa - 2 + i; }
                    return (
                      <button key={p} onClick={() => setSayfa(p)} style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: sayfa === p ? `linear-gradient(135deg,${P.purple},#4F46E5)` : P.bg3,
                        border: sayfa === p ? 'none' : `1px solid ${P.border}`,
                        color: sayfa === p ? '#fff' : P.text2,
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        boxShadow: sayfa === p ? `0 4px 12px ${P.purpleGlow}` : 'none',
                        transition: 'all 0.2s',
                      }}>{p}</button>
                    );
                  })}
                  <button onClick={() => setSayfa(s => Math.min(toplamSayfa, s + 1))} disabled={sayfa === toplamSayfa} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.bg3, color: P.text2, fontSize: 12, fontWeight: 600, cursor: sayfa === toplamSayfa ? 'not-allowed' : 'pointer', opacity: sayfa === toplamSayfa ? 0.4 : 1 }}>
                    Sonraki <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>)}

          {/* ── MODALS ── */}
          {modalAcik && <TransactionModal islem={duzenlenen} initialValues={taslakIslem} onKaydet={handleKaydet} onKapat={() => { setModalAcik(false); setDuzenlenen(null); setTaslakIslem(null); }} />}
          {fisModalAcik && <FisTaraModal onSonuc={handleFisSonucu} onApiError={() => { toast.error('Fiş okuma çalışmıyor, manuel ekle'); setFisModalAcik(false); setModalAcik(true); }} onKapat={() => setFisModalAcik(false)} />}
          {silinecek && <SilOnay islem={silinecek} onOnayla={handleSil} onIptal={() => setSilinecek(null)} />}
          {alisilmadik && <AlisilmadikHarcamaModal alert={alisilmadik} onNormal={() => handleAlisilmadikSecim('false_alarm')} onReview={() => handleAlisilmadikSecim('review')} />}

        </div>
      </div>
    </>
  );
}
