import { useState } from 'react';
import { Plus, Target, Calendar, Edit2, Trash2, X, CheckCircle, Sparkles, Scissors, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getGoals, addGoal, updateGoal, deleteGoal } from '../utils/storage';
import { fmt } from '../utils/categories';

const IKONLAR = ['✈️', '🚗', '🏠', '💍', '📱', '🎓', '💰', '🏖️', '🎮', '🛋️'];
const RENKLER = [
  { id: 'primary', hex: '#6366f1', cls: 'bg-primary-500' },
  { id: 'emerald', hex: '#10b981', cls: 'bg-emerald-500' },
  { id: 'purple', hex: '#a855f7', cls: 'bg-purple-500' },
  { id: 'rose', hex: '#e11d48', cls: 'bg-rose-500' },
  { id: 'amber', hex: '#f59e0b', cls: 'bg-amber-500' },
  { id: 'cyan', hex: '#06b6d4', cls: 'bg-cyan-500' },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState(() => getGoals());
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState(null);
  const [completedModal, setCompletedModal] = useState(null); // { name }

  const handleOpenModal = (g = null) => {
    setDuzenlenen(g);
    setModalAcik(true);
  };

  const handleSave = (yeniHedef) => {
    let newGoals;
    if (duzenlenen) {
      newGoals = updateGoal(duzenlenen.id, yeniHedef);
    } else {
      addGoal(yeniHedef);
      newGoals = getGoals();
    }
    setGoals(newGoals);
    setModalAcik(false);
    setDuzenlenen(null);

    // Check completion
    if (yeniHedef.currentAmount >= yeniHedef.targetAmount && (!duzenlenen || duzenlenen.currentAmount < duzenlenen.targetAmount)) {
      triggerConfetti();
      setCompletedModal(yeniHedef.name);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Bu hedefi silmek istediğinize emin misiniz?')) {
      const newGoals = deleteGoal(id);
      setGoals(newGoals);
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#10b981', '#a855f7']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366f1', '#10b981', '#a855f7']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Ayırma: Aktif vs Tamamlanan
  const aktif = goals.filter(g => Number(g.currentAmount) < Number(g.targetAmount));
  const tamamlanan = goals.filter(g => Number(g.currentAmount) >= Number(g.targetAmount));

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── BAŞLIK & YENİ EKLENTİ ── */}
      <div className="page-hero p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-600 dark:text-primary-300 mb-2">Hedef motoru</p>
          <h1 className="text-3xl md:text-4xl font-black text-surface-950 dark:text-white flex items-center gap-2">
            Hedefler
            <Target className="w-6 h-6 text-primary-500" />
          </h1>
          <p className="text-surface-700 dark:text-surface-200 mt-1 text-sm">
            Hayallerinize ulaşmak için plan yapın ve birikimlerinizi takip edin.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-bold hover:bg-primary-600 shadow-lg shadow-primary-500/30 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Yeni Hedef</span>
        </button>
      </div>

      {/* ── AKTİF HEDEFLER ── */}
      {aktif.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {aktif.map(g => (
            <HedefKarti 
              key={g.id} 
              hedef={g} 
              onEdit={() => handleOpenModal(g)} 
              onDelete={() => handleDelete(g.id)} 
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            <Target className="w-8 h-8 text-surface-400" />
          </div>
          <p className="text-lg font-semibold text-surface-900 dark:text-white mb-1">Aktif hedefin yok</p>
          <p className="text-sm text-surface-500">Hemen yeni bir hedef ekleyerek birikim yapmaya başla.</p>
        </div>
      )}

      <KesintiSimulator goals={aktif.length > 0 ? aktif : goals} />

      {/* ── TAMAMLANAN HEDEFLER ── */}
      {tamamlanan.length > 0 && (
        <div className="pt-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">Tamamlanan Hedefler</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 opacity-70 hover:opacity-100 transition-opacity">
            {tamamlanan.map(g => (
              <HedefKarti 
                key={g.id} 
                hedef={g} 
                onEdit={() => handleOpenModal(g)} 
                onDelete={() => handleDelete(g.id)} 
                isCompleted={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {modalAcik && (
        <HedefModal
          mevcut={duzenlenen}
          onKaydet={handleSave}
          onKapat={() => setModalAcik(false)}
        />
      )}

      {/* TEBRİKLER MODALI */}
      {completedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-surface-850 rounded-3xl shadow-2xl p-8 text-center relative animate-bounce-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-5">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Tebrikler!</h2>
            <p className="text-surface-700 dark:text-surface-200 mb-6">
              <strong className="text-primary-500">{completedModal}</strong> hedefine başarıyla ulaştın. Hayallerine bir adım daha yaklaştın!
            </p>
            <button
              onClick={() => setCompletedModal(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-opacity cursor-pointer"
            >
              Harika!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const KESINTI_KATEGORILERI = [
  { id: 'yemek-siparisi', ad: 'Yemek Siparişi', aylik: 2400, varsayilan: 50 },
  { id: 'abonelikler', ad: 'Abonelikler', aylik: 680, varsayilan: 25 },
  { id: 'disarida-yemek', ad: 'Dışarıda Yemek', aylik: 1800, varsayilan: 20 },
  { id: 'alisveris', ad: 'Alışveriş', aylik: 3200, varsayilan: 0 },
  { id: 'eglence', ad: 'Eğlence', aylik: 920, varsayilan: 15 },
];

const liraFmt = (v) => `${Math.round(v).toLocaleString('tr-TR')}₺`;

function ayEkle(tarih, ay) {
  const yeniTarih = new Date(tarih);
  yeniTarih.setMonth(yeniTarih.getMonth() + Math.max(0, Math.ceil(ay)));
  return yeniTarih;
}

function tarihFmt(tarih) {
  return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(tarih);
}

function KesintiSimulator({ goals }) {
  const [seciliHedefId, setSeciliHedefId] = useState(goals[0]?.id || '');
  const [oranlar, setOranlar] = useState(() =>
    KESINTI_KATEGORILERI.reduce((acc, kategori) => ({ ...acc, [kategori.id]: kategori.varsayilan }), {})
  );

  if (goals.length === 0) return null;

  const etkinHedefId = goals.some(g => g.id === seciliHedefId) ? seciliHedefId : goals[0]?.id;
  const hedef = goals.find(g => g.id === etkinHedefId) || goals[0];
  const hedefAdi = hedef?.name || 'Hedef';
  const kalanTutar = Math.max(0, Number(hedef?.targetAmount || 0) - Number(hedef?.currentAmount || 0));
  const bugun = new Date();
  const hedefTarihi = hedef?.deadline ? new Date(hedef.deadline) : ayEkle(bugun, 6);
  const kalanGun = Math.max(1, Math.ceil((hedefTarihi - bugun) / (1000 * 60 * 60 * 24)));
  const mevcutKalanAy = Math.max(1, Math.ceil(kalanGun / 30));
  const mevcutAylikTasarruf = kalanTutar > 0 ? Math.max(1, Math.ceil(kalanTutar / mevcutKalanAy)) : 0;
  const ekTasarruf = KESINTI_KATEGORILERI.reduce(
    (toplam, kategori) => toplam + Math.round(kategori.aylik * ((oranlar[kategori.id] || 0) / 100)),
    0
  );
  const yeniAylikTasarruf = mevcutAylikTasarruf + ekTasarruf;
  const yeniKalanAy = kalanTutar > 0 && yeniAylikTasarruf > 0 ? Math.max(1, Math.ceil(kalanTutar / yeniAylikTasarruf)) : 0;
  const erkenAy = Math.max(0, mevcutKalanAy - yeniKalanAy);
  const eskiTamamlanma = kalanTutar > 0 ? ayEkle(bugun, mevcutKalanAy) : bugun;
  const yeniTamamlanma = kalanTutar > 0 ? ayEkle(bugun, yeniKalanAy) : bugun;
  const enBuyukEtki = KESINTI_KATEGORILERI
    .map(kategori => ({ ...kategori, tasarruf: Math.round(kategori.aylik * ((oranlar[kategori.id] || 0) / 100)) }))
    .sort((a, b) => b.tasarruf - a.tasarruf)[0];
  const eskiBar = kalanTutar > 0 ? 100 : 100;
  const yeniBar = kalanTutar > 0 ? Math.max(12, Math.min(100, (yeniKalanAy / mevcutKalanAy) * 100)) : 100;

  const handleOranDegistir = (id, deger) => {
    setOranlar(prev => ({ ...prev, [id]: Number(deger) }));
  };

  return (
    <section className="glass-card rounded-3xl overflow-hidden border border-surface-200 dark:border-surface-700/50 shadow-xl shadow-surface-900/5">
      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="p-5 md:p-6 border-b xl:border-b-0 xl:border-r border-surface-200 dark:border-surface-700/50">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Scissors className="w-4 h-4" />
                Ne Kessem Ne Birikirim?
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-surface-900 dark:text-white">
                Küçük kesintilerin hedef tarihini nasıl değiştirdiğini gör.
              </h2>
            </div>
          </div>

          <div className="space-y-5">
            {KESINTI_KATEGORILERI.map(kategori => {
              const oran = oranlar[kategori.id] || 0;
              const tasarruf = Math.round(kategori.aylik * (oran / 100));

              return (
                <div key={kategori.id} className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                    <div>
                      <p className="text-sm font-bold text-surface-900 dark:text-white">{kategori.ad}</p>
                      <p className="text-xs text-surface-500">Mevcut aylık harcama: {liraFmt(kategori.aylik)}</p>
                    </div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      Aylık {liraFmt(tasarruf)} tasarruf
                    </div>
                  </div>
                  <div className="grid grid-cols-[42px_1fr_46px] items-center gap-3">
                    <span className="text-xs font-semibold text-surface-500">%0</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={oran}
                      onChange={e => handleOranDegistir(kategori.id, e.target.value)}
                      onInput={e => handleOranDegistir(kategori.id, e.target.value)}
                      className="w-full accent-primary-500 cursor-pointer"
                      aria-label={`${kategori.ad} kesinti oranı`}
                    />
                    <span className="text-xs font-bold text-surface-700 dark:text-surface-200 text-right">%{oran}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 md:p-6 bg-surface-50/70 dark:bg-surface-900/30">
          <label className="block text-xs font-semibold text-surface-700 dark:text-surface-200 mb-2 uppercase tracking-wider">
            Hedef seç
          </label>
          <select
            value={etkinHedefId}
            onChange={e => setSeciliHedefId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          >
            {goals.map(g => (
              <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
            ))}
          </select>

          <div className="mt-7">
            <p className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-2">Aylık ek tasarruf</p>
            <div className="text-4xl md:text-5xl font-black text-surface-900 dark:text-white tracking-tight">
              +{liraFmt(ekTasarruf)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-7">
            <div className="rounded-2xl bg-white/80 dark:bg-surface-850/70 border border-surface-200 dark:border-surface-700/60 p-4">
              <p className="text-xs text-surface-500 mb-1">Mevcut tarih</p>
              <p className="text-sm font-bold text-surface-900 dark:text-white">{tarihFmt(eskiTamamlanma)}</p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-1">Yeni tarih</p>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{tarihFmt(yeniTamamlanma)}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-lg">
            <TrendingUp className="w-5 h-5" />
            {erkenAy > 0 ? `${erkenAy} ay daha erken ulaşırsın!` : 'Hedef planın aynı hızda ilerliyor.'}
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-surface-500 mb-1">
                <span>Eski plan</span>
                <span>{mevcutKalanAy} ay</span>
              </div>
              <div className="h-2.5 rounded-full bg-surface-200 dark:bg-surface-800 overflow-hidden">
                <div className="h-full rounded-full bg-surface-400 dark:bg-surface-600" style={{ width: `${eskiBar}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                <span>Yeni plan</span>
                <span>{yeniKalanAy} ay</span>
              </div>
              <div className="h-2.5 rounded-full bg-emerald-500/15 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${yeniBar}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20">
            <p className="text-sm font-semibold text-surface-900 dark:text-white leading-relaxed">
              {enBuyukEtki.ad} kesintisini %{oranlar[enBuyukEtki.id] || 0} azaltırsan, {hedefAdi} hedefine{' '}
              <span className="text-emerald-600 dark:text-emerald-400">{erkenAy} ay daha erken</span> ulaşırsın.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── HEDEF KARTI BİLEŞENİ ──────────────────────────────────────
function HedefKarti({ hedef, onEdit, onDelete, isCompleted = false }) {
  const mevcut = Number(hedef.currentAmount) || 0;
  const target = Number(hedef.targetAmount) || 1;
  const pct = Math.min(100, (mevcut / target) * 100);
  const colorHex = RENKLER.find(r => r.id === hedef.color)?.hex || '#6366f1';

  // Kalan hesaplamaları
  const kalan = target - mevcut;
  const bitisTarihi = new Date(hedef.deadline);
  const bugun = new Date();
  const kalanGun = Math.ceil((bitisTarihi - bugun) / (1000 * 60 * 60 * 24));
  const kalanAy = Math.max(1, Math.ceil(kalanGun / 30));
  
  // Bu ay biriktirilmesi gereken (kalan / kalan_ay)
  const aylikGereken = kalan > 0 && kalanGun > 0 ? Math.ceil(kalan / kalanAy) : 0;

  return (
    <div className="glass-card rounded-3xl p-5 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-surface-200 dark:border-surface-700/50">
      {/* Kart Arkaplan Glow */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: colorHex }}
      />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/10"
            style={{ backgroundColor: `${colorHex}15` }}
          >
            {hedef.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white line-clamp-1">{hedef.name}</h3>
            {isCompleted ? (
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3" /> Tamamlandı
              </span>
            ) : (
              <span className="text-xs font-medium text-surface-500 flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                {kalanGun > 0 ? `${kalanGun} gün kaldı` : 'Süresi doldu'}
              </span>
            )}
          </div>
        </div>

        {/* Aksiyon İkonları (Hoverda çıkar) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-500 hover:text-primary-500 transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-danger-500/10 text-surface-500 hover:text-danger-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mt-6 relative z-10">
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-surface-900 dark:text-white">{fmt(mevcut)}</span>
          <span className="text-surface-500">{fmt(target)}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-3 w-full bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${pct}%`, backgroundColor: colorHex }}
          />
        </div>
      </div>

      {!isCompleted && (
        <div className="mt-5 pt-4 border-t border-surface-200 dark:border-surface-700/50 flex items-center justify-between">
          <div className="text-xs text-surface-500 font-medium">
            Kalan: <strong className="text-surface-900 dark:text-white">{fmt(kalan)}</strong>
          </div>
          {aylikGereken > 0 && (
            <div 
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: `${colorHex}15`, color: colorHex }}
            >
              Bu ay: {fmt(aylikGereken)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── HEDEF MODALI ─────────────────────────────────────────────
function HedefModal({ mevcut, onKaydet, onKapat }) {
  const [name, setName] = useState(mevcut?.name || '');
  const [targetAmount, setTargetAmount] = useState(mevcut?.targetAmount || '');
  const [currentAmount, setCurrentAmount] = useState(mevcut?.currentAmount || 0);
  
  // Varsayılan tarih 6 ay sonrası
  const varsayilanTarih = new Date();
  varsayilanTarih.setMonth(varsayilanTarih.getMonth() + 6);
  const [deadline, setDeadline] = useState(mevcut?.deadline || varsayilanTarih.toISOString().slice(0, 10));
  
  const [icon, setIcon] = useState(mevcut?.icon || '✈️');
  const [color, setColor] = useState(mevcut?.color || 'primary');

  const handleSave = (e) => {
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

  // Anlık aylık birikim hesabı
  const kalan = Math.max(0, Number(targetAmount) - Number(currentAmount));
  const kalanGun = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const kalanAy = Math.max(1, Math.ceil(kalanGun / 30));
  const aylikGereken = kalan > 0 && kalanGun > 0 ? Math.ceil(kalan / kalanAy) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onKapat()}>
      <div className="w-full max-w-md bg-white dark:bg-surface-850 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center bg-surface-50 dark:bg-surface-800/50">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white">
            {mevcut ? 'Hedefi Düzenle' : 'Yeni Hedef Oluştur'}
          </h3>
          <button onClick={onKapat} className="p-2 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* İsim */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-200 mb-1.5 uppercase tracking-wider">Hedef Adı</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Örn: Tatil Fonu, Yeni Araba"
              className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          {/* Tutarlar */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-200 mb-1.5 uppercase tracking-wider">Hedef Tutar (₺)</label>
              <input
                type="number"
                required
                min="1"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                placeholder="10000"
                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-200 mb-1.5 uppercase tracking-wider">Mevcut Birikim (₺)</label>
              <input
                type="number"
                min="0"
                value={currentAmount}
                onChange={e => setCurrentAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Tarih */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-200 mb-1.5 uppercase tracking-wider">Hedef Tarihi</label>
            <input
              type="date"
              required
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          {/* İkon & Renk */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-200 mb-2 uppercase tracking-wider">İkon Seç</label>
              <div className="flex flex-wrap gap-2">
                {IKONLAR.map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all border ${
                      icon === i 
                        ? 'bg-primary-500/10 border-primary-500 scale-110 shadow-sm' 
                        : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-700'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-200 mb-2 uppercase tracking-wider">Tema Rengi</label>
              <div className="flex gap-3">
                {RENKLER.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setColor(r.id)}
                    className={`w-8 h-8 rounded-full transition-transform ${color === r.id ? 'scale-125 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-surface-850' : 'hover:scale-110'}`}
                    style={{ backgroundColor: r.hex, ringColor: r.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Otomatik Hesap Özeti */}
          {aylikGereken > 0 && (
            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-start gap-3 mt-4">
              <Sparkles className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">Yapay Zeka Önerisi</p>
                <p className="text-sm font-semibold text-surface-900 dark:text-white mt-0.5">
                  Bu hedefe zamanında ulaşmak için her ay <span className="text-primary-500">{fmt(aylikGereken)}</span> biriktirmelisin.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-primary-500 text-white font-bold hover:bg-primary-600 shadow-lg shadow-primary-500/30 transition-all active:scale-[0.98]"
            >
              {mevcut ? 'Değişiklikleri Kaydet' : 'Hedefi Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
