import { useEffect, useMemo, useState, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sparkles, QrCode } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import ThemeToggle from './ThemeToggle';
import DemoQRCodeModal from './DemoQRCodeModal';
import FeatureTourModal from './FeatureTourModal';
import OfflineBanner from './OfflineBanner';
import SpeechFallbackModal from './SpeechFallbackModal';
import { useToast } from '../hooks/useToast';
import { fmt } from '../utils/categories';
import useStore from '../store/useStore';
import MicPermissionModal from './MicPermissionModal';
import {
  markWeeklySummarySeen,
  shouldShowWeeklySummary,
  upcomingSubscriptionReminders,
  weeklySummary,
} from '../utils/notifications';
import { trackPageView } from '../utils/analytics';
import { Mic } from 'lucide-react';
import { authFetch } from '../utils/api';

import { pageTitleFor } from '../config/pageTitles';
import { P } from '../styles/palette';
export default function Layout({ theme, onToggleTheme }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showMicModal, setShowMicModal] = useState(false);
  const [showWeeklySummary, setShowWeeklySummary] = useState(() => shouldShowWeeklySummary());
  const [showQrModal, setShowQrModal] = useState(false);
  const [fallbackModalOpen, setFallbackModalOpen] = useState(false);
  const [failedTranscript, setFailedTranscript] = useState('');
  const toast = useToast();
  const location = useLocation();
  const haftalik = useMemo(() => weeklySummary(useStore.getState().budgetLimits), []);
  const pageTitle = pageTitleFor(location.pathname);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  /* ── Premium giriş & scroll koreografisi ──────────────────────────────
     Sayfadaki her kart (.glass-card / .panel) hareketle gelir:
       · İlk ekranda olanlar  → sıralı (staggered) giriş, anında tetiklenir
       · Aşağıda kalanlar     → kaydırınca IntersectionObserver ile açılır
     Emniyet: gözlemci kurulamazsa hiçbir içerik gizli kalmaz.            */
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    let io;
    const timers = [];
    const timer = setTimeout(() => {
      const cards = document.querySelectorAll(
        '.page-content .glass-card:not([data-revealed]), .page-content .panel:not([data-revealed])',
      );
      if (!cards.length) return;

      try {
        io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          });
        }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
      } catch { io = null; }

      const vh = window.innerHeight;
      let aboveFold = 0;

      cards.forEach((el, i) => {
        el.setAttribute('data-revealed', '1');
        el.classList.add('reveal-lift');

        if (el.getBoundingClientRect().top < vh * 0.94) {
          // İlk ekran: sıralı giriş
          el.style.setProperty('--reveal-delay', `${Math.min(aboveFold, 8) * 85}ms`);
          aboveFold += 1;
          timers.push(setTimeout(() => el.classList.add('is-in'), 40));
        } else {
          el.style.setProperty('--reveal-delay', `${(i % 3) * 80}ms`);
          if (io) io.observe(el);
          else el.classList.add('is-in');
        }
      });

      // Emniyet ağı: 6 sn sonra hâlâ açılmamış kart kalmasın
      timers.push(setTimeout(() => {
        document.querySelectorAll('.page-content .reveal-lift:not(.is-in)').forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
        });
      }, 6000));
    }, 120);

    return () => {
      clearTimeout(timer);
      timers.forEach(clearTimeout);
      io?.disconnect();
    };
  }, [location.pathname]);

  useEffect(() => {
    upcomingSubscriptionReminders().forEach((abonelik) => {
      toast.warning(`${abonelik.magaza} ${abonelik.gunAdi} yenileniyor — ${fmt(abonelik.aylikTutar)} hazır olsun 📅`);
    });
  }, [toast]);

  const closeWeeklySummary = () => {
    markWeeklySummarySeen();
    setShowWeeklySummary(false);
  };

  const startListeningGlobal = async () => {
    // Check existing permission state
    let permState = 'prompt';
    try {
      const result = await navigator.permissions.query({ name: 'microphone' });
      permState = result.state; // 'granted' | 'denied' | 'prompt'
    } catch { /* Safari/Firefox may not support permissions.query for microphone */ }

    if (permState === 'denied') {
      toast.error('Mikrofon erişimi engellendi. Tarayıcı ayarlarından izin vermeniz gerekiyor.');
      return;
    }

    // Show our beautiful modal first if permission not yet granted
    if (permState === 'prompt') {
      setShowMicModal(true);
      return;
    }

    // Permission already granted — start directly
    doStartListening();
  };

  const doStartListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error('Tarayıcınız ses tanımayı desteklemiyor.'); return; }
    const recognition = new SR();
    recognition.lang = 'tr-TR'; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onstart = () => { setIsListening(true); toast.info('Dinliyorum... Konuşun.', { duration: 5000, icon: '🎤' }); };
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      if (!transcript || transcript.trim() === '') {
        toast.error('Ses algılanamadı, lütfen tekrar deneyin.');
        return;
      }
      toast.info(`Anlaşılan: "${transcript}". Analiz ediliyor...`, { duration: 10000, icon: '🧠' });
      try {
        const res = await authFetch('/api/voice', { method: 'POST', body: JSON.stringify({ text: transcript }) });
        if (!res.ok) {
            const errBody = await res.json().catch(()=>({}));
            throw new Error(errBody.error || 'API Hatası');
        }
        const data = await res.json();
        const yeniIslem = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), tarih: new Date().toISOString().slice(0, 10), tutar: data.tutar || '', magaza: data.magaza || '', aciklama: transcript, kategori: data.kategori || 'Diğer', tur: data.tur || 'gider', not: 'Sesli asistan ile eklendi' };
        if (!yeniIslem.tutar) { 
           setFailedTranscript(transcript);
           setFallbackModalOpen(true);
           toast.warning(`Tutar tam anlaşılamadı. Düzeltme önerileri açılıyor...`); 
           return; 
        }
        await useStore.getState().addTransaction(yeniIslem);
        toast.success(`${yeniIslem.magaza || 'İşlem'} (${fmt(yeniIslem.tutar)}) eklendi! ✨`);
        window.dispatchEvent(new Event('transaction_added'));
      } catch(err) { 
        setFailedTranscript(transcript);
        setFallbackModalOpen(true);
        toast.error(`Analiz hatası: ${err.message}. Lütfen manuel düzeltin.`); 
      }
    };
    recognition.onerror = (e) => { setIsListening(false); if (e.error !== 'no-speech') toast.error('Mikrofon hatası: ' + e.error); };
    recognition.onend = () => { setIsListening(false); };
    recognition.start();
  };

  const handleMicAllow = () => {
    setShowMicModal(false);
    doStartListening();
  };

  const handleMicDeny = () => {
    setShowMicModal(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-main)', transition: 'background-color 0.3s', overflowX: 'hidden' }}>
      {/* Çevrimdışı Mod Bildirimi — tüm sayfalarda otomatik görünür */}
      <OfflineBanner />

      {/* Demo Modu Bildirimi */}
      {useStore.getState().userProfile?.email?.includes('demo') && (
        <div style={{
          position: 'fixed', top: 76, left: '50%', transform: 'translateX(-50%)', zIndex: 9998,
          background: 'rgba(195,203,211,0.12)', border: '1px solid rgba(195,203,211,0.3)',
          backdropFilter: 'blur(18px)', color: P.goldLight,
          padding: '7px 15px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.02em',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 99, background: P.green }} />
          Demo modu — AI yanıtları simüle edilmektedir
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 transition-all duration-300" style={{ width: collapsed ? 80 : 260 }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* Main Content */}
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))', position: 'relative' }}>
        {/* Üst Bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30, minHeight: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          padding: '0 18px', background: 'var(--header-bg)',
          backdropFilter: 'blur(26px) saturate(150%)',
          WebkitBackdropFilter: 'blur(26px) saturate(150%)',
          borderBottom: '1px solid var(--border-color)', flexWrap: 'nowrap',
        }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)', lineHeight: 1.15 }}>
              {pageTitle}
            </p>
            <p className="hidden sm:block eyebrow" style={{ fontSize: 8.5, letterSpacing: '0.2em', marginTop: 2 }}>
              Akıllı bütçe · hedef · harcama koçu
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              onClick={startListeningGlobal}
              disabled={isListening}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 999,
                border: `1px solid ${isListening ? 'rgba(219,92,78,0.4)' : 'var(--border-color)'}`,
                background: isListening ? 'rgba(219,92,78,0.10)' : 'transparent',
                color: isListening ? P.red : 'var(--text-secondary)',
                cursor: isListening ? 'wait' : 'pointer',
                fontWeight: 600, fontSize: 12.5, flexShrink: 0, fontFamily: 'inherit',
                transition: 'all .35s var(--ease-out-expo)',
              }}
              onMouseEnter={e => { if (!isListening) { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
              onMouseLeave={e => { if (!isListening) { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
            >
              {isListening ? <Mic className="animate-pulse" size={15} /> : <Mic size={15} />}
              <span className="hidden sm:inline">Sesle Ekle</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="hidden md:flex"
              style={{
                alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 999,
                border: '1px solid var(--border-color)', background: 'transparent',
                color: 'var(--text-secondary)', cursor: 'pointer',
                fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
                transition: 'all .35s var(--ease-out-expo)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <QrCode size={15} />
              <span>Sunum QR</span>
            </button>

            <div className="hidden md:flex" style={{
              alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 999,
              border: '1px solid rgba(52,192,138,0.24)', background: 'rgba(52,192,138,0.07)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: P.green, animation: 'ping 2.4s ease-out infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: P.green }}>Demo hazır</span>
            </div>

            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} onToggle={onToggleTheme} />
          </div>
        </header>

        {showWeeklySummary && (
          <div style={{ padding: '26px 18px 0', maxWidth: 1540, margin: '0 auto' }}>
            <div className="glass-card animate-enter" style={{
              padding: '18px 22px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: 'rgba(195,203,211,0.11)', border: '1px solid rgba(195,203,211,0.2)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <Sparkles size={19} color={P.green} strokeWidth={1.7} />
                </span>
                <div>
                  <p className="eyebrow" style={{ fontSize: 9, marginBottom: 5 }}>Haftalık Özet</p>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Geçen hafta <strong className="num" style={{ color: P.red }}>{fmt(haftalik.total)}</strong> harcadınız;
                    bu haftaki hedefiniz <strong className="num" style={{ color: P.green }}>{fmt(2000)}</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={closeWeeklySummary}
                style={{
                  padding: '10px 18px', borderRadius: 999, background: 'transparent',
                  border: '1px solid var(--border-color)', color: 'var(--text-primary)',
                  fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit',
                  transition: 'all .35s var(--ease-out-expo)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                Anladım
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="page-content" style={{ maxWidth: 1540, margin: '0 auto', padding: '0 16px', width: '100%' }}>
          <Suspense fallback={
            <div style={{ flex: 1, padding: '32px 0', display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="skeleton-box" style={{ height: 32, width: 200, background: 'var(--bg-card)', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
                <div className="skeleton-box" style={{ height: 40, width: 40, borderRadius: '50%', background: 'var(--bg-card)', animation: 'pulse 1.5s infinite' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton-box" style={{ height: 120, background: 'var(--bg-card)', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />)}
              </div>
            </div>
          }>
            <div key={location.pathname} className="page-enter">
              <Outlet />
            </div>
          </Suspense>
        </div>
      </main>

      {showQrModal && (
        <DemoQRCodeModal onClose={() => setShowQrModal(false)} />
      )}

      {showMicModal && (
        <MicPermissionModal
          onAllow={handleMicAllow}
          onDeny={handleMicDeny}
        />
      )}
      
      <FeatureTourModal pathname={location.pathname} />
      
      <SpeechFallbackModal
        isOpen={fallbackModalOpen}
        onClose={() => setFallbackModalOpen(false)}
        transcript={failedTranscript}
        onSuccess={() => {
          window.dispatchEvent(new Event('transaction_added'));
        }}
      />
    </div>
  );
}
