import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { P } from '../../styles/palette';
import { fmt } from '../../utils/categories';
import { IKONLAR, RENKLER, DAY_MS } from '../../utils/goalHelpers';

export default function GoalModal({ mevcut, onKaydet, onKapat }) {
  const varsayilanTarih = new Date();
  varsayilanTarih.setMonth(varsayilanTarih.getMonth() + 6);

  const [name, setName] = useState(mevcut?.name || '');
  const [targetAmount, setTargetAmount] = useState(mevcut?.targetAmount || '');
  const [currentAmount, setCurrentAmount] = useState(mevcut?.currentAmount || 0);
  const [deadline, setDeadline] = useState(mevcut?.deadline || varsayilanTarih.toISOString().slice(0, 10));
  const [icon, setIcon] = useState(mevcut?.icon || '✈️');
  const [color, setColor] = useState(mevcut?.color || 'violet');

  const kalan = Math.max(0, Number(targetAmount) - Number(currentAmount));
  const kalanGun = Math.ceil((new Date(deadline) - new Date()) / DAY_MS);
  const kalanAy = Math.max(1, Math.ceil(kalanGun / 30));
  const aylik$ = kalan > 0 && kalanGun > 0 ? Math.ceil(kalan / kalanAy) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) return;
    onKaydet({
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      deadline,
      icon,
      color,
    });
  };

  const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: `1px solid ${P.border}`, color: P.text1, fontSize: 14, fontWeight: 600, outline: 'none', transition: 'border-color 0.2s, background 0.2s' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 800, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, padding: '20px', overflowY: 'auto', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(14px)', animation: 'fadeSlideUp 0.2s ease' }} onClick={e => e.target === e.currentTarget && onKapat()}>
      <div style={{ margin: '20px auto', width: '100%', maxWidth: 500, background: 'linear-gradient(160deg, #121417 0%, #0A0B0C 100%)', border: '1px solid rgba(195,203,211,0.32)', borderRadius: 28, overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.85)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 26px', borderBottom: `1px solid ${P.border}`, background: 'rgba(195,203,211,0.08)' }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: P.text1, margin: 0 }}>{mevcut ? 'Hedefi Düzenle' : 'Yeni Hedef Oluştur'}</h3>
          <button onClick={onKapat} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: `1px solid ${P.border}`, color: P.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(219,92,78,0.15)'; e.currentTarget.style.color = '#EC8A7E'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = P.text2; }}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Hedef Adı</label>
            <input type="text" required placeholder="Örn: Tatil Fonu, Yeni Araba" value={name} onChange={e => setName(e.target.value)} style={inputStyle} onFocus={e => { e.currentTarget.style.borderColor = 'rgba(195,203,211,0.55)'; e.currentTarget.style.background = 'rgba(195,203,211,0.06)'; }} onBlur={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Hedef Tutar (₺)</label>
              <input type="number" required min="1" placeholder="10000" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} style={inputStyle} onFocus={e => { e.currentTarget.style.borderColor = 'rgba(195,203,211,0.55)'; e.currentTarget.style.background = 'rgba(195,203,211,0.06)'; }} onBlur={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} />
            </div>
            <div>
              <label style={labelStyle}>Mevcut Birikim (₺)</label>
              <input type="number" min="0" placeholder="0" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} style={inputStyle} onFocus={e => { e.currentTarget.style.borderColor = 'rgba(195,203,211,0.55)'; e.currentTarget.style.background = 'rgba(195,203,211,0.06)'; }} onBlur={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Hedef Tarihi</label>
            <input type="date" required value={deadline} onChange={e => setDeadline(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} onFocus={e => { e.currentTarget.style.borderColor = 'rgba(195,203,211,0.55)'; e.currentTarget.style.background = 'rgba(195,203,211,0.06)'; }} onBlur={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} />
          </div>
          <div>
            <label style={labelStyle}>İkon Seç</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {IKONLAR.map(i => (
                <button key={i} type="button" onClick={() => setIcon(i)} style={{ width: 46, height: 46, borderRadius: 13, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', border: `1px solid ${icon === i ? 'rgba(195,203,211,0.55)' : 'rgba(255,255,255,0.07)'}`, background: icon === i ? 'rgba(195,203,211,0.22)' : 'rgba(255,255,255,0.04)', transform: icon === i ? 'scale(1.1)' : 'none' }}>
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Tema Rengi</label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {RENKLER.map(r => (
                <button key={r.id} type="button" onClick={() => setColor(r.id)} style={{ width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', border: `3px solid ${color === r.id ? 'rgba(255,255,255,0.6)' : 'transparent'}`, transition: 'all 0.15s', background: r.hex, transform: color === r.id ? 'scale(1.2)' : 'none', boxShadow: color === r.id ? `0 0 16px rgba(${r.glow},0.7)` : 'none' }} />
              ))}
            </div>
          </div>
          {aylik$ > 0 && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '16px 18px', borderRadius: 16, background: 'rgba(195,203,211,0.1)', border: '1px solid rgba(195,203,211,0.22)' }}>
              <Sparkles size={18} color="#E4E9ED" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#E4E9ED', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>AI Önerisi</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 }}>
                  Bu hedefe zamanında ulaşmak için her ay <strong style={{ color: '#E4E9ED', fontWeight: 800 }}>{fmt(aylik$)}</strong> biriktirmelisin.
                </p>
              </div>
            </div>
          )}
          <button type="submit" style={{ padding: 16, width: '100%', borderRadius: 16, background: 'linear-gradient(135deg, #C3CBD3 0%, #5C646B 100%)', color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(195,203,211,0.4), inset 0 1px 0 rgba(255,255,255,0.15)', transition: 'transform 0.15s, opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 0.9} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
            {mevcut ? 'Değişiklikleri Kaydet' : 'Hedefi Oluştur ✨'}
          </button>
        </form>
      </div>
    </div>
  );
}
