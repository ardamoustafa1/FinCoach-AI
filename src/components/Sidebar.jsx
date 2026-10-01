import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, Target, Bot, BarChart3, Settings,
  ChevronLeft, ChevronRight, Wallet, ShieldAlert, BarChart4,
  Landmark, Calculator, Snowflake, Lock, Server,
  ShieldCheck, Cpu, HeartPulse,
} from 'lucide-react';
import useStore from '../store/useStore';
import { P } from '../styles/palette';

const navSections = [
  {
    title: 'Ana Menü',
    items: [
      { to: '/',             label: 'Ana Sayfa',   icon: LayoutDashboard },
      { to: '/dashboard',    label: 'Dashboard',   icon: BarChart3 },
      { to: '/transactions', label: 'İşlemler',    icon: ArrowLeftRight },
      { to: '/reports',      label: 'Raporlar',    icon: BarChart4 },
    ],
  },
  {
    title: 'Finansal Araçlar',
    items: [
      { to: '/wealth',               label: 'Varlık Yönetimi',       icon: Landmark },
      { to: '/debt-snowball',        label: 'Borç Yapılandırma',     icon: Snowflake },
      { to: '/goals',                label: 'Hedefler',              icon: Target },
      { to: '/tax',                  label: 'Vergi Asistanı',        icon: Calculator },
    ],
  },
  {
    title: 'Kişisel & Diğer',
    items: [
      { to: '/chat',          label: 'AI Koç',         icon: Bot },
      { to: '/subscriptions', label: 'Abonelikler',    icon: ShieldAlert },
      { to: '/settings',      label: 'Ayarlar',        icon: Settings },
    ],
  },
  {
    title: 'Labs / Deneysel',
    items: [
      { to: '/federated',         label: 'Federated AI',       icon: ShieldCheck },
      { to: '/autonomous-agent',  label: 'Self-Driving Money', icon: Cpu },
      { to: '/financial-icu',     label: 'Financial ICU',      icon: HeartPulse },
      { to: '/system-monitor',    label: 'Sistem Mimarisi',    icon: Server },
      { to: '/anomaly',           label: 'Anomali AI',         icon: Lock },
      { to: '/shop-sim',          label: 'Harcama Simülatörü', icon: Target },
    ],
  },
];

