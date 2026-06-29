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

  useEffect(() => {
    trackPageView(location.pathname);
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
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', zIndex: 9998, background: 'rgba(245, 158, 11, 0.95)', color: '#000', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, boxShadow: '0 4px 12px rgba(245,158,11,0.3)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🧪</span>
          Demo Modu — AI yanıtları simüle edilmektedir
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
        {/* Top Bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30, minHeight: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          padding: '0 12px', background: 'var(--header-bg)', backdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${P.border}`, flexWrap: 'nowrap'
        }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.24em', color: '#a78bfa', margin: 0 }}>FinCoach AI</p>
            <p className="hidden sm:block" style={{ fontSize: 13, color: P.text2, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Akıllı bütçe, hedef ve harcama koçu</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              onClick={startListeningGlobal}
              disabled={isListening}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px', borderRadius: 10,
                border: `1px solid ${isListening ? P.red : 'rgba(124,58,237,0.2)'}`,
                background: isListening ? 'rgba(239, 68, 68, 0.15)' : 'rgba(124,58,237,0.1)',
                color: isListening ? P.red : '#c4b5fd',
                cursor: isListening ? 'wait' : 'pointer', transition: 'background 0.2s',
                fontWeight: 700, fontSize: 12, flexShrink: 0
              }}
            >
              {isListening ? <Mic className="animate-pulse" size={16} /> : <Mic size={16} />}
              <span className="hidden sm:inline">Sesle Ekle</span>
            </button>
            <button
              onClick={() => setShowQrModal(true)}
              className="hidden md:flex"
              style={{
                alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10,
                border: '1px solid rgba(124,58,237,0.2)', background: 'rgba(124,58,237,0.1)',
                cursor: 'pointer', transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
            >
              <QrCode size={16} color="#c4b5fd" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#c4b5fd' }}>Sunum QR</span>
            </button>
            <div className="hidden md:flex" style={{
              alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10,
              border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.1)'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: P.green, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#6ee7b7' }}>Demo hazır</span>
            </div>
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} onToggle={onToggleTheme} />
          </div>
        </header>

        {showWeeklySummary && (
          <div style={{ padding: '32px 24px 0 24px', maxWidth: 1540, margin: '0 auto' }}>
            <div style={{
              padding: 1, borderRadius: 16, background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
              animation: 'fadeSlideUp 0.4s ease', boxShadow: '0 12px 32px rgba(124,58,237,0.15)'
            }}>
              <div style={{
                background: P.bg2, borderRadius: 16, padding: '16px 20px',
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={22} color="#a78bfa" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: P.text1, margin: '0 0 4px 0' }}>Haftalık Özeti</h3>
                    <p style={{ fontSize: 14, color: P.text2, margin: 0 }}>
                      Geçen hafta <strong style={{ color: P.red, fontWeight: 800 }}>{fmt(haftalik.total)}</strong> harcadın, bu haftaki hedefin <strong style={{ color: P.green, fontWeight: 800 }}>{fmt(2000)}</strong>.
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeWeeklySummary}
                  style={{
                    padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${P.border}`, color: P.text1, fontSize: 12, fontWeight: 800,
                    cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                >
                  Anladım
                </button>
              </div>
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
            <Outlet />
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
