import { useState, useMemo, useEffect, useRef } from 'react';
import {
  RefreshCw, X, Calendar, TrendingUp,
  Bell, CreditCard, Clock, ChevronRight, Zap, ArrowRightLeft, CheckCircle2, Loader2
} from 'lucide-react';
import { fmt } from '../utils/categories';
import { abonelikleriTespit, yaklasanYenilemeler } from '../utils/subscriptionDetector';

import { P } from '../styles/palette';
const DISMISS_KEY = 'fincoach_dismissed_subs';
function getDismissed() {
  try { return JSON.parse(localStorage.getItem(DISMISS_KEY) || '[]'); }
  catch { return []; }
}
function saveDismissed(list) {
  localStorage.setItem(DISMISS_KEY, JSON.stringify(list));
}

const MARKA_RENK = {
  netflix: { bg: 'rgba(219,92,78, 0.15)', text: '#DB5C4E', dot: '#DB5C4E' },
  spotify: { bg: 'rgba(63,199,146, 0.15)', text: '#3FC792', dot: '#3FC792' },
  'youtube premium': { bg: 'rgba(185,75,63, 0.15)', text: '#B94B3F', dot: '#B94B3F' },
  youtube: { bg: 'rgba(185,75,63, 0.15)', text: '#B94B3F', dot: '#B94B3F' },
  exxen: { bg: 'rgba(199,206,213, 0.15)', text: '#C7CED5', dot: '#C7CED5' },
  apple: { bg: 'rgba(107,112,117, 0.15)', text: 'var(--text-primary)', dot: '#6B7075' },
  amazon: { bg: 'rgba(192,112,92, 0.15)', text: '#C0705C', dot: '#C0705C' },
  disney: { bg: 'rgba(110,147,196, 0.15)', text: '#6E93C4', dot: '#6E93C4' },
};
function markaRenk(magaza) {
  const key = (magaza || '').toLowerCase();
  for (const [k, v] of Object.entries(MARKA_RENK)) {
    if (key.includes(k)) return v;
  }
  return { bg: 'rgba(139,148,157, 0.15)', text: '#8B949D', dot: '#8B949D' };
}

