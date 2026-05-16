import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, Target, Bot, BarChart3, Settings,
  Wallet, Trophy, Clock, ShieldAlert, BarChart4, Globe, Landmark,
  Calculator, Home, Coins, Snowflake, Waves, Lock, Server, ShieldCheck,
  Network, Menu, X, ChevronRight
} from 'lucide-react';

const navSections = [
  {
    title: 'Ana Menü',
    items: [
      { to: '/', label: 'Ana Sayfa', icon: LayoutDashboard },
      { to: '/transactions', label: 'İşlemler', icon: ArrowLeftRight },
    ]
  },
  {
    title: 'Yatırım & Borç',
    items: [
      { to: '/wealth', label: 'Varlık Yönetimi', icon: Landmark },
      { to: '/micro-invest', label: 'Küsürat Yatırımı', icon: Coins },
      { to: '/debt-snowball', label: 'Borç Yapılandırma', icon: Snowflake },
      { to: '/freelancer-smoother', label: 'Freelancer Dengeleyici', icon: Waves },
    ]
  },
  {
    title: 'Analiz & AI',
    items: [
      { to: '/tax', label: 'Vergi Asistanı', icon: Calculator },
      { to: '/real-estate', label: 'Ev & Kredi AI', icon: Home },
      { to: '/anomaly', label: 'Anomali & Fraud AI', icon: Lock },
      { to: '/graph-analysis', label: 'Market Basket Graph', icon: Network },
      { to: '/cashflow', label: 'Nakit Akışı', icon: BarChart4 },
      { to: '/stress-test', label: 'Stres Testi', icon: Globe },
    ]
  },
  {
    title: 'Altyapı & Güvenlik',
    items: [
      { to: '/system-monitor', label: 'Sistem Mimarisi', icon: Server },
      { to: '/federated', label: 'Federated AI', icon: ShieldCheck },
      { to: '/escrow', label: 'Web3 Escrow', icon: Lock },
    ]
  },
  {
    title: 'Kişisel & Diğer',
    items: [
      { to: '/goals', label: 'Hedefler', icon: Target },
      { to: '/league', label: 'Tasarruf Ligi', icon: Trophy },
      { to: '/time-machine', label: 'Zaman Makinesi', icon: Clock },
      { to: '/subscriptions', label: 'Abonelikler', icon: ShieldAlert },
      { to: '/chat', label: 'AI Koç', icon: Bot },
      { to: '/reports', label: 'Raporlar', icon: BarChart3 },
      { to: '/settings', label: 'Ayarlar', icon: Settings },
    ]
  }
];

// Quick-access tabs for the bottom bar
const bottomTabs = [
  { to: '/', label: 'Ana', icon: LayoutDashboard },
  { to: '/cashflow', label: 'Nakit', icon: BarChart4 },
  { to: '/chat', label: 'AI Koç', icon: Bot },
  { to: '/wealth', label: 'Varlık', icon: Landmark },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close drawer on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Bottom Tab Bar — always visible on mobile */}
      <nav
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'var(--bg-sidebar)', backdropFilter: 'blur(24px) saturate(150%)',
          borderTop: '1px solid var(--border-color)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          height: 64, padding: '0 8px',
        }}
        className="lg:hidden"
      >
        {bottomTabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}
          >
            {({ isActive }) => (
              <>
                <div style={{
                  padding: 6, borderRadius: 10,
                  background: isActive ? 'linear-gradient(135deg, #7c3aed, #6366f1)' : 'transparent',
                  boxShadow: isActive ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}>
                  <Icon size={20} color={isActive ? '#fff' : 'var(--text-muted)'} />
                </div>
                <span style={{
                  fontSize: 10, fontWeight: isActive ? 800 : 600, lineHeight: 1,
                  color: isActive ? '#A78BFA' : 'var(--text-muted)',
                }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Hamburger — opens full drawer */}
        <button
          onClick={() => setOpen(true)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <div style={{ padding: 6, borderRadius: 10 }}>
            <Menu size={20} color="var(--text-muted)" />
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1, color: 'var(--text-muted)' }}>Menü</span>
        </button>
      </nav>

      {/* Full-screen Drawer Overlay */}
      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            animation: 'fadeInBg 0.2s ease both',
          }}
          onClick={() => setOpen(false)}
          className="lg:hidden"
        />
      )}

      {/* Drawer Panel */}
      {open && (
        <aside
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9999,
            width: '85%', maxWidth: 340,
            background: 'var(--bg-sidebar)', borderLeft: '1px solid var(--border-color)',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.3)',
            overflowY: 'auto',
            animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
          className="lg:hidden"
        >
          {/* Drawer Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 20px', borderBottom: '1px solid var(--border-color)',
            position: 'sticky', top: 0, background: 'var(--bg-sidebar)', zIndex: 2,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
              }}>
                <Wallet size={18} color="#fff" />
              </div>
              <div>
                <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>FinCoach AI</span>
                <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.18em', margin: 0 }}>Tüm Sayfalar</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Sections */}
          <div style={{ padding: '16px 12px 100px' }}>
            {navSections.map((section) => (
              <div key={section.title} style={{ marginBottom: 20 }}>
                <p style={{
                  fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  padding: '0 12px', marginBottom: 8,
                }}>{section.title}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {section.items.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/'}
                      style={{ textDecoration: 'none' }}
                    >
                      {({ isActive }) => (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px', borderRadius: 12,
                          background: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
                          border: `1px solid ${isActive ? 'rgba(124,58,237,0.3)' : 'transparent'}`,
                          transition: 'all 0.15s',
                        }}>
                          <Icon size={18} color={isActive ? '#7C3AED' : 'var(--text-secondary)'} />
                          <span style={{
                            fontSize: 14, fontWeight: isActive ? 800 : 600,
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            flex: 1,
                          }}>{label}</span>
                          {isActive && <ChevronRight size={14} color="#7C3AED" />}
                        </div>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}
    </>
  );
}
