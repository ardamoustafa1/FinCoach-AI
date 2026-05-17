import { useState } from 'react';
import { Scissors, TrendingUp } from 'lucide-react';
import { KESINTI_KATEGORILERI, liraFmt, ayEkle, tarihFmt, DAY_MS } from '../../utils/goalHelpers';

export default function KesintiSimulator({ goals }) {
  const [seciliHedefId, setSeciliHedefId] = useState(goals[0]?.id || '');
  const [oranlar, setOranlar] = useState(() =>
    KESINTI_KATEGORILERI.reduce((acc, k) => ({ ...acc, [k.id]: k.varsayilan }), {})
  );

  if (goals.length === 0) return null;

  const etkinId = goals.some((g) => g.id === seciliHedefId) ? seciliHedefId : goals[0]?.id;
  const hedef = goals.find((g) => g.id === etkinId) || goals[0];

  const kalanTutar = Math.max(0, Number(hedef?.targetAmount || 0) - Number(hedef?.currentAmount || 0));
  const bugun = new Date();
  const hedefTarihi = hedef?.deadline ? new Date(hedef.deadline) : ayEkle(bugun, 6);
  const kalanGun = Math.max(1, Math.ceil((hedefTarihi - bugun) / DAY_MS));
  const mevcutAy = Math.max(1, Math.ceil(kalanGun / 30));
  const mevcut$ = kalanTutar > 0 ? Math.max(1, Math.ceil(kalanTutar / mevcutAy)) : 0;

  const ekTasarruf = KESINTI_KATEGORILERI.reduce(
    (t, k) => t + Math.round(k.aylik * ((oranlar[k.id] || 0) / 100)),
    0
  );
  const yeni$ = mevcut$ + ekTasarruf;
  const yeniAy = kalanTutar > 0 && yeni$ > 0 ? Math.max(1, Math.ceil(kalanTutar / yeni$)) : 0;
  const erkenAy = Math.max(0, mevcutAy - yeniAy);
  const eskiTarih = kalanTutar > 0 ? ayEkle(bugun, mevcutAy) : bugun;
  const yeniTarih = kalanTutar > 0 ? ayEkle(bugun, yeniAy) : bugun;
  const yeniBar = kalanTutar > 0 ? Math.max(12, Math.min(100, (yeniAy / mevcutAy) * 100)) : 100;
  const enBuyuk = KESINTI_KATEGORILERI.map((k) => ({
    ...k,
    tasarruf: Math.round(k.aylik * ((oranlar[k.id] || 0) / 100)),
  })).sort((a, b) => b.tasarruf - a.tasarruf)[0];

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
                <div key={k.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '20px 24px', transition: 'transform 0.2s' }}>
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
