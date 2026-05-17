import { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, X } from 'lucide-react';
import { authFetch } from '../../utils/api';

const P = {
  green: '#10B981',
  red: '#EF4444',
  bg2: 'var(--bg-surface)',
  bg3: 'var(--bg-surface-soft)',
  bg4: 'var(--bg-surface-soft)',
  border: 'var(--border-color)',
  text1: 'var(--text-primary)',
  text2: 'var(--text-secondary)',
  text3: 'var(--text-muted)',
};

export default function ReceiptScanModal({ onSonuc, onApiError, onKapat }) {
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
    } catch {
      onApiError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && !loading && onKapat()}
      style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div style={{ width: '100%', maxWidth: 520, background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 22, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', animation: 'fadeUp 0.25s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${P.border}`, background: P.bg3 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: P.text1 }}>Fiş Tara</h2>
            <p style={{ fontSize: 12, color: P.text3, marginTop: 2 }}>Fotoğrafı seç, FinCoach AI tutar ve tarihi çıkarsın.</p>
          </div>
          <button aria-label="Kapat" onClick={onKapat} disabled={loading} style={{ width: 34, height: 34, borderRadius: 10, background: P.bg4, border: `1px solid ${P.border}`, color: P.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
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
              {fileInfo.compressed && <span style={{ color: '#A78BFA', fontWeight: 700 }}> · Sıkıştırıldı</span>}
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
