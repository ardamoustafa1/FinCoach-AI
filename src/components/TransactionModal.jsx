import { useState, useEffect, useRef } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { TUM_KATEGORILER, fmt } from '../utils/categories';
import { suggestCategory } from '../utils/storage';

const BOSLUK = 'Tarih, tutar ve açıklama zorunludur.';

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
    <div>
      <label className="block text-xs font-semibold text-surface-700 dark:text-surface-200 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}
    </div>
  );
}

export default function TransactionModal({ islem, onKaydet, onKapat }) {
  const [form, setForm] = useState(islem
    ? {
        ...BOS_FORM,
        ...islem,
        etiketler: islem.etiketler || [],
        tutar: String(islem.tutar || ''),
      }
    : { ...BOS_FORM }
  );
  const [hatalar, setHatalar] = useState({});
  const [etiketInput, setEtiketInput] = useState('');
  const [kategoriOneri, setKategoriOneri] = useState(null);
  const magazaDebRef = useRef(null);

  // Mağaza değişince kategori öner
  useEffect(() => {
    clearTimeout(magazaDebRef.current);
    magazaDebRef.current = setTimeout(() => {
      const oneri = suggestCategory(form.magaza);
      setKategoriOneri(oneri && oneri !== form.kategori ? oneri : null);
    }, 400);
  }, [form.magaza]);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setHatalar(h => ({ ...h, [key]: '' }));
  };

  const validasyonKontrol = () => {
    const h = {};
    if (!form.tarih)   h.tarih    = 'Tarih zorunlu';
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

  const inputCls = (key) => `
    w-full px-3 py-2.5 rounded-xl text-sm
    bg-white dark:bg-surface-800
    text-surface-900 dark:text-white
    placeholder-surface-700 dark:placeholder-surface-200
    focus:outline-none focus:ring-2 transition-all
    ${hatalar[key]
      ? 'border-2 border-danger-500 focus:ring-danger-500/30'
      : 'border border-surface-200 dark:border-surface-700 focus:ring-primary-500 focus:border-primary-500'}
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onKapat()}>
      <div className="w-full max-w-lg bg-white dark:bg-surface-850 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]
                      animate-fade-in-up border border-surface-200 dark:border-surface-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-700 shrink-0">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">
            {islem ? 'İşlemi Düzenle' : '+ Yeni İşlem'}
          </h2>
          <button onClick={onKapat}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors cursor-pointer">
            <X className="w-5 h-5 text-surface-700 dark:text-surface-200" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
          {/* Tarih + Tutar */}
          <div className="grid grid-cols-2 gap-4">
            {alan('Tarih *', hatalar.tarih,
              <input type="date" value={form.tarih} onChange={e => set('tarih', e.target.value)} className={inputCls('tarih')} />
            )}
            {alan('Tutar *', hatalar.tutar,
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-surface-700 dark:text-surface-200">₺</span>
                <input type="number" min="0" step="0.01" value={form.tutar}
                  onChange={e => set('tutar', e.target.value.replace(/-/, ''))}
                  placeholder="0" className={`${inputCls('tutar')} pl-7`} />
              </div>
            )}
          </div>

          {/* Mağaza */}
          {alan('Mağaza',  null,
            <input type="text" value={form.magaza} onChange={e => set('magaza', e.target.value)}
              placeholder="Örn: Migros, Netflix…" className={inputCls('magaza')} />
          )}

          {/* Kategori önerisi */}
          {kategoriOneri && (
            <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
              <span>💡 Öneri: <strong>{kategoriOneri}</strong></span>
              <button onClick={() => { set('kategori', kategoriOneri); setKategoriOneri(null); }}
                className="ml-auto font-semibold hover:underline cursor-pointer">Uygula</button>
              <button onClick={() => setKategoriOneri(null)} className="text-surface-700 dark:text-surface-200 cursor-pointer"><X className="w-3 h-3" /></button>
            </div>
          )}

          {/* Açıklama */}
          {alan('Açıklama *', hatalar.aciklama,
            <input type="text" value={form.aciklama} onChange={e => set('aciklama', e.target.value)}
              placeholder="Örn: Haftalık market alışverişi" className={inputCls('aciklama')} />
          )}

          {/* Kategori */}
          {alan('Kategori', null,
            <select value={form.kategori} onChange={e => set('kategori', e.target.value)} className={inputCls('kategori')}>
              <option value="">Kategori seçin…</option>
              {TUM_KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          )}

          {/* Notlar */}
          {alan('Not (opsiyonel)', null,
            <textarea value={form.not} onChange={e => set('not', e.target.value)}
              rows={2} placeholder="Eklemek istediğiniz bir not…"
              className={`${inputCls('not')} resize-none`} />
          )}

          {/* Etiketler */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-200 mb-1.5">
              Etiketler <span className="font-normal opacity-60">(virgülle ayırın)</span>
            </label>
            <div className="flex gap-2">
              <input type="text" value={etiketInput} onChange={e => setEtiketInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEtiketEkle()}
                placeholder="iş yemeği, geri ödenecek…"
                className={`${inputCls('')} flex-1`} />
              <button onClick={handleEtiketEkle}
                className="px-3 py-2 rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-colors cursor-pointer">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.etiketler.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.etiketler.map(e => (
                  <span key={e} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-100 dark:bg-surface-700 text-xs font-medium text-surface-900 dark:text-white">
                    <Tag className="w-2.5 h-2.5 opacity-50" />{e}
                    <button onClick={() => set('etiketler', form.etiketler.filter(t => t !== e))}
                      className="ml-0.5 hover:text-danger-500 transition-colors cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-100 dark:border-surface-700 flex gap-3 justify-end shrink-0">
          <button onClick={onKapat}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-200 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors cursor-pointer">
            İptal
          </button>
          <button onClick={handleKaydet}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-all cursor-pointer">
            {islem ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
