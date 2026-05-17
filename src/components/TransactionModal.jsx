import { useState, useEffect, useRef } from 'react';
import { X, Plus, Tag, Mic, Loader2, Fingerprint, ShieldAlert } from 'lucide-react';
import { TUM_KATEGORILER } from '../utils/categories';
import useStore from '../store/useStore';
import { authFetch } from '../utils/api';
import { useToast } from '../hooks/useToast';

import { P } from '../styles/palette';
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
  const toast = useToast();
  const [etiketInput, setEtiketInput] = useState('');
  const [kategoriOneri, setKategoriOneri] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [showImpulseBlock, setShowImpulseBlock] = useState(false);
  const [webAuthnLoading, setWebAuthnLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const triggerShake = () => { setShake(false); setTimeout(() => setShake(true), 10); setTimeout(() => setShake(false), 400); };
  const magazaDebRef = useRef(null);

  const startVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Tarayıcınız sesli komut özelliğini desteklemiyor.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.interimResults = false;
    
    recognition.onstart = () => { setIsListening(true); toast.info('Dinliyorum...'); };
    recognition.onend = () => { setIsListening(false); };
    recognition.onerror = () => { setIsListening(false); toast.error('Ses algılanamadı.'); };
    
    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setIsProcessingVoice(true);
      toast.info('Ses analiz ediliyor: ' + text);
      try {
        const res = await authFetch('/api/voice', { method: 'POST', body: JSON.stringify({ text }) });
        const data = await res.json();
        
        if (data && data.tutar) {
           setForm(f => ({ ...f, tutar: String(data.tutar), aciklama: data.magaza || data.aciklama || text, magaza: data.magaza || '', kategori: data.kategori || '' }));
           toast.success('Harcama sesli komutla dolduruldu! 🎉');
        } else {
           toast.warning('Anlaşılamadı, lütfen manuel doldurun.');
        }
      } catch {
        toast.error('Yapay zeka ses analizinde hata oluştu.');
      } finally {
        setIsProcessingVoice(false);
      }
    };
    recognition.start();
  };

  useEffect(() => {
    clearTimeout(magazaDebRef.current);
    magazaDebRef.current = setTimeout(() => {
      const oneri = useStore.getState().suggestCategory(form.magaza);
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
    const isValid = Object.keys(h).length === 0;
    if (!isValid) triggerShake();
    return isValid;
  };

  const executeSave = () => {
    onKaydet({ ...form, tutar: Number(form.tutar) });
  };

  const handleKaydet = () => {
    if (!validasyonKontrol()) return;

    // Düzenleme değilse ve yeni işlemse Anti-Dürtü kontrolü yap
    if (!islem) {
      const currentHour = new Date().getHours();
      const isNightTime = currentHour >= 0 && currentHour <= 6;
      const isToxicCategory = ['Alışveriş', 'Dışarıda Yemek', 'Kozmetik', 'Teknoloji'].includes(form.kategori);

      if (isNightTime || (isToxicCategory && Number(form.tutar) > 1000)) {
        setShowImpulseBlock(true);
        return;
      }
    }
    executeSave();
  };

  const handleWebAuthn = () => {
    setWebAuthnLoading(true);
    // Simulating WebAuthn (TouchID/FaceID) prompt
    setTimeout(() => {
      setWebAuthnLoading(false);
      setShowImpulseBlock(false);
      toast.info('Biyometrik doğrulama başarılı. Sorumluluk sana ait!');
      executeSave();
    }, 1500);
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
      <div className={shake ? 'shake' : ''} style={{
        width: '100%', maxWidth: 460, background: P.bg2, border: `1px solid ${P.border}`,
        borderRadius: 22, display: 'flex', flexDirection: 'column', maxHeight: '90vh',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)', animation: 'fadeUp 0.3s ease',
      }}>
        <style>{`@keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); } 20%, 40%, 60%, 80% { transform: translateX(4px); } } .shake { animation: shake 0.4s ease-in-out !important; }`}</style>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${P.border}` }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: P.text1 }}>
            {islem ? 'İşlemi Düzenle' : 'Yeni İşlem'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button aria-label="Sesli komut ile doldur" onClick={startVoiceRecording} disabled={isListening || isProcessingVoice} style={{
              width: 32, height: 32, borderRadius: 10, background: isListening ? '#10B981' : isProcessingVoice ? '#F59E0B' : 'rgba(124,58,237,0.15)',
              border: `1px solid ${isListening ? '#10B981' : isProcessingVoice ? '#F59E0B' : 'rgba(124,58,237,0.3)'}`, color: (isListening || isProcessingVoice) ? '#fff' : P.purpleLight, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', animation: isListening ? 'pulse 1.5s infinite' : 'none'
            }}>
              <style>{`@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }`}</style>
              {isProcessingVoice ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Mic size={16} />}
            </button>
            <button aria-label="Kapat" onClick={onKapat} style={{
              width: 32, height: 32, borderRadius: 10, background: P.bg4, border: `1px solid ${P.border}`,
              color: P.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              {alan('Tarih *', hatalar.tarih,
                <input type="date" aria-label="Tarih" value={form.tarih} onChange={e => set('tarih', e.target.value)} style={inputStyle('tarih')} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              {alan('Tutar *', hatalar.tutar,
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: P.text2, fontWeight: 700, fontSize: 14 }}>₺</span>
                  <input type="number" aria-label="Tutar" min="0" step="0.01" value={form.tutar}
                    onChange={e => set('tutar', e.target.value.replace(/-/, ''))}
                    placeholder="0" style={{ ...inputStyle('tutar'), paddingLeft: 28 }} />
                </div>
              )}
            </div>
          </div>

          {alan('Mağaza', null,
            <input type="text" aria-label="Mağaza" value={form.magaza} onChange={e => set('magaza', e.target.value)}
              placeholder="Örn: Migros, Netflix…" style={inputStyle('magaza')} />
          )}

          {kategoriOneri && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: P.purpleDim, border: `1px solid rgba(124,58,237,0.3)`, color: P.purpleLight, fontSize: 12, marginBottom: 16 }}>
              <span>💡 Öneri: <strong>{kategoriOneri}</strong></span>
              <button onClick={() => { set('kategori', kategoriOneri); setKategoriOneri(null); }}
                style={{ marginLeft: 'auto', fontWeight: 700, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>Uygula</button>
              <button aria-label="Öneriyi Kapat" onClick={() => setKategoriOneri(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={12} /></button>
            </div>
          )}

          {alan('Açıklama *', hatalar.aciklama,
            <input type="text" aria-label="Açıklama" value={form.aciklama} onChange={e => set('aciklama', e.target.value)}
              placeholder="Örn: Haftalık market alışverişi" style={inputStyle('aciklama')} />
          )}

          {alan('Kategori', null,
            <select aria-label="Kategori" value={form.kategori} onChange={e => set('kategori', e.target.value)} style={inputStyle('kategori')}>
              <option value="">Kategori seçin…</option>
              {TUM_KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          )}

          {alan('Not (opsiyonel)', null,
            <textarea aria-label="Not" value={form.not} onChange={e => set('not', e.target.value)}
              rows={2} placeholder="Eklemek istediğiniz bir not…"
              style={{ ...inputStyle('not'), resize: 'none' }} />
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: P.text2, marginBottom: 6 }}>
              Etiketler <span style={{ fontWeight: 400, opacity: 0.7 }}>(virgülle ayırın)</span>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" aria-label="Etiket" value={etiketInput} onChange={e => setEtiketInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEtiketEkle()}
                placeholder="iş yemeği, geri ödenecek…"
                style={{ ...inputStyle(''), flex: 1 }} />
              <button aria-label="Etiket Ekle" onClick={handleEtiketEkle} style={{
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
                    <button aria-label="Etiketi Sil" onClick={() => set('etiketler', form.etiketler.filter(t => t !== e))}
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
          <button aria-label="Kapat" onClick={onKapat} style={{
            flex: 1, padding: '12px 0', borderRadius: 12, border: `1px solid ${P.border}`, background: P.bg3,
            color: P.text2, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            İptal
          </button>
          <button onClick={handleKaydet} style={{
            flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${P.purple}, #4F46E5)`,
            color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 16px ${P.purpleDim}`, transition: 'all 0.2s',
          }}>
            {islem ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Anti-Impulse Blocker Overlay */}
      {showImpulseBlock && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ width: '100%', maxWidth: 360, background: P.bg1, border: `1px solid ${P.amber}50`, borderRadius: 28, padding: '32px 24px', boxShadow: `0 32px 100px ${P.amber}30`, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: `${P.amber}15`, border: `2px solid ${P.amber}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'pulse 2s infinite' }}>
              <ShieldAlert size={32} color={P.amber} />
            </div>
            
            <h3 style={{ fontSize: 20, fontWeight: 900, color: P.text1, marginBottom: 8 }}>Anti-Dürtü Kilidi</h3>
            <p style={{ fontSize: 13, color: P.text2, lineHeight: 1.6, marginBottom: 24 }}>
              Şu an gece yarısı veya limitini aşan riskli bir harcama giriyorsun. Gerçekten otonom kararın mı? İşlemi kaydetmek için <strong style={{ color: P.text1 }}>Touch ID / Face ID</strong> onayı gerekiyor.
            </p>

            <button 
              onClick={handleWebAuthn}
              disabled={webAuthnLoading}
              style={{
                width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                background: webAuthnLoading ? P.bg3 : '#fff', color: webAuthnLoading ? P.text3 : '#000',
                fontSize: 15, fontWeight: 800, cursor: webAuthnLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12,
                transition: 'all 0.2s'
              }}
            >
              {webAuthnLoading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Fingerprint size={20} />}
              {webAuthnLoading ? 'Biyometrik Doğrulanıyor...' : 'Parmak İzi ile Onayla'}
            </button>
            <button onClick={() => setShowImpulseBlock(false)} style={{ background: 'none', border: 'none', color: P.text3, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 8 }}>
              Vazgeç (Doğru Karar)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
