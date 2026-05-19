import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ArrowRight, LayoutDashboard, Target, Bot, Settings, ShieldCheck, 
  HeartPulse, Cpu, Landmark, Snowflake, Home, Waves, Calculator, Globe, 
  Network, Coins, Layers, Lock, Mic, ShieldAlert, Clock, BarChart4 
} from 'lucide-react';
import { P } from '../styles/palette';

const ROUTES = [
  { name: 'Ana Sayfa', path: '/', icon: LayoutDashboard },
  { name: 'Dashboard (Komuta Merkezi)', path: '/dashboard', icon: BarChart4 },
  { name: 'Varlık Yönetimi', path: '/wealth', icon: Landmark },
  { name: 'Küsürat Yatırımı', path: '/micro-invest', icon: Coins },
  { name: 'Borç Yapılandırma', path: '/debt-snowball', icon: Snowflake },
  { name: 'Freelancer Dengeleyici', path: '/freelancer-smoother', icon: Waves },
  { name: 'Vergi Asistanı', path: '/tax', icon: Calculator },
  { name: 'Ev & Kredi AI', path: '/real-estate', icon: Home },
  { name: 'Anomali & Fraud AI', path: '/anomaly', icon: ShieldAlert },
  { name: 'Harcama Simülatörü', path: '/shop-sim', icon: Target },
  { name: 'Market Basket Graph', path: '/graph-analysis', icon: Network },
  { name: 'Nakit Akışı', path: '/cashflow', icon: BarChart4 },
  { name: 'Stres Testi', path: '/stress-test', icon: Globe },
  { name: 'Sistem Mimarisi', path: '/system-monitor', icon: Cpu },
  { name: 'Federated AI (Gizlilik)', path: '/federated', icon: ShieldCheck },
  { name: 'Web3 Escrow (Güvenli Ödeme)', path: '/escrow', icon: Lock },
  { name: 'Financial ICU (Yoğun Bakım)', path: '/financial-icu', icon: HeartPulse },
  { name: 'Voice Biometric (Ses İzni)', path: '/voice-escrow', icon: Mic },
  { name: 'Data GAN (Sentetik Veri)', path: '/synthetic-data', icon: Layers },
  { name: 'Zaman Makinesi', path: '/time-machine', icon: Clock },
  { name: 'Hedefler ve Kumbaralar', path: '/goals', icon: Target },
  { name: 'AI Koç (Chat)', path: '/chat', icon: Bot },
  { name: 'Ayarlar ve Demo Yükle', path: '/settings', icon: Settings }
];

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Kısayol dinleyicisi (CMD+K / CTRL+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Modal açıldığında focus
  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden'; // Arkaplan scroll engelle
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  const filtered = ROUTES.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  // Arama değişince seçimi sıfırla
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Yön tuşları
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
    if (!filtered.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filtered.length);
      scrollToItem((selectedIndex + 1) % filtered.length);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      scrollToItem((selectedIndex - 1 + filtered.length) % filtered.length);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(filtered[selectedIndex].path);
    }
  };

  const scrollToItem = (index) => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[index];
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  };

  const handleSelect = (path) => {
    setOpen(false);
    navigate(path);
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '12vh', animation: 'fadeIn 0.2s ease-out'
    }} onClick={() => setOpen(false)}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDownK { from { opacity: 0; transform: translateY(-20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 640, margin: '0 16px',
          background: 'linear-gradient(145deg, #1A1D36, #0D0F1E)',
          borderRadius: 24, border: '1px solid rgba(124,58,237,0.5)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 0 40px rgba(124,58,237,0.15)',
          overflow: 'hidden', animation: 'slideDownK 0.25s cubic-bezier(0.16,1,0.3,1)'
        }}
      >
        {/* Input Bölümü */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
          <Search size={22} color={P.purpleLight} style={{ marginRight: 16 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ne yapmak istiyorsunuz? Sayfa veya özellik ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: 18, fontWeight: 500, fontFamily: 'inherit'
            }}
          />
          <div style={{ display: 'flex', gap: 6, position: 'absolute', right: 20 }}>
             <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 6, fontSize: 11, color: P.text3, fontWeight: 700, border: '1px solid rgba(255,255,255,0.05)' }}>ESC</kbd>
          </div>
        </div>

        {/* Sonuç Listesi */}
        <div ref={listRef} style={{ maxHeight: '50vh', minHeight: 120, overflowY: 'auto', padding: 12 }}>
          {filtered.length > 0 ? (
            filtered.map((r, i) => {
              const Icon = r.icon;
              const isActive = i === selectedIndex;
              return (
                <button
                  key={r.path}
                  onClick={() => handleSelect(r.path)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: 14,
                    background: isActive ? 'linear-gradient(90deg, rgba(124,58,237,0.2), rgba(124,58,237,0.05))' : 'transparent',
                    border: 'none', cursor: 'pointer', transition: 'all 0.1s',
                    color: isActive ? '#fff' : P.text2,
                    borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ 
                      width: 36, height: 36, borderRadius: 10, 
                      background: isActive ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isActive ? P.purpleLight : P.text3
                    }}>
                      <Icon size={18} />
                    </div>
                    <span style={{ fontSize: 15, fontWeight: isActive ? 700 : 500 }}>{r.name}</span>
                  </div>
                  {isActive && <ArrowRight size={16} color={P.purpleLight} />}
                </button>
              )
            })
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: P.text3 }}>
              <Search size={40} opacity={0.2} style={{ marginBottom: 16, margin: '0 auto' }} />
              <p style={{ fontSize: 16, fontWeight: 500, color: P.text2 }}>"{search}" için sonuç bulunamadı.</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>Başka bir anahtar kelime deneyin.</p>
            </div>
          )}
        </div>
        
        {/* Alt Bilgi */}
        <div style={{ padding: '12px 24px', background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 11, color: P.text3, display: 'flex', alignItems: 'center', gap: 6 }}>
            <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>↑</kbd>
            <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>↓</kbd> Gezin
          </span>
          <span style={{ fontSize: 11, color: P.text3, display: 'flex', alignItems: 'center', gap: 6 }}>
            <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>Enter</kbd> Seç
          </span>
        </div>
      </div>
    </div>
  );
}