export default function SubscriptionsTab({ islemler }) {
  const [dismissed, setDismissed] = useState(() => getDismissed());

  const abonelikler = useMemo(
    () => abonelikleriTespit(islemler, dismissed),
    [islemler, dismissed]
  );

  const yaklasan = useMemo(
    () => yaklasanYenilemeler(abonelikler),
    [abonelikler]
  );

  const toplamAylik = abonelikler.reduce((t, a) => t + a.aylikTutar, 0);
  const toplamYillik = toplamAylik * 12;

  const handleDismiss = (key) => {
    const yeni = [...dismissed, key];
    setDismissed(yeni);
    saveDismissed(yeni);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
      {/* ── YAKLAŞAN YENİLEME UYARISI ── */}
      {yaklasan.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {yaklasan.map(ab => (
            <div
              key={ab.key}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 16,
                background: 'rgba(210,137,79, 0.1)', border: '1px solid rgba(210,137,79, 0.2)'
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(210,137,79, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bell size={18} color={P.amber} />
              </div>
              <p style={{ fontSize: 14, color: P.text1, flex: 1, margin: 0 }}>
                <strong style={{ fontWeight: 800 }}>{ab.magaza}</strong> {ab.gunAdi} yenileniyor — <strong style={{ color: P.amber }}>{fmt(ab.aylikTutar)}</strong> hazır olsun
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: P.amber, background: 'rgba(210,137,79, 0.1)', padding: '4px 10px', borderRadius: 8, flexShrink: 0 }}>
                <Clock size={12} />
                {ab.gunKaldi === 0 ? 'Bugün' : `${ab.gunKaldi} gün`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ÖZET KARTI ── */}
      <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(195,203,211, 0.08)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #C3CBD3, #7A828A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(195,203,211, 0.3)' }}>
            <RefreshCw size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: '0 0 2px 0' }}>Abonelik Özeti</h2>
            <p style={{ fontSize: 12, color: P.text2, margin: 0 }}>{abonelikler.length} aktif abonelik tespit edildi</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {/* Aylık Toplam */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, background: P.bg3, border: `1px solid ${P.border}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(219,92,78, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CreditCard size={20} color={P.red} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: P.text2, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>Aylık Gider</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: P.red, margin: 0 }}>{fmt(toplamAylik)}</p>
            </div>
          </div>

          {/* Yıllık Toplam */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, background: P.bg3, border: `1px solid ${P.border}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(210,137,79, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={20} color={P.amber} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: P.text2, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>Yıllık Tahmin</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: P.amber, margin: 0 }}>{fmt(toplamYillik)}</p>
            </div>
          </div>

          {/* Abonelik Sayısı */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, background: P.bg3, border: `1px solid ${P.border}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(139,148,157, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={20} color="#8B949D" />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: P.text2, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>Aktif Abonelik</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#8B949D', margin: 0 }}>{abonelikler.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ABONELİK KARTLARI ── */}
      {abonelikler.length === 0 ? (
        <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 48, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: 16, background: P.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={28} color={P.text2} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: P.text1, marginBottom: 4 }}>Abonelik bulunamadı</p>
          <p style={{ fontSize: 14, color: P.text2 }}>En az 2 ay düzenli tekrar eden ödeme tespit edilmedi.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {abonelikler.map(ab => (
            <AbonelikKarti
              key={ab.key}
              abonelik={ab}
              onDismiss={() => handleDismiss(ab.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Abonelik Kartı ──────────────────────────────────────────
function AbonelikKarti({ abonelik, onDismiss }) {
  const renk = markaRenk(abonelik.magaza);
  const sonrakiTarih = new Date(abonelik.sonrakiOdeme);
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const gunKaldi = Math.ceil((sonrakiTarih - bugun) / (1000 * 60 * 60 * 24));
  const yaklasiyorMu = gunKaldi >= 0 && gunKaldi <= 7;

  const [swapping, setSwapping] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const isNetflix = abonelik.magaza.toLowerCase().includes('netflix');

  const timerRef = useRef(null);
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleSwap = () => {
    setSwapping(true);
    timerRef.current = setTimeout(() => {
      setSwapping(false);
      setSwapped(true);
    }, 2500);
  };

  return (
    <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 20, position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Yaklaşıyor indicator */}
      {yaklasiyorMu && (
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <div style={{ width: 8, height: 8, background: P.amber, borderRadius: '50%', boxShadow: `0 0 8px ${P.amber}` }} />
        </div>
      )}

      {/* Üst: Logo + Mağaza + Tutar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: renk.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <RefreshCw size={20} color={renk.text} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: '0 0 2px 0' }}>{abonelik.magaza}</h3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: renk.bg, color: renk.text }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: renk.dot, flexShrink: 0 }} />
              {abonelik.kategori}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: P.red, margin: '0 0 2px 0' }}>{fmt(abonelik.aylikTutar)}</p>
          <p style={{ fontSize: 10, color: P.text2, fontWeight: 600, margin: 0 }}>/ ay</p>
        </div>
      </div>

      {/* Orta: Detaylar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: P.text2 }}>
            <Calendar size={12} /> Son ödeme
          </span>
          <span style={{ fontWeight: 600, color: P.text1 }}>{abonelik.sonOdeme}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: P.text2 }}>
            <ChevronRight size={12} /> Tahmini sonraki
          </span>
          <span style={{ fontWeight: 600, color: yaklasiyorMu ? P.amber : P.text1 }}>
            {abonelik.sonrakiOdeme}
            {yaklasiyorMu && (
              <span style={{ marginLeft: 6, fontSize: 10, padding: '2px 6px', borderRadius: 99, background: 'rgba(210,137,79, 0.15)', color: P.amber, fontWeight: 700 }}>
                {gunKaldi === 0 ? 'Bugün' : `${gunKaldi}g`}
              </span>
            )}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: P.text2 }}>
            <RefreshCw size={12} /> Tekrar sayısı
          </span>
          <span style={{ fontWeight: 600, color: P.text1 }}>{abonelik.tekrarSayisi} ay</span>
        </div>
      </div>

      {/* Alt: İşlem Butonları */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onDismiss}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', borderRadius: 12,
            fontSize: 12, fontWeight: 600, background: P.bg3, color: P.text2, border: `1px solid ${P.border}`, cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(219,92,78, 0.1)'; e.currentTarget.style.color = P.red; }}
          onMouseLeave={e => { e.currentTarget.style.background = P.bg3; e.currentTarget.style.color = P.text2; }}
        >
          <X size={12} /> Abonelik Değil
        </button>
        
        {isNetflix && !swapped && (
          <button
            onClick={handleSwap}
            disabled={swapping}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', borderRadius: 12,
              fontSize: 12, fontWeight: 700, background: '#9BA4AC', color: '#fff', border: 'none', cursor: swapping ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)', transition: 'all 0.2s'
            }}
          >
            {swapping ? <Loader2 size={12} className="animate-spin" /> : <ArrowRightLeft size={12} />}
            {swapping ? 'Geçiliyor...' : 'Mubi\'ye Geç (+120₺)'}
          </button>
        )}
        
        {isNetflix && swapped && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', borderRadius: 12,
            fontSize: 12, fontWeight: 700, background: 'rgba(63,199,146, 0.15)', color: '#3FC792', border: '1px solid rgba(63,199,146, 0.3)'
          }}>
             <CheckCircle2 size={12} /> Mubi Aktif
          </div>
        )}
      </div>
    </div>
  );
}
