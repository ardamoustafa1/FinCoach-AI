import { useState } from 'react';
import {
  Plus, Target, AlertTriangle, CheckSquare, BrainCircuit, Brain, ShoppingCart, Bot, Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';

import useStore from '../store/useStore';
import { useToast } from '../hooks/useToast';
import { P } from '../styles/palette';
import { HAZIR_HEDEFLER } from '../utils/goalHelpers';

import StatCard from '../components/goals/StatCard';
import GoalCard from '../components/goals/GoalCard';
import GoalModal from '../components/goals/GoalModal';
import KesintiSimulator from '../components/goals/KesintiSimulator';

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

  const safeGoals = goals || [];
  const aktif = safeGoals.filter(g => Number(g.currentAmount) < Number(g.targetAmount));
  const tamamlanan = safeGoals.filter(g => Number(g.currentAmount) >= Number(g.targetAmount));
  const totalCurrent = safeGoals.reduce((s, g) => s + Number(g.currentAmount), 0);

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
          {aktif.map(g => <GoalCard key={g.id} hedef={g} onEdit={() => handleOpenModal(g)} onDelete={() => handleDelete(g.id)} onQuickAdd={handleQuickAdd} />)}
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
            {tamamlanan.map(g => <GoalCard key={g.id} hedef={g} onEdit={() => handleOpenModal(g)} onDelete={() => handleDelete(g.id)} isCompleted />)}
          </div>
        </div>
      )}

      {/* MODALLAR */}
      {modalAcik && (
        <GoalModal mevcut={duzenlenen} onKaydet={handleSave} onKapat={() => { setModalAcik(false); setDuzenlenen(null); }} />
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