function NavItem({ to, label, icon: Icon, collapsed }) {
  const [hover, setHover] = useState(false);

  return (
    <NavLink to={to} end={to === '/'} aria-label={collapsed ? label : undefined} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <div
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          title={collapsed ? label : undefined}
          style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 12,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '11px 0' : '10px 12px',
            borderRadius: 11,
            fontSize: 13.2,
            fontWeight: isActive ? 650 : 500,
            letterSpacing: '-0.008em',
            cursor: 'pointer',
            overflow: 'hidden',
            color: isActive ? 'var(--text-primary)' : (hover ? 'var(--text-primary)' : 'var(--text-secondary)'),
            background: isActive
              ? 'rgba(52,192,138,0.10)'
              : (hover ? 'var(--bg-surface)' : 'transparent'),
            border: `1px solid ${isActive ? 'rgba(52,192,138,0.26)' : 'transparent'}`,
            transition: 'color .3s ease, background .35s var(--ease-out-expo), border-color .3s ease',
          }}
        >
          {/* Altın aktiflik çubuğu */}
          <span style={{
            position: 'absolute', left: 0, top: '50%',
            width: 2, borderRadius: '0 3px 3px 0',
            height: isActive ? '56%' : 0,
            transform: 'translateY(-50%)',
            background: `linear-gradient(180deg, ${P.greenLight}, ${P.green})`,
            boxShadow: isActive ? '0 0 10px rgba(52,192,138,0.5)' : 'none',
            transition: 'height .45s var(--ease-out-expo)',
          }} />

          <Icon
            size={17}
            strokeWidth={isActive ? 2 : 1.6}
            color={isActive ? P.green : 'currentColor'}
            style={{ flexShrink: 0, transition: 'color .3s ease' }}
          />

          {!collapsed && (
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {label}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  const { name: userName = 'Kullanıcı', bank: userBank = 'Finansal Koç' } = useStore(state => state.userProfile);
  const initial = userName.charAt(0).toUpperCase() || 'K';

  return (
    <aside
      style={{
        position: 'fixed', top: 0, left: 0, zIndex: 40, height: '100vh',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(26px) saturate(150%)',
        WebkitBackdropFilter: 'blur(26px) saturate(150%)',
        borderRight: '1px solid var(--border-color)',
        width: collapsed ? 80 : 260,
        transition: 'width .5s var(--ease-out-expo)',
      }}
    >
      {/* Marka */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: collapsed ? '0 20px' : '0 22px', height: 76,
        borderBottom: '1px solid var(--border-color)', flexShrink: 0,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <span style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: P.gradBrand, display: 'grid', placeItems: 'center',
          boxShadow: '0 8px 22px rgba(139,148,157,0.28)',
        }}>
          <Wallet size={17} color="#0C0E10" strokeWidth={2.4} />
        </span>
        {!collapsed && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              FinCoach<span style={{ color: P.green }}> AI</span>
            </p>
            <p className="eyebrow" style={{ fontSize: 8.5, letterSpacing: '0.22em', marginTop: 2 }}>Finance Cockpit</p>
          </div>
        )}
      </div>

      {/* Menü */}
      <nav
        role="navigation"
        aria-label="Ana Menü"
        style={{ flex: 1, padding: '18px 12px 10px', overflowY: 'auto', overflowX: 'hidden' }}
      >
        {navSections.map((section, si) => (
          <div key={section.title} style={{ marginBottom: collapsed ? 10 : 20 }}>
            {!collapsed && (
              <p className="eyebrow" style={{ fontSize: 8.5, letterSpacing: '0.2em', padding: '0 12px', marginBottom: 8 }}>
                {section.title}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {section.items.map((item) => (
                <NavItem key={item.to} {...item} collapsed={collapsed} />
              ))}
            </div>
            {!collapsed && si < navSections.length - 1 && (
              <div className="hairline" style={{ marginTop: 16 }} />
            )}
          </div>
        ))}
      </nav>

      {/* Kullanıcı */}
      {!collapsed && (
        <div style={{ padding: '0 12px 10px', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: 12, borderRadius: 14,
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
          }}>
            <span style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: P.gradBrand, display: 'grid', placeItems: 'center',
              color: '#0C0E10', fontWeight: 800, fontSize: 13,
            }}>
              {initial}
            </span>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <p style={{ fontSize: 13, fontWeight: 650, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userName}</p>
              <p className="eyebrow" style={{ fontSize: 8.5, letterSpacing: '0.14em' }}>{userBank}</p>
            </div>
          </div>
        </div>
      )}

      {/* Daralt */}
      <div style={{ padding: '0 12px 14px', flexShrink: 0 }}>
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Kenar çubuğunu genişlet' : 'Kenar çubuğunu daralt'}
          aria-expanded={!collapsed}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, padding: '11px',
            borderRadius: 11, background: 'transparent',
            border: '1px solid var(--border-color)', color: 'var(--text-muted)',
            fontSize: 11.5, fontWeight: 600, letterSpacing: '0.02em',
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all .35s var(--ease-out-expo)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> Daralt</>}
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: '0 22px 18px' }}>
          <p style={{ fontSize: 9.5, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 6 }}>
            Bilgilendirme amaçlıdır. Yatırım tavsiyesi değildir.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <span className="link-underline" style={{ fontSize: 9.5, color: P.green, cursor: 'pointer' }}>KVKK</span>
            <span className="link-underline" style={{ fontSize: 9.5, color: P.green, cursor: 'pointer' }}>Gizlilik</span>
          </div>
        </div>
      )}
    </aside>
  );
}
