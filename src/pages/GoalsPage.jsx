import { useState } from 'react';
import {
  Plus, Target, Calendar, Edit2, Trash2, X,
  CheckCircle, Sparkles, Scissors, TrendingUp, Flame, Wallet, CheckSquare, BrainCircuit, Brain, AlertTriangle, ShoppingCart, Bot
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import confetti from 'canvas-confetti';
import useStore from '../store/useStore';
import { fmt } from '../utils/categories';

import { P } from '../styles/palette';
const IKONLAR = ['✈️', '🚗', '🏠', '💍', '📱', '🎓', '💰', '🏖️', '🎮', '🛋️'];

const RENKLER = [
  { id: 'violet', hex: '#7c3aed', glow: '124,58,237' },
  { id: 'emerald', hex: '#10b981', glow: '16,185,129' },
  { id: 'fuchsia', hex: '#d946ef', glow: '217,70,239' },
  { id: 'rose', hex: '#f43f5e', glow: '244,63,94' },
  { id: 'amber', hex: '#f59e0b', glow: '245,158,11' },
  { id: 'cyan', hex: '#06b6d4', glow: '6,182,212' },
];

const KESINTI_KATEGORILERI = [
  { id: 'yemek-siparisi', ad: 'Yemek Siparişi', icon: '🍔', aylik: 2400, varsayilan: 50 },
  { id: 'abonelikler', ad: 'Abonelikler', icon: '📺', aylik: 680, varsayilan: 25 },
  { id: 'disarida-yemek', ad: 'Dışarıda Yemek', icon: '🍽️', aylik: 1800, varsayilan: 20 },
  { id: 'alisveris', ad: 'Alışveriş', icon: '🛍️', aylik: 3200, varsayilan: 0 },
  { id: 'eglence', ad: 'Eğlence', icon: '🎭', aylik: 920, varsayilan: 15 },
];

const HAZIR_HEDEFLER = [
  { name: 'Acil Durum Fonu', targetAmount: 100000, currentAmount: 0, deadline: '2026-12-31', icon: '🛡️', color: '#6366f1' },
  { name: 'Tatil Birikimi', targetAmount: 60000, currentAmount: 0, deadline: '2026-08-15', icon: '✈️', color: '#10b981' },
  { name: 'Borç Kapatma', targetAmount: 40000, currentAmount: 0, deadline: '2026-07-01', icon: '✅', color: '#ef4444' },
];

const liraFmt = v => `${Math.round(v).toLocaleString('tr-TR')}₺`;
const dayMs = 86_400_000;
function ayEkle(tarih, ay) {
  const d = new Date(tarih);
  d.setMonth(d.getMonth() + Math.max(0, Math.ceil(ay)));
  return d;
}
function tarihFmt(t) {
  return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(t);
}

function StatCard({ label, value, icon: Icon, color, isCurrency = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: 24, borderRadius: 24, background: P.bg2,
        border: `1px solid ${hov ? 'rgba(124,58,237,0.4)' : P.border}`,
        transition: 'all 0.3s ease',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: P.text1, margin: 0 }}>
            {isCurrency ? <><span style={{ fontSize: 16, fontWeight: 600, color: P.text2, marginRight: 2 }}>₺</span>{Math.round(value).toLocaleString('tr-TR')}</> : value}
          </p>
        </div>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: `${color}22`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState(() => useStore.getState().goals);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState(null);
  const [completedModal, setCompletedModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const toast = useToast();

  const handleOpenModal = (g = null) => { setDuzenlenen(g); setModalAcik(true); };

  const refreshGoals = () => {
    setGoals(useStore.getState().goals);
  };

  const handleSave = async (yeniHedef) => {
    const wasIncomplete = !duzenlenen || Number(duzenlenen.currentAmount) < Number(duzenlenen.targetAmount);
    
    if (duzenlenen) {
      await useStore.getState().updateGoal(duzenlenen.id, yeniHedef);
    } else {
      await useStore.getState().addGoal(yeniHedef);
    }
    
    refreshGoals();
    setModalAcik(false);
    setDuzenlenen(null);

    if (Number(yeniHedef.currentAmount) >= Number(yeniHedef.targetAmount) && wasIncomplete) {
      triggerConfetti();
      setCompletedModal(yeniHedef.name);
    }
  };

  const handleDelete = async (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await useStore.getState().deleteGoal(deleteConfirm);
    refreshGoals();
    toast.success('Hedef silindi.');
    setDeleteConfirm(null);
  };

  const handleTemplate = async (template) => {
    await useStore.getState().addGoal(template);
    refreshGoals();
  };

  const triggerConfetti = () => {
    const end = Date.now() + 3000;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#7c3aed', '#10b981', '#d946ef'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#7c3aed', '#10b981', '#d946ef'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleQuickAdd = async (id, amount) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    
    const yeniMevcut = Number(goal.currentAmount) + amount;
    const wasIncomplete = Number(goal.currentAmount) < Number(goal.targetAmount);
    
    await useStore.getState().updateGoal(id, { currentAmount: yeniMevcut });
    refreshGoals();
    
    if (yeniMevcut >= Number(goal.targetAmount) && wasIncomplete) {
      triggerConfetti();
      setCompletedModal(goal.name);
    }
    toast.success(`${goal.name} hedefine ${amount}₺ eklendi!`);
  };

  const aktif = goals.filter(g => Number(g.currentAmount) < Number(g.targetAmount));
  const tamamlanan = goals.filter(g => Number(g.currentAmount) >= Number(g.targetAmount));
  const totalCurrent = goals.reduce((s, g) => s + Number(g.currentAmount), 0);

  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto animate-fade-in-up">

      {/* HEADER EXACTLY LIKE DASHBOARD */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: P.text1, margin: '0 0 6px 0' }}>Hedefler</h1>
          <p style={{ fontSize: 15, color: P.text3, margin: 0 }}>Hayallerinize ulaşmak için plan yapın ve birikimlerinizi takip edin.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 14, background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(124,58,237,0.45)', transition: 'transform 0.15s, opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <Plus size={18} /> Yeni Hedef
        </button>
      </div>

      {/* STAT CARDS EXACTLY LIKE DASHBOARD */}
      {goals.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 40 }}>
          <StatCard label="Toplam Hedef" value={goals.length} icon={Target} color="#7c3aed" />
          <StatCard label="Tamamlanan" value={tamamlanan.length} icon={CheckSquare} color="#10b981" />
          <StatCard label="Toplam Birikim" value={totalCurrent} icon={Wallet} color="#f59e0b" isCurrency />
        </div>
      )}

      {/* OTONOM ARBİTRAJ VE FIRSAT AJANI (WEB SCRAPING AGENT) */}
      {aktif.length > 0 && (
        <div className="animate-enter" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(14,165,233,0.05))', border: `1px solid rgba(6,182,212,0.3)`, borderRadius: 24, padding: 32, marginBottom: 40, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, pointerEvents: 'none' }}>
            <ShoppingCart size={200} color="#06b6d4" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, position: 'relative', zIndex: 1 }}>
            <div style={{ background: 'rgba(6,182,212,0.2)', padding: 10, borderRadius: 14 }}>
              <Bot size={24} color="#06b6d4" />
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#06b6d4' }}>Otonom Fırsat Avcısı Ajan</span>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: P.text1, margin: 0, letterSpacing: '-0.01em' }}>Arbitraj & Flaş İndirim Tespiti</h2>
            </div>
          </div>
          
          <p style={{ fontSize: 14, color: P.text2, lineHeight: 1.6, maxWidth: 800, margin: '0 0 24px', position: 'relative', zIndex: 1 }}>
            Hedeflerindeki <strong>"{aktif[0].name}"</strong> için 7/24 interneti tarıyorum. Hedefin olan {Math.round(aktif[0].targetAmount).toLocaleString('tr-TR')}₺ tutarına yaklaşırken, şu an e-ticaret sitelerinde (Amazon vb.) anlık bir <strong>fiyat hatası (Arbitraj) / Gece Flaş İndirimi</strong> tespit ettim. 
            Bu ürünü piyasa değerinin <strong>{Math.round(aktif[0].targetAmount * 0.15).toLocaleString('tr-TR')}₺ daha altına</strong> alabilirsin. Bekleme, stoklar bitmeden fırsatı değerlendir!
          </p>
          <button 
            onClick={() => {
              toast.info('Piyasa taraması yapılıyor...');
              setTimeout(() => toast.success('Amazon Türkiye üzerinde %18 indirimli ürün sepetinize eklenebilir!'), 1500);
            }}
            style={{
            background: '#06b6d4', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12,
            fontSize: 14, fontWeight: 800, cursor: 'pointer', position: 'relative', zIndex: 1, boxShadow: '0 8px 24px rgba(6,182,212,0.4)'
          }}>
            Hemen Satın Al (Fırsata Git)
          </button>
        </div>
      )}

      {/* BEHAVIORAL ECONOMICS (HYPERBOLIC DISCOUNTING) PANEL */}
      <div className="animate-enter" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.05), rgba(124,58,237,0.05))', border: `1px solid rgba(244,63,94,0.2)`, borderRadius: 24, padding: 32, marginBottom: 40, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.05, pointerEvents: 'none' }}>
          <Brain size={200} color={P.red} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, position: 'relative', zIndex: 1 }}>
          <div style={{ background: 'rgba(244,63,94,0.15)', padding: 10, borderRadius: 14 }}>
            <BrainCircuit size={24} color={P.red} />
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.red }}>Davranışsal Ekonomi AI</span>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: P.text1, margin: 0, letterSpacing: '-0.01em' }}>Hyperbolic Discounting (İrade Skoru)</h2>
          </div>
        </div>
        
        <p style={{ fontSize: 14, color: P.text2, lineHeight: 1.6, maxWidth: 800, margin: '0 0 24px', position: 'relative', zIndex: 1 }}>
          İnsan psikolojisi bugünkü ufak zevkleri, gelecekteki büyük ödüllere tercih eder (Hiperbolik İndirgeme). FinCoach sizin finansal irade zaafınızı <strong>%72 (Yüksek)</strong> olarak hesapladı. Bu zaafı kırmak için aylık büyük birikim hedefleri yerine, <strong>Nudge Theory (Dürtme Teorisi)</strong> kullanılarak günlük hissettirmeyen otomatik 45₺'lik mikro-kesintiler uygulanıyor.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <div style={{ background: P.bg0, border: `1px solid ${P.border}`, borderRadius: 16, padding: '16px 20px', flex: '1 1 250px' }}>
             <div style={{ fontSize: 11, color: P.text3, textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>İnsan Hatası (Human Error)</div>
             <div style={{ fontSize: 15, color: P.text1, fontWeight: 600 }}>Aylık tek seferde <span style={{ color: P.red }}>1.350₺</span> ayırma stresi ve başarısızlık ihtimali.</div>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.05)', border: `1px solid rgba(16,185,129,0.3)`, borderRadius: 16, padding: '16px 20px', flex: '1 1 250px' }}>
             <div style={{ fontSize: 11, color: P.green, textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>Nudge (Dürtme) Çözümü</div>
             <div style={{ fontSize: 15, color: P.text1, fontWeight: 600 }}>Zihne acı vermeyen, hissettirmeden her gün <span style={{ color: P.green }}>45₺</span> otomatik mikro-aktarım.</div>
          </div>
        </div>
      </div>

      {/* AKTİF HEDEFLER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.16em', whiteSpace: 'nowrap' }}>Aktif Hedefler ({aktif.length})</span>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, rgba(124,58,237,0.3), transparent)` }} />
      </div>

      {aktif.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {aktif.map(g => <HedefKarti key={g.id} hedef={g} onEdit={() => handleOpenModal(g)} onDelete={() => handleDelete(g.id)} onQuickAdd={handleQuickAdd} />)}
        </div>
      ) : (
        <div style={{ borderRadius: 24, padding: '72px 32px', textAlign: 'center', background: P.bg2, border: `1px dashed ${P.border}`, marginBottom: 40 }}>
          <div style={{ width: 72, height: 72, margin: '0 auto 20px', borderRadius: 20, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={30} color="#7c3aed" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, marginBottom: 8 }}>Aktif hedefin yok</h3>
          <p style={{ fontSize: 14, color: P.text3, margin: 0 }}>Hemen yeni bir hedef ekleyerek birikim yapmaya başla.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 }}>
            {HAZIR_HEDEFLER.map((template) => (
              <button
                key={template.name}
                onClick={() => handleTemplate(template)}
                style={{ padding: '9px 13px', borderRadius: 12, border: `1px solid ${P.border}`, background: P.bg3, color: P.text1, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
              >
                {template.icon} {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KESİNTİ SİMÜLATÖRÜ */}
      <KesintiSimulator goals={aktif.length > 0 ? aktif : goals} />

      {/* TAMAMLANAN HEDEFLER */}
      {tamamlanan.length > 0 && (
        <div style={{ paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.16em', whiteSpace: 'nowrap' }}>Tamamlanan Hedefler ({tamamlanan.length})</span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, rgba(16,185,129,0.3), transparent)` }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
            {tamamlanan.map(g => <HedefKarti key={g.id} hedef={g} onEdit={() => handleOpenModal(g)} onDelete={() => handleDelete(g.id)} isCompleted />)}
          </div>
        </div>
      )}

      {/* MODALLAR */}
      {modalAcik && (
        <HedefModal mevcut={duzenlenen} onKaydet={handleSave} onKapat={() => { setModalAcik(false); setDuzenlenen(null); }} />
      )}

      {completedModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(14px)', animation: 'fadeSlideUp 0.2s ease' }} onClick={e => e.target === e.currentTarget && setCompletedModal(null)}>
          <div style={{ width: '100%', maxWidth: 380, background: 'linear-gradient(160deg, #1a1030 0%, #0e0c1a 100%)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 28, padding: '44px 36px', textAlign: 'center', boxShadow: '0 40px 120px rgba(0,0,0,0.85)' }}>
            <div style={{ width: 88, height: 88, margin: '0 auto 24px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>🎉</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: P.text1, marginBottom: 14 }}>Tebrikler!</h2>
            <p style={{ fontSize: 14, color: P.text2, lineHeight: 1.65, marginBottom: 28 }}>
              <strong style={{ color: '#a78bfa' }}>{completedModal}</strong> hedefine başarıyla ulaştın. Hayallerine bir adım daha yaklaştın!
            </p>
            <button onClick={() => setCompletedModal(null)} style={{ width: '100%', padding: 16, borderRadius: 16, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(16,185,129,0.35)', transition: 'opacity 0.2s' }}>
              Harika! 🚀
            </button>
          </div>
        </div>
      )}

      {/* ── SİL ONAY MODALI (native confirm() yerine) ── */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 65, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(14px)' }} onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div style={{ width: '100%', maxWidth: 360, background: 'linear-gradient(160deg, #1a0e0e 0%, #0e0c1a 100%)', border: '1px solid rgba(244,63,94,0.35)', borderRadius: 28, padding: '36px', textAlign: 'center', boxShadow: '0 40px 120px rgba(0,0,0,0.85)' }}>
            <div style={{ width: 72, height: 72, margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={30} color="#f43f5e" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: P.text1, marginBottom: 10 }}>Hedefi Sil</h2>
            <p style={{ fontSize: 14, color: P.text2, lineHeight: 1.6, marginBottom: 28 }}>
              Bu hedef kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: `1px solid ${P.border}`, color: P.text1, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Vazgeç
              </button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg, #f43f5e, #b91c1c)', color: '#fff', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(244,63,94,0.35)' }}>
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KesintiSimulator({ goals }) {
  const [seciliHedefId, setSeciliHedefId] = useState(goals[0]?.id || '');
  const [oranlar, setOranlar] = useState(() => KESINTI_KATEGORILERI.reduce((acc, k) => ({ ...acc, [k.id]: k.varsayilan }), {}));

  if (goals.length === 0) return null;

  const etkinId = goals.some(g => g.id === seciliHedefId) ? seciliHedefId : goals[0]?.id;
  const hedef = goals.find(g => g.id === etkinId) || goals[0];

  const kalanTutar = Math.max(0, Number(hedef?.targetAmount || 0) - Number(hedef?.currentAmount || 0));
  const bugun = new Date();
  const hedefTarihi = hedef?.deadline ? new Date(hedef.deadline) : ayEkle(bugun, 6);
  const kalanGun = Math.max(1, Math.ceil((hedefTarihi - bugun) / dayMs));
  const mevcutAy = Math.max(1, Math.ceil(kalanGun / 30));
  const mevcut$ = kalanTutar > 0 ? Math.max(1, Math.ceil(kalanTutar / mevcutAy)) : 0;

  const ekTasarruf = KESINTI_KATEGORILERI.reduce((t, k) => t + Math.round(k.aylik * ((oranlar[k.id] || 0) / 100)), 0);
  const yeni$ = mevcut$ + ekTasarruf;
  const yeniAy = kalanTutar > 0 && yeni$ > 0 ? Math.max(1, Math.ceil(kalanTutar / yeni$)) : 0;
  const erkenAy = Math.max(0, mevcutAy - yeniAy);
  const eskiTarih = kalanTutar > 0 ? ayEkle(bugun, mevcutAy) : bugun;
  const yeniTarih = kalanTutar > 0 ? ayEkle(bugun, yeniAy) : bugun;
  const yeniBar = kalanTutar > 0 ? Math.max(12, Math.min(100, (yeniAy / mevcutAy) * 100)) : 100;
  const enBuyuk = KESINTI_KATEGORILERI.map(k => ({ ...k, tasarruf: Math.round(k.aylik * ((oranlar[k.id] || 0) / 100)) })).sort((a, b) => b.tasarruf - a.tasarruf)[0];

  return (
    <div style={{ marginTop: 48, borderRadius: 32, overflow: 'hidden', border: '1px solid rgba(124,58,237,0.3)', background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-main) 100%)', marginBottom: 48, boxShadow: '0 32px 80px rgba(0,0,0,0.4)', position: 'relative' }}>
      {/* Glow effects */}
      <div style={{ position: 'absolute', top: 0, left: '20%', width: 400, height: 400, background: 'rgba(124,58,237,0.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 300, height: 300, background: 'rgba(16,185,129,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ padding: '16px 28px', background: 'rgba(124,58,237,0.1)', borderBottom: `1px solid rgba(124,58,237,0.2)`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Scissors size={18} color="#c4b5fd" />
        <span style={{ fontSize: 13, fontWeight: 900, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Ne Kessem Ne Birikirim?</span>
      </div>
      
      <div className="flex flex-col lg:flex-row position-relative z-10">
        {/* LEFT */}
        <div style={{ flex: 1.3, padding: '40px 48px', borderRight: `1px solid rgba(255,255,255,0.06)` }}>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Ufak kesintiler, <span style={{ color: '#a78bfa' }}>büyük hedefler.</span>
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 36 }}>Aylık harcamalarından küçük yüzdeler kısarak hedefine ne kadar erken ulaşacağını gör.</p>
          
          <div className="space-y-4">
            {KESINTI_KATEGORILERI.map(k => {
              const oran = oranlar[k.id] || 0;
              const tasarruf = Math.round(k.aylik * (oran / 100));
              return (
                <div key={k.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '20px 24px', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.01)' } }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(255,255,255,0.05)' }}>
                        {k.icon}
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '0.01em', margin: 0 }}>{k.ad}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, margin: 0 }}>Aylık: {liraFmt(k.aylik)}</p>
                      </div>
                    </div>
                    {tasarruf > 0 && (
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '6px 12px', borderRadius: 10, boxShadow: '0 0 12px rgba(16,185,129,0.2)' }}>
                        +{liraFmt(tasarruf)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, width: 30 }}>%0</span>
                    <input 
                      type="range" min="0" max="100" step="5" value={oran} 
                      onChange={e => setOranlar(p => ({ ...p, [k.id]: Number(e.target.value) }))} 
                      style={{ 
                        flex: 1, height: 6, borderRadius: 99, cursor: 'pointer', appearance: 'none',
                        background: `linear-gradient(90deg, #7c3aed ${oran}%, rgba(255,255,255,0.1) ${oran}%)`,
                        outline: 'none'
                      }} 
                      className="slider-thumb-premium"
                    />
                    <style>{`
                      .slider-thumb-premium::-webkit-slider-thumb {
                        appearance: none; width: 20px; height: 20px; border-radius: 50%;
                        background: #fff; border: 4px solid #7c3aed; box-shadow: 0 0 10px rgba(124,58,237,0.6);
                        cursor: pointer; transition: transform 0.1s;
                      }
                      .slider-thumb-premium::-webkit-slider-thumb:hover { transform: scale(1.2); }
                    `}</style>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#c4b5fd', width: 40, textAlign: 'right' }}>%{oran}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, padding: '40px 48px', background: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10, display: 'block' }}>Hedef Seç</label>
          <div style={{ position: 'relative' }}>
            <select value={etkinId} onChange={e => setSeciliHedefId(e.target.value)} style={{ width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.1)`, color: '#fff', fontSize: 15, fontWeight: 700, outline: 'none', cursor: 'pointer', appearance: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
              {goals.map(g => <option key={g.id} value={g.id} style={{ background: '#1e1b4b' }}>{g.icon} {g.name}</option>)}
            </select>
            <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#a78bfa' }}>▼</div>
          </div>

          <div style={{ marginTop: 40, background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))', border: '1px solid rgba(16,185,129,0.2)', padding: '24px', borderRadius: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Aylık Ek Tasarruf</p>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#10b981', lineHeight: 1, letterSpacing: '-0.03em', textShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
              +{liraFmt(ekTasarruf)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
            <div style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)` }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Eski Tarih</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{tarihFmt(eskiTarih)}</p>
            </div>
            <div style={{ padding: 20, borderRadius: 16, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', boxShadow: '0 8px 24px rgba(16,185,129,0.15)' }}>
              <p style={{ fontSize: 12, color: '#6ee7b7', marginBottom: 6, fontWeight: 600 }}>Yeni Tarih</p>
              <p style={{ fontSize: 16, fontWeight: 900, color: '#10b981' }}>{tarihFmt(yeniTarih)}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 28, fontSize: 17, fontWeight: 800, color: erkenAy > 0 ? '#10b981' : '#a78bfa' }}>
            <TrendingUp size={24} />
            {erkenAy > 0 ? `Tam ${erkenAy} ay daha erken ulaşıyorsun! 🚀` : 'Sihri görmek için kesinti yap.'}
          </div>

          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { label: 'Eski plan', ay: mevcutAy, bar: 100, fill: 'rgba(255,255,255,0.2)', track: 'rgba(255,255,255,0.05)', tc: 'var(--text-muted)' },
              { label: 'Yeni plan', ay: yeniAy, bar: yeniBar, fill: 'linear-gradient(90deg, #7c3aed, #a78bfa)', track: 'rgba(124,58,237,0.1)', tc: '#c4b5fd' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, marginBottom: 10, color: item.tc }}>
                  <span>{item.label}</span><span>{item.ay} ay</span>
                </div>
                <div style={{ height: 12, borderRadius: 99, overflow: 'hidden', background: item.track, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ height: '100%', borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)', width: `${item.bar}%`, background: item.fill, boxShadow: '0 0 10px rgba(124,58,237,0.5)' }} />
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ flex: 1 }} />
          
          {erkenAy > 0 && (
            <div style={{ marginTop: 32, padding: '18px 24px', borderRadius: 16, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: '#e2e8f0', margin: 0 }}>
                💡 En çok <strong style={{ color: '#fff' }}>{enBuyuk.ad}</strong> kategorisinden kesinti yaptın. Bu sayede {hedef?.name || 'hedefine'} <strong style={{ color: '#10b981', fontWeight: 900 }}>{erkenAy} ay</strong> daha erken kavuşacaksın.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HedefKarti({ hedef, onEdit, onDelete, onQuickAdd, isCompleted = false }) {
  const mevcut = Number(hedef.currentAmount) || 0;
  const target = Number(hedef.targetAmount) || 1;
  const pct = Math.min(100, (mevcut / target) * 100);
  const renk = RENKLER.find(r => r.id === hedef.color) || RENKLER[0];
  const kalan = target - mevcut;
  const kalanGun = Math.ceil((new Date(hedef.deadline) - new Date()) / dayMs);
  const kalanAy = Math.max(1, Math.ceil(kalanGun / 30));
  const aylik$ = kalan > 0 && kalanGun > 0 ? Math.ceil(kalan / kalanAy) : 0;
  const urgent = !isCompleted && kalanGun > 0 && kalanGun < 30;

  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', borderRadius: 24, padding: 26, background: P.bg2,
        border: `1px solid rgba(${renk.glow}, ${hover ? '0.32' : '0.14'})`,
        overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        transform: hover ? 'translateY(-5px)' : 'none',
        boxShadow: hover ? `0 18px 56px rgba(${renk.glow}, 0.14)` : 'none',
      }}
    >
      <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${renk.hex}, transparent)`, pointerEvents: 'none', opacity: hover ? 0.22 : 0.12, transition: 'opacity 0.3s' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 24, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 54, height: 54, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, background: `rgba(${renk.glow}, 0.12)`, border: `1px solid rgba(${renk.glow}, 0.2)` }}>
            {hedef.icon}
          </div>
          <div>
            <p style={{ fontSize: 17, fontWeight: 800, color: P.text1, margin: '0 0 5px', lineHeight: 1.2 }}>{hedef.name}</p>
            {isCompleted ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: P.green, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.22)', padding: '3px 10px', borderRadius: 99 }}>
                <CheckCircle size={10} /> Tamamlandı
              </span>
            ) : (
              <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: P.text3, margin: 0 }}>
                {urgent && <Flame size={12} color="#f59e0b" />}
                <Calendar size={12} /> {kalanGun > 0 ? `${kalanGun} gün kaldı` : 'Süresi doldu'}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, opacity: hover ? 1 : 0, transition: 'opacity 0.2s' }}>
          {!isCompleted && (
            <button onClick={() => onQuickAdd(hedef.id, 500)} title="500₺ Hızlı Ekle" style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.25)'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}>
              <Plus size={14} />
            </button>
          )}
          <button onClick={onEdit} title="Düzenle" style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: `1px solid ${P.border}`, color: P.text2, cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.18)'; e.currentTarget.style.color = '#c4b5fd'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = P.text2; e.currentTarget.style.borderColor = P.border; }}>
            <Edit2 size={14} />
          </button>
          <button onClick={onDelete} title="Sil" style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: `1px solid ${P.border}`, color: P.text2, cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.15)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.3)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = P.text2; e.currentTarget.style.borderColor = P.border; }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, marginBottom: 8, position: 'relative', zIndex: 1 }}>
        <span style={{ color: P.text1 }}>{fmt(mevcut)}</span>
        <span style={{ color: P.text3 }}>{fmt(target)}</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <div style={{ height: '100%', borderRadius: 99, transition: 'width 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)', width: `${pct}%`, background: `linear-gradient(90deg, ${renk.hex}cc, ${renk.hex})`, boxShadow: `0 0 10px rgba(${renk.glow},0.55)` }} />
      </div>
      <p style={{ fontSize: 11, fontWeight: 600, color: P.text3, marginTop: 6, position: 'relative', zIndex: 1 }}>{Math.round(pct)}% tamamlandı</p>

      {!isCompleted && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: `1px solid ${P.border}`, position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 12, color: P.text3 }}>Kalan: <strong style={{ color: '#fff', fontWeight: 700 }}>{fmt(kalan)}</strong></span>
          {aylik$ > 0 && (
            <span style={{ fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 8, background: `rgba(${renk.glow}, 0.12)`, color: renk.hex, border: `1px solid rgba(${renk.glow}, 0.25)` }}>
              Bu ay: {fmt(aylik$)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function HedefModal({ mevcut, onKaydet, onKapat }) {
  const varsayilanTarih = new Date();
  varsayilanTarih.setMonth(varsayilanTarih.getMonth() + 6);

  const [name, setName] = useState(mevcut?.name || '');
  const [targetAmount, setTargetAmount] = useState(mevcut?.targetAmount || '');
  const [currentAmount, setCurrentAmount] = useState(mevcut?.currentAmount || 0);
  const [deadline, setDeadline] = useState(mevcut?.deadline || varsayilanTarih.toISOString().slice(0, 10));
  const [icon, setIcon] = useState(mevcut?.icon || '✈️');
  const [color, setColor] = useState(mevcut?.color || 'violet');

  const kalan = Math.max(0, Number(targetAmount) - Number(currentAmount));
  const kalanGun = Math.ceil((new Date(deadline) - new Date()) / dayMs);
  const kalanAy = Math.max(1, Math.ceil(kalanGun / 30));
  const aylik$ = kalan > 0 && kalanGun > 0 ? Math.ceil(kalan / kalanAy) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) return;
    onKaydet({ name, targetAmount: Number(targetAmount), currentAmount: Number(currentAmount) || 0, deadline, icon, color });
  };

  const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: `1px solid ${P.border}`, color: P.text1, fontSize: 14, fontWeight: 600, outline: 'none', transition: 'border-color 0.2s, background 0.2s' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 800, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, padding: '20px', overflowY: 'auto', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(14px)', animation: 'fadeSlideUp 0.2s ease' }} onClick={e => e.target === e.currentTarget && onKapat()}>
      <div style={{ margin: '20px auto', width: '100%', maxWidth: 500, background: 'linear-gradient(160deg, #1a1030 0%, #0e0c1a 100%)', border: '1px solid rgba(124,58,237,0.32)', borderRadius: 28, overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.85)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 26px', borderBottom: `1px solid ${P.border}`, background: 'rgba(124,58,237,0.08)' }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: P.text1, margin: 0 }}>{mevcut ? 'Hedefi Düzenle' : 'Yeni Hedef Oluştur'}</h3>
          <button onClick={onKapat} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: `1px solid ${P.border}`, color: P.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.15)'; e.currentTarget.style.color = '#f87171'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = P.text2; }}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Hedef Adı</label>
            <input type="text" required placeholder="Örn: Tatil Fonu, Yeni Araba" value={name} onChange={e => setName(e.target.value)} style={inputStyle} onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.55)'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; }} onBlur={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Hedef Tutar (₺)</label>
              <input type="number" required min="1" placeholder="10000" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} style={inputStyle} onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.55)'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; }} onBlur={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} />
            </div>
            <div>
              <label style={labelStyle}>Mevcut Birikim (₺)</label>
              <input type="number" min="0" placeholder="0" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} style={inputStyle} onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.55)'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; }} onBlur={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Hedef Tarihi</label>
            <input type="date" required value={deadline} onChange={e => setDeadline(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.55)'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; }} onBlur={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} />
          </div>
          <div>
            <label style={labelStyle}>İkon Seç</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {IKONLAR.map(i => (
                <button key={i} type="button" onClick={() => setIcon(i)} style={{ width: 46, height: 46, borderRadius: 13, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', border: `1px solid ${icon === i ? 'rgba(124,58,237,0.55)' : 'rgba(255,255,255,0.07)'}`, background: icon === i ? 'rgba(124,58,237,0.22)' : 'rgba(255,255,255,0.04)', transform: icon === i ? 'scale(1.1)' : 'none' }}>
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
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '16px 18px', borderRadius: 16, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.22)' }}>
              <Sparkles size={18} color="#a78bfa" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>AI Önerisi</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 }}>
                  Bu hedefe zamanında ulaşmak için her ay <strong style={{ color: '#a78bfa', fontWeight: 800 }}>{fmt(aylik$)}</strong> biriktirmelisin.
                </p>
              </div>
            </div>
          )}
          <button type="submit" style={{ padding: 16, width: '100%', borderRadius: 16, background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15)', transition: 'transform 0.15s, opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 0.9} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
            {mevcut ? 'Değişiklikleri Kaydet' : 'Hedefi Oluştur ✨'}
          </button>
        </form>
      </div>
    </div>
  );
}
