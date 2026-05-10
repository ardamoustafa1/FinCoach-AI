import { useState, useEffect, useRef } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { TUM_KATEGORILER } from '../utils/categories';
import { suggestCategory } from '../utils/storage';

const P = {
  purple: '#7C3AED', purpleLight: '#A78BFA', purpleDim: 'rgba(124,58,237,0.15)',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: '#050714', bg1: '#0D0F1E', bg2: '#141728', bg3: '#1C2038', bg4: '#222540',
  border: 'rgba(255,255,255,0.06)', borderHover: 'rgba(124,58,237,0.35)',
  text1: '#F1F5F9', text2: '#94A3B8', text3: '#64748B',
};

const BOS_FORM = {
  tarih: new Date().toISOString().slice(0, 10),
  tutar: '',
  aciklama: '',
  magaza: '',
  kategori: '',
  not: '',
  etiketler: [],
};

function alan(label, error, children) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: P.text2, marginBottom: 6 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 11, color: P.red, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

export default function TransactionModal({ islem, initialValues, onKaydet, onKapat }) {
  const [form, setForm] = useState(islem
    ? {
        ...BOS_FORM,
        ...islem,
        etiketler: islem.etiketler || [],
        tutar: String(islem.tutar || ''),
      }
    : {
        ...BOS_FORM,
        ...(initialValues || {}),
        etiketler: initialValues?.etiketler || [],
        tutar: initialValues?.tutar ? String(initialValues.tutar) : '',
      }
  );
  const [hatalar, setHatalar] = useState({});
  const [etiketInput, setEtiketInput] = useState('');
  const [kategoriOneri, setKategoriOneri] = useState(null);
  const magazaDebRef = useRef(null);

  useEffect(() => {
    clearTimeout(magazaDebRef.current);
    magazaDebRef.current = setTimeout(() => {
      const oneri = suggestCategory(form.magaza);
      setKategoriOneri(oneri && oneri !== form.kategori ? oneri : null);
    }, 400);
  }, [form.magaza, form.kategori]);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setHatalar(h => ({ ...h, [key]: '' }));
  };

  const validasyonKontrol = () => {
    const h = {};
    if (!form.tarih) h.tarih = 'Tarih zorunlu';
    if (!form.tutar || Number(form.tutar) <= 0) h.tutar = 'Geçerli bir tutar girin';
    if (!form.aciklama.trim()) h.aciklama = 'Açıklama zorunlu';
    setHatalar(h);
    return Object.keys(h).length === 0;
  };

  const handleKaydet = () => {
    if (!validasyonKontrol()) return;
    onKaydet({ ...form, tutar: Number(form.tutar) });
  };

  const handleEtiketEkle = () => {
    const yeniler = etiketInput.split(',')
      .map(e => e.trim()).filter(e => e && !form.etiketler.includes(e));
    if (yeniler.length) set('etiketler', [...form.etiketler, ...yeniler]);
    setEtiketInput('');
  };

  const inputStyle = (key) => ({
    width: '100%', boxSizing: 'border-box',
    padding: '10px 14px', borderRadius: 12,
    background: P.bg3, border: `1px solid ${hatalar[key] ? P.red : P.border}`,
    color: P.text1, fontSize: 13, fontFamily: 'inherit',
    outline: 'none', transition: 'all 0.2s',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
    }} onClick={e => e.target === e.currentTarget && onKapat()}>
      <div style={{
        width: '100%', maxWidth: 460, background: P.bg2, border: `1px solid ${P.border}`,
        borderRadius: 22, display: 'flex', flexDirection: 'column', maxHeight: '90vh',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)', animation: 'fadeUp 0.3s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${P.border}` }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: P.text1 }}>
            {islem ? 'İşlemi Düzenle' : 'Yeni İşlem'}
          </h2>
          <button onClick={onKapat} style={{
            width: 32, height: 32, borderRadius: 10, background: P.bg4, border: `1px solid ${P.border}`,
            color: P.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              {alan('Tarih *', hatalar.tarih,
                <input type="date" value={form.tarih} onChange={e => set('tarih', e.target.value)} style={inputStyle('tarih')} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              {alan('Tutar *', hatalar.tutar,
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: P.text2, fontWeight: 700, fontSize: 14 }}>₺</span>
                  <input type="number" min="0" step="0.01" value={form.tutar}
                    onChange={e => set('tutar', e.target.value.replace(/-/, ''))}
                    placeholder="0" style={{ ...inputStyle('tutar'), paddingLeft: 28 }} />
                </div>
              )}
            </div>
          </div>

          {alan('Mağaza', null,
            <input type="text" value={form.magaza} onChange={e => set('magaza', e.target.value)}
              placeholder="Örn: Migros, Netflix…" style={inputStyle('magaza')} />
          )}

          {kategoriOneri && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: P.purpleDim, border: `1px solid rgba(124,58,237,0.3)`, color: P.purpleLight, fontSize: 12, marginBottom: 16 }}>
              <span>💡 Öneri: <strong>{kategoriOneri}</strong></span>
              <button onClick={() => { set('kategori', kategoriOneri); setKategoriOneri(null); }}
                style={{ marginLeft: 'auto', fontWeight: 700, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>Uygula</button>
              <button onClick={() => setKategoriOneri(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={12} /></button>
            </div>
          )}

          {alan('Açıklama *', hatalar.aciklama,
            <input type="text" value={form.aciklama} onChange={e => set('aciklama', e.target.value)}
              placeholder="Örn: Haftalık market alışverişi" style={inputStyle('aciklama')} />
          )}

          {alan('Kategori', null,
            <select value={form.kategori} onChange={e => set('kategori', e.target.value)} style={inputStyle('kategori')}>
              <option value="">Kategori seçin…</option>
              {TUM_KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          )}

          {alan('Not (opsiyonel)', null,
            <textarea value={form.not} onChange={e => set('not', e.target.value)}
              rows={2} placeholder="Eklemek istediğiniz bir not…"
              style={{ ...inputStyle('not'), resize: 'none' }} />
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: P.text2, marginBottom: 6 }}>
              Etiketler <span style={{ fontWeight: 400, opacity: 0.7 }}>(virgülle ayırın)</span>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" value={etiketInput} onChange={e => setEtiketInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEtiketEkle()}
                placeholder="iş yemeği, geri ödenecek…"
                style={{ ...inputStyle(''), flex: 1 }} />
              <button onClick={handleEtiketEkle} style={{
                padding: '0 14px', borderRadius: 12, background: P.purpleDim, border: `1px solid rgba(124,58,237,0.3)`,
                color: P.purpleLight, cursor: 'pointer',
              }}>
                <Plus size={16} />
              </button>
            </div>
            {form.etiketler.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {form.etiketler.map(e => (
                  <span key={e} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                    borderRadius: 999, background: P.bg4, fontSize: 11, fontWeight: 600, color: P.text1,
                    border: `1px solid ${P.border}`
                  }}>
                    <Tag size={10} color={P.text3} /> {e}
                    <button onClick={() => set('etiketler', form.etiketler.filter(t => t !== e))}
                      style={{ background: 'none', border: 'none', color: P.text3, cursor: 'pointer', marginLeft: 2, padding: 0 }}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, padding: '16px 24px', borderTop: `1px solid ${P.border}`, background: P.bg1, borderRadius: '0 0 22px 22px' }}>
          <button onClick={onKapat} style={{
            flex: 1, padding: '12px 0', borderRadius: 12, border: `1px solid ${P.border}`, background: P.bg3,
            color: P.text2, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            İptal
          </button>
          <button onClick={handleKaydet} style={{
            flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${P.purple}, #4F46E5)`,
            color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 16px ${P.purpleGlow}`, transition: 'all 0.2s',
          }}>
            {islem ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
