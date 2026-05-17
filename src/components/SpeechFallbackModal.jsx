import { useState, useEffect } from 'react';
import { X, Mic, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { authFetch } from '../utils/api';
import useStore from '../store/useStore';

export default function SpeechFallbackModal({ isOpen, onClose, transcript: initialTranscript, onSuccess }) {
  const [transcript, setTranscript] = useState(initialTranscript || '');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setTranscript(initialTranscript || '');
      generateSuggestions(initialTranscript || '');
    }
  }, [isOpen, initialTranscript]);

  const generateSuggestions = (text = '') => {
    const lower = text.toLowerCase();
    let derived = [];

    if (lower.includes('market') || lower.includes('migros') || lower.includes('şok') || lower.includes('bim') || lower.includes('gıda') || lower.includes('alışveriş')) {
      derived = [
        { text: 'Marketten 150 TL harcadım', desc: 'Hızlı Mutfak Alışverişi' },
        { text: 'Migros\'tan 450 TL harcadım', desc: 'Haftalık Gıda Alışverişi' },
        { text: 'Bim\'e 85 TL ödedim', desc: 'Küçük Market Harcaması' }
      ];
    } else if (lower.includes('yemek') || lower.includes('restoran') || lower.includes('kahve') || lower.includes('starbucks') || lower.includes('cafe')) {
      derived = [
        { text: 'Kahve için 65 TL ödedim', desc: 'Sosyal / Cafe Harcaması' },
        { text: 'Akşam yemeğine 450 TL harcadım', desc: 'Dışarıda Yemek' },
        { text: 'Yemeksepeti\'nden 280 TL sipariş verdim', desc: 'Eve Servis Yemek' }
      ];
    } else if (lower.includes('yol') || lower.includes('taksi') || lower.includes('otobüs') || lower.includes('akbil') || lower.includes('benzin') || lower.includes('yakıt')) {
      derived = [
        { text: 'Taksiye 180 TL ödedim', desc: 'Ulaşım Masrafı' },
        { text: 'Akbile 150 TL yükledim', desc: 'Toplu Taşıma' },
        { text: 'Benzin için 950 TL harcadım', desc: 'Araç Yakıtı' }
      ];
    } else if (lower.includes('kira') || lower.includes('ev') || lower.includes('fatura') || lower.includes('su') || lower.includes('elektrik')) {
      derived = [
        { text: 'Elektrik faturası için 320 TL ödedim', desc: 'Fatura Harcaması' },
        { text: 'Kirayı 12000 TL olarak gönderdim', desc: 'Ev / Kira Masrafı' },
        { text: 'İnternet faturasına 190 TL ödedim', desc: 'Fatura Harcaması' }
      ];
    } else {
      derived = [
        { text: 'Marketten 250 TL harcadım', desc: 'Örnek Gıda Alışverişi' },
        { text: 'Kahve için 65 TL ödedim', desc: 'Örnek Sosyal Harcama' },
        { text: 'Taksiye 150 TL harcadım', desc: 'Örnek Ulaşım Masrafı' }
      ];
    }

    setSuggestions(derived);
  };

  const handleAnalyze = async (textToAnalyze) => {
    if (!textToAnalyze.trim()) {
      toast.error('Lütfen analiz edilecek bir metin girin.');
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch('/api/voice', {
        method: 'POST',
        body: JSON.stringify({ text: textToAnalyze })
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'AI analizi başarısız oldu.');
      }

      const data = await res.json();
      
      const yeniIslem = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        tarih: new Date().toISOString().slice(0, 10),
        tutar: data.tutar || '',
        magaza: data.magaza || '',
        aciklama: textToAnalyze,
        kategori: data.kategori || 'Diğer',
        tur: data.tur || 'gider',
        not: 'Sesli hata düzeltme ile eklendi'
      };

      if (!yeniIslem.tutar) {
        toast.warning('Girdiğiniz metinden tutar yine ayrıştırılamadı. Lütfen net bir tutar ekleyin (örneğin: 150 TL).');
        setLoading(false);
        return;
      }

      await useStore.getState().addTransaction(yeniIslem);
      toast.success(`${yeniIslem.magaza || 'İşlem'} (${yeniIslem.tutar} TL) başarıyla eklendi! ✨`);
      
      if (onSuccess) onSuccess(yeniIslem);
      onClose();
    } catch (err) {
      toast.error(`Analiz hatası: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, background: 'rgba(5, 7, 20, 0.85)', backdropFilter: 'blur(16px)'
    }}>
      <style>{`
        @keyframes modalEnter {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .modal-container {
          animation: modalEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          background: linear-gradient(135deg, rgba(30, 27, 75, 0.45) 0%, rgba(15, 23, 42, 0.45) 100%);
          border: 1px solid rgba(124, 58, 237, 0.25);
          box-shadow: 0 24px 64px rgba(124, 58, 237, 0.2);
        }
        .suggestion-card:hover {
          background: rgba(124, 58, 237, 0.15) !important;
          border-color: rgba(124, 58, 237, 0.45) !important;
          transform: translateY(-2px);
        }
      `}</style>

      <div className="modal-container w-full max-w-lg rounded-2xl overflow-hidden p-6 md:p-8" style={{ minHeight: 400 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={18} color="#ef4444" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>Sesli Komut Anlaşılamadı</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Tutar veya harcama yeri tam ayrıştırılamadı</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Captured Text Area */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Algılanan Ses Metni</label>
          <div style={{ position: 'relative' }}>
            <textarea
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                generateSuggestions(e.target.value);
              }}
              style={{
                width: '100%', height: 72, background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: 12,
                padding: '12px 16px', color: '#fff', fontSize: 14, resize: 'none',
                outline: 'none', fontFamily: 'inherit'
              }}
              placeholder="Örn: Marketten 150 TL harcadım..."
            />
          </div>
        </div>

        {/* Suggestions Section */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Sparkles size={14} color="#a78bfa" className="animate-pulse" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Öneri Kutusu (Tek Tıkla Ekle)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {suggestions.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setTranscript(item.text);
                  handleAnalyze(item.text);
                }}
                className="suggestion-card"
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 2px 0' }}>{item.text}</p>
                  <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{item.desc}</p>
                </div>
                <ArrowRight size={14} color="#7c3aed" style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', transition: 'background 0.2s'
            }}
          >
            Vazgeç
          </button>
          <button
            onClick={() => handleAnalyze(transcript)}
            disabled={loading}
            style={{
              flex: 2, padding: '12px 20px', borderRadius: 12,
              background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
              border: 'none', color: '#fff', fontSize: 14, fontWeight: 800,
              cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span>Çözümleniyor...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Düzelt ve Yeniden Çözümle</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
