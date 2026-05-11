import { useState } from 'react';
import {
  Plus, Target, Calendar, Edit2, Trash2, X,
  CheckCircle, Sparkles, Scissors, TrendingUp, Flame, Wallet, CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getGoals, addGoal, updateGoal, deleteGoal } from '../utils/storage';
import { fmt } from '../utils/categories';

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

const P = {
  purple: '#7C3AED', green: '#10B981', red: '#EF4444',
  bg2: '#141728', bg3: '#1C2038',
  border: 'rgba(255,255,255,0.06)',
  text1: '#F1F5F9', text2: '#94A3B8', text3: '#64748B',
};

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
  const [goals, setGoals] = useState(() => getGoals());
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState(null);
  const [completedModal, setCompletedModal] = useState(null);

  const handleOpenModal = (g = null) => { setDuzenlenen(g); setModalAcik(true); };

  const refreshGoals = () => {
    setGoals(getGoals());
  };

  const handleSave = async (yeniHedef) => {
    const wasIncomplete = !duzenlenen || Number(duzenlenen.currentAmount) < Number(duzenlenen.targetAmount);
    
    if (duzenlenen) {
      await updateGoal(duzenlenen.id, yeniHedef);
    } else {
      await addGoal(yeniHedef);
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
    if (confirm('Bu hedefi silmek istediğinize emin misiniz?')) {
      await deleteGoal(id);
      refreshGoals();
    }
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

  const aktif = goals.filter(g => Number(g.currentAmount) < Number(g.targetAmount));
  const tamamlanan = goals.filter(g => Number(g.currentAmount) >= Number(g.targetAmount));
  const totalTarget = goals.reduce((s, g) => s + Number(g.targetAmount), 0);
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

      {/* AKTİF HEDEFLER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.16em', whiteSpace: 'nowrap' }}>Aktif Hedefler ({aktif.length})</span>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, rgba(124,58,237,0.3), transparent)` }} />
      </div>

      {aktif.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {aktif.map(g => <HedefKarti key={g.id} hedef={g} onEdit={() => handleOpenModal(g)} onDelete={() => handleDelete(g.id)} />)}
        </div>
      ) : (
        <div style={{ borderRadius: 24, padding: '72px 32px', textAlign: 'center', background: P.bg2, border: `1px dashed ${P.border}`, marginBottom: 40 }}>
          <div style={{ width: 72, height: 72, margin: '0 auto 20px', borderRadius: 20, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={30} color="#7c3aed" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, marginBottom: 8 }}>Aktif hedefin yok</h3>
          <p style={{ fontSize: 14, color: P.text3, margin: 0 }}>Hemen yeni bir hedef ekleyerek birikim yapmaya başla.</p>
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
    <div style={{ borderRadius: 28, overflow: 'hidden', border: '1px solid rgba(124,58,237,0.22)', background: P.bg2, marginBottom: 48, boxShadow: '0 24px 60px rgba(0,0,0,0.1)' }}>
      <div style={{ padding: '14px 24px', background: 'linear-gradient(90deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.05) 100%)', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Scissors size={15} color="#c4b5fd" />
        <span style={{ fontSize: 12, fontWeight: 800, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Ne Kessem Ne Birikirim?</span>
      </div>
      <div className="flex flex-col lg:flex-row">
        {/* LEFT */}
        <div style={{ flex: 1.2, padding: '36px 40px', borderRight: `1px solid ${P.border}` }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: P.text1, marginBottom: 32, lineHeight: 1.35 }}>Küçük kesintilerin hedef tarihini nasıl değiştirdiğini gör.</p>
          <div className="space-y-6">
            {KESINTI_KATEGORILERI.map(k => {
              const oran = oranlar[k.id] || 0;
              const tasarruf = Math.round(k.aylik * (oran / 100));
              return (
                <div key={k.id}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: P.text1 }}>{k.icon} {k.ad}</p>
                      <p style={{ fontSize: 12, color: P.text3, marginTop: 2 }}>Aylık harcama: {liraFmt(k.aylik)}</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: P.green, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '4px 10px', borderRadius: 8, whiteSpace: 'nowrap' }}>+{liraFmt(tasarruf)}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 40px', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, color: P.text3 }}>%0</span>
                    <input type="range" min="0" max="100" step="5" value={oran} onChange={e => setOranlar(p => ({ ...p, [k.id]: Number(e.target.value) }))} style={{ width: '100%', height: 4, borderRadius: 99, cursor: 'pointer', background: 'rgba(255,255,255,0.1)', accentColor: '#7c3aed' }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#c4b5fd', textAlign: 'right' }}>%{oran}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ flex: 0.8, padding: '36px 32px', background: P.bg3 }}>
          <label style={{ fontSize: 11, fontWeight: 800, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, display: 'block' }}>Hedef seç</label>
          <select value={etkinId} onChange={e => setSeciliHedefId(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: `1px solid ${P.border}`, color: P.text1, fontSize: 14, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
            {goals.map(g => <option key={g.id} value={g.id} style={{ background: P.bg3 }}>{g.icon} {g.name}</option>)}
          </select>

          <div style={{ marginTop: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Aylık Ek Tasarruf</p>
            <div style={{ fontSize: 42, fontWeight: 900, color: P.green, lineHeight: 1, letterSpacing: '-0.02em' }}>+{liraFmt(ekTasarruf)}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 32 }}>
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: `1px solid ${P.border}` }}>
              <p style={{ fontSize: 11, color: P.text3, marginBottom: 5 }}>Mevcut tarih</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: P.text1 }}>{tarihFmt(eskiTarih)}</p>
            </div>
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <p style={{ fontSize: 11, color: 'rgba(52,211,153,0.7)', marginBottom: 5 }}>Yeni tarih</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: P.green }}>{tarihFmt(yeniTarih)}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, fontSize: 16, fontWeight: 800, color: P.green }}>
            <TrendingUp size={20} />
            {erkenAy > 0 ? `${erkenAy} ay daha erken ulaşırsın!` : 'Hedef aynı hızda ilerliyor.'}
          </div>

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Eski plan', ay: mevcutAy, bar: 100, fill: 'rgba(255,255,255,0.18)', track: 'rgba(255,255,255,0.05)', tc: P.text3 },
              { label: 'Yeni plan', ay: yeniAy, bar: yeniBar, fill: '#7c3aed', track: 'rgba(124,58,237,0.12)', tc: '#c4b5fd' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 8, color: item.tc }}>
                  <span>{item.label}</span><span>{item.ay} ay</span>
                </div>
                <div style={{ height: 8, borderRadius: 99, overflow: 'hidden', background: item.track }}>
                  <div style={{ height: '100%', borderRadius: 99, transition: 'width 0.5s ease', width: `${item.bar}%`, background: item.fill }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: '16px 18px', borderRadius: 16, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.22)' }}>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              {enBuyuk.ad} harcamasını %{oranlar[enBuyuk.id] || 0} azaltırsan, {hedef?.name || 'hedefine'}&nbsp;
              <strong style={{ color: P.green, fontWeight: 800 }}>{erkenAy} ay daha erken</strong> ulaşırsın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HedefKarti({ hedef, onEdit, onDelete, isCompleted = false }) {
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(14px)', animation: 'fadeSlideUp 0.2s ease' }} onClick={e => e.target === e.currentTarget && onKapat()}>
      <div style={{ width: '100%', maxWidth: 500, background: 'linear-gradient(160deg, #1a1030 0%, #0e0c1a 100%)', border: '1px solid rgba(124,58,237,0.32)', borderRadius: 28, overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.85)' }}>
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