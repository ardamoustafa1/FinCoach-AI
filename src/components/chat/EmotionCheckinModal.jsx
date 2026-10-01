import { useState } from 'react';
import { HeartPulse, X } from 'lucide-react';

const VALENCE_OPTIONS = [
  { value: 'pozitif',  label: '😊 Pozitif',  color: '#34C08A' },
  { value: 'sakin',   label: '😌 Sakin',    color: '#6E93C4' },
  { value: 'negatif', label: '😟 Negatif',  color: '#D2894F' },
  { value: 'stresli', label: '😤 Stresli',  color: '#DB5C4E' },
];
const CATEGORIES_EC = ['Market', 'Yemek', 'Giyim', 'Eğlence', 'Ulaşım', 'Teknoloji', 'Sağlık', 'Diğer'];

export default function EmotionCheckinModal({ onClose, onSubmit }) {
  const [valence, setValence]   = useState('');
  const [arousal, setArousal]   = useState(5);
  const [amount, setAmount]     = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = () => {
    if (!valence || !amount || !category) return;
    onSubmit({ valence, arousal, amount: Number(amount), category, hour: new Date().getHours() });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(5,7,20,0.92)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{
        width: '100%', maxWidth: 440, background: '#0d0d1a',
        border: '1px solid rgba(195,203,211,0.35)', borderRadius: 24, padding: 32,
        boxShadow: '0 0 60px rgba(195,203,211,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HeartPulse size={20} color="#C0705C" /> Duygu Check-in
          </h2>
          <button aria-label="Duygu check-in penceresini kapat" onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B7075', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Valence */}
        <label style={{ fontSize: 12, fontWeight: 700, color: '#9BA1A6', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>Şu an nasıl hissediyorsun?</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {VALENCE_OPTIONS.map(o => (
            <button key={o.value} onClick={() => setValence(o.value)} style={{
              padding: '10px', borderRadius: 12, border: `1px solid ${valence === o.value ? o.color : 'rgba(255,255,255,0.08)'}`,
              background: valence === o.value ? `${o.color}20` : 'transparent',
              color: valence === o.value ? o.color : '#9BA1A6', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }}>{o.label}</button>
          ))}
        </div>

        {/* Arousal */}
        <label style={{ fontSize: 12, fontWeight: 700, color: '#9BA1A6', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Uyarılmışlık: {arousal}/10</label>
        <input type="range" min={1} max={10} value={arousal} onChange={e => setArousal(Number(e.target.value))}
          style={{ width: '100%', marginBottom: 20, accentColor: '#C3CBD3' }} />

        {/* Amount */}
        <label style={{ fontSize: 12, fontWeight: 700, color: '#9BA1A6', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Harcama tutarı (₺)</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Örn: 450"
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 15, marginBottom: 20, boxSizing: 'border-box' }} />

        {/* Category */}
        <label style={{ fontSize: 12, fontWeight: 700, color: '#9BA1A6', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Kategori</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {CATEGORIES_EC.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              border: `1px solid ${category === c ? '#C3CBD3' : 'rgba(255,255,255,0.1)'}`,
              background: category === c ? 'rgba(195,203,211,0.2)' : 'transparent',
              color: category === c ? '#E4E9ED' : '#6B7075'
            }}>{c}</button>
          ))}
        </div>

        <button onClick={handleSubmit} disabled={!valence || !amount || !category} style={{
          width: '100%', padding: '14px', borderRadius: 14,
          background: (!valence || !amount || !category) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #C3CBD3, #C0705C)',
          border: 'none', color: '#fff', fontSize: 15, fontWeight: 800, cursor: (!valence || !amount || !category) ? 'not-allowed' : 'pointer',
          boxShadow: (!valence || !amount || !category) ? 'none' : '0 8px 24px rgba(195,203,211,0.4)'
        }}>Koçuma Sor</button>
      </div>
    </div>
  );
}
