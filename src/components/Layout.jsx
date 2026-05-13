import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sparkles, QrCode } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import ThemeToggle from './ThemeToggle';
import DemoQRCodeModal from './DemoQRCodeModal';
import { useToast } from '../hooks/useToast';
import { fmt } from '../utils/categories';
import { getBudgetLimits } from '../utils/storage';
import {
  markWeeklySummarySeen,
  shouldShowWeeklySummary,
  upcomingSubscriptionReminders,
  weeklySummary,
} from '../utils/notifications';
import { trackPageView } from '../utils/analytics';
import { Mic } from 'lucide-react';
import { authFetch } from '../utils/api';
import { saveTransaction } from '../utils/storage';

const P = {
  purple: '#7C3AED', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg1: 'var(--bg-sidebar)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', borderHover: 'var(--border-hover)',
  text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)',
};

export default function Layout({ theme, onToggleTheme }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showWeeklySummary, setShowWeeklySummary] = useState(() => shouldShowWeeklySummary());
  const [showQrModal, setShowQrModal] = useState(false);
  const toast = useToast();
  const location = useLocation();
  const haftalik = useMemo(() => weeklySummary(getBudgetLimits()), []);

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

  const startListeningGlobal = () => {
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
           toast.warning(`Tutar tam anlaşılamadı. Lütfen manuel ekleyin.`); 
           return; 
        }
        await saveTransaction(yeniIslem);
        toast.success(`${yeniIslem.magaza || 'İşlem'} (${fmt(yeniIslem.tutar)}) eklendi! ✨`);
        window.dispatchEvent(new Event('transaction_added'));
      } catch(err) { toast.error(`Analiz hatası: ${err.message}`); }
    };
    recognition.onerror = (e) => { setIsListening(false); if (e.error !== 'no-speech') toast.error('Mikrofon hatası: ' + e.error); };
    recognition.onend = () => { setIsListening(false); };
    recognition.start();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-main)', transition: 'background-color 0.3s' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 transition-all duration-300" style={{ width: collapsed ? 80 : 260 }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* Main Content */}
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden', paddingBottom: '96px', position: 'relative' }}>
        {/* Top Bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30, height: 72,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          padding: '0 24px', background: 'var(--header-bg)', backdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${P.border}`
        }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.24em', color: '#a78bfa', margin: 0 }}>FinCoach AI</p>
            <p className="hidden sm:block" style={{ fontSize: 13, color: P.text2, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Akıllı bütçe, hedef ve harcama koçu</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <button
              onClick={startListeningGlobal}
              disabled={isListening}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10,
                border: `1px solid ${isListening ? P.red : 'rgba(124,58,237,0.2)'}`,
                background: isListening ? 'rgba(239, 68, 68, 0.15)' : 'rgba(124,58,237,0.1)',
                color: isListening ? P.red : '#c4b5fd',
                cursor: isListening ? 'wait' : 'pointer', transition: 'background 0.2s',
                fontWeight: 700, fontSize: 12
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
        <div style={{ maxWidth: 1540, margin: '0 auto', padding: '0 24px', width: '100%' }}>
          <Outlet />
        </div>
      </main>

      {showQrModal && (
        <DemoQRCodeModal onClose={() => setShowQrModal(false)} />
      )}
    </div>
  );
}
