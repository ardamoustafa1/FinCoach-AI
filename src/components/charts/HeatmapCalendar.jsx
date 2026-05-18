import { useState, useMemo } from 'react';
import { X } from 'lucide-react';

import { P } from '../../styles/palette';
const fmt = (v) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const GUN_ISIMLERI = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function getCellStyle(tutar, maxTutar, isSelected) {
  if (tutar === 0) {
    return { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', border: `1px solid ${isSelected ? '#7c3aed' : 'rgba(255,255,255,0.06)'}` };
  }
  const oran = Math.min(tutar / maxTutar, 1);
  let bg, color;
  if (oran < 0.25)      { bg = 'rgba(99,102,241,0.15)';  color = '#a5b4fc'; }
  else if (oran < 0.5)  { bg = 'rgba(99,102,241,0.28)';  color = '#818cf8'; }
  else if (oran < 0.75) { bg = 'rgba(99,102,241,0.45)';  color = '#e0e7ff'; }
  else                  { bg = 'rgba(124,58,237,0.75)';   color = '#ffffff'; }
  return { background: bg, color, border: `1px solid ${isSelected ? '#a78bfa' : 'rgba(124,58,237,0.2)'}` };
}

export default function HeatmapCalendar({ islemler }) {
  const [seciliGun, setSeciliGun] = useState(null);

  const { gunler, maxTutar, currentDate, prefixBase } = useMemo(() => {
    const now = new Date();
    const yil = now.getFullYear();
    const ay = now.getMonth() + 1; // 1-12
    const prefixBase = `${yil}-${String(ay).padStart(2, '0')}`;
    
    const gunSayisi = new Date(yil, ay, 0).getDate();
    const ilkGunHafta = (new Date(yil, ay - 1, 1).getDay() + 6) % 7;
    const gunMap = {};
    
    islemler.filter(i => i.tarih.startsWith(prefixBase)).forEach(i => {
      const gun = parseInt(i.tarih.split('-')[2], 10);
      gunMap[gun] = (gunMap[gun] || 0) + i.tutar;
    });
    let max = 0;
    const arr = [];
    for (let i = 0; i < ilkGunHafta; i++) arr.push(null);
    for (let d = 1; d <= gunSayisi; d++) {
      const t = gunMap[d] || 0;
      if (t > max) max = t;
      arr.push({ gun: d, tutar: t });
    }
    return { 
      gunler: arr, 
      maxTutar: max || 1,
      currentDate: new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
      prefixBase
    };
  }, [islemler]);

  const gunIslemleri = useMemo(() => {
    if (!seciliGun) return [];
    const prefix = `${prefixBase}-${String(seciliGun).padStart(2, '0')}`;
    return islemler.filter(i => i.tarih === prefix).sort((a, b) => b.tutar - a.tutar);
  }, [islemler, seciliGun, prefixBase]);

  return (
    <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(124,58,237,0.06)', filter: 'blur(36px)', pointerEvents: 'none' }} />
      <h2 style={{ fontSize: 17, fontWeight: 800, color: P.text1, letterSpacing: '-0.01em', marginBottom: 3 }}>Günlük Harcama Haritası</h2>
      <p style={{ fontSize: 12, color: P.text3, marginBottom: 16 }}>{currentDate} · Güne tıklayarak detay görün</p>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
        {GUN_ISIMLERI.map(g => (
          <div key={g} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: P.text3, padding: '4px 0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{g}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {gunler.map((g, i) => {
          if (!g) return <div key={`e${i}`} />;
          const isSelected = seciliGun === g.gun;
          const cellStyle = getCellStyle(g.tutar, maxTutar, isSelected);
          return (
            <button key={g.gun} onClick={() => setSeciliGun(isSelected ? null : g.gun)} style={{
              aspectRatio: '1',
              borderRadius: 8,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: isSelected ? '0 0 12px rgba(124,58,237,0.5)' : 'none',
              transform: isSelected ? 'scale(1.1)' : 'none',
              ...cellStyle,
            }}>
              <span style={{ fontWeight: 600, lineHeight: 1 }}>{g.gun}</span>
              {g.tutar > 0 && (
                <span style={{ fontSize: 9, lineHeight: 1, marginTop: 2, opacity: 0.85 }}>
                  {g.tutar >= 1000 ? `${(g.tutar / 1000).toFixed(1)}k` : Math.round(g.tutar)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 11, color: P.text3 }}>
        <span>Az</span>
        <div style={{ display: 'flex', gap: 3 }}>
          {['rgba(255,255,255,0.04)', 'rgba(99,102,241,0.15)', 'rgba(99,102,241,0.28)', 'rgba(99,102,241,0.45)', 'rgba(124,58,237,0.75)'].map((bg, i) => (
            <div key={i} style={{ width: 16, height: 11, borderRadius: 3, background: bg, border: '1px solid rgba(255,255,255,0.08)' }} />
          ))}
        </div>
        <span>Çok</span>
      </div>

      {/* Day modal */}
      {seciliGun && (
        <div onClick={() => setSeciliGun(null)} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, background: 'linear-gradient(160deg, #1a1030 0%, #0e0c1a 100%)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 24, padding: 28, boxShadow: '0 40px 120px rgba(0,0,0,0.8)', animation: 'slideUp 0.22s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: P.text1 }}>{seciliGun} {currentDate}</h3>
              <button onClick={() => setSeciliGun(null)} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: `1px solid ${P.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.text2 }}>
                <X size={15} />
              </button>
            </div>
            {gunIslemleri.length === 0 ? (
              <p style={{ textAlign: 'center', color: P.text3, padding: '24px 0', fontSize: 14 }}>Bu gün harcama yok 🎉</p>
            ) : (
              <>
                <p style={{ fontSize: 13, color: P.text2, marginBottom: 12 }}>
                  Toplam: <span style={{ fontWeight: 800, color: P.red }}>{fmt(gunIslemleri.reduce((s, t) => s + t.tutar, 0))}</span>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                  {gunIslemleri.map(tx => (
                    <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${P.border}` }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: P.text1 }}>{tx.aciklama}</p>
                        <p style={{ fontSize: 11, color: P.text3 }}>{tx.magaza} · {tx.kategori}</p>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: P.red }}>{fmt(tx.tutar)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
