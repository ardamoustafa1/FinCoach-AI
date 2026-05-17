import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, Target, Bot, BarChart3, Settings,
  ChevronLeft, ChevronRight, Wallet, Trophy, Clock, ShieldAlert, BarChart4, Globe, Landmark, Calculator, Home, Coins, Snowflake, Waves, Lock, Server, ShieldCheck, Network, Cpu, HeartPulse
} from 'lucide-react';
import useStore from '../store/useStore';

const navItems = [
  { to: '/', label: 'Ana Sayfa', icon: LayoutDashboard },
  { to: '/transactions', label: 'İşlemler', icon: ArrowLeftRight },
  { to: '/wealth', label: 'Varlık Yönetimi', icon: Landmark },
  { to: '/micro-invest', label: 'Küsürat Yatırımı', icon: Coins },
  { to: '/debt-snowball', label: 'Borç Yapılandırma', icon: Snowflake },
  { to: '/freelancer-smoother', label: 'Freelancer Dengeleyici', icon: Waves },
  { to: '/tax', label: 'Vergi Asistanı', icon: Calculator },
  { to: '/real-estate', label: 'Ev & Kredi AI', icon: Home },
  { to: '/anomaly', label: 'Anomali & Fraud AI', icon: Lock },
  { to: '/shop-sim', label: 'Harcama Simülatörü', icon: Target },
  { to: '/system-monitor', label: 'Sistem Mimarisi', icon: Server },
  { to: '/federated', label: 'Federated AI', icon: ShieldCheck },
  { to: '/escrow', label: 'Web3 Escrow (Kilit)', icon: Lock },
  { to: '/autonomous-agent', label: 'Self-Driving Money', icon: Cpu },
  { to: '/financial-icu', label: 'Financial ICU', icon: HeartPulse },
  { to: '/goals', label: 'Hedefler', icon: Target },
  { to: '/league', label: 'Tasarruf Ligi', icon: Trophy },
  { to: '/cashflow', label: 'Nakit Akışı', icon: BarChart4 },
  { to: '/stress-test', label: 'Stres Testi', icon: Globe },
  { to: '/time-machine', label: 'Zaman Makinesi', icon: Clock },
  { to: '/subscriptions', label: 'Abonelikler', icon: ShieldAlert },
  { to: '/chat', label: 'AI Koç', icon: Bot },
  { to: '/reports', label: 'Raporlar', icon: BarChart3 },
  { to: '/settings', label: 'Ayarlar', icon: Settings },
];

const P = {
  purple: '#7C3AED', 
  bg2: 'var(--bg-surface)', 
  border: 'var(--border-color)',
  text1: 'var(--text-primary)', 
  text2: 'var(--text-secondary)', 
  text3: 'var(--text-muted)',
};

export default function Sidebar({ collapsed, onToggle }) {
  
  const { name: userName = 'Kullanıcı', bank: userBank = 'Finansal Koç' } = useStore(state => state.userProfile);
  const initial = userName.charAt(0).toUpperCase() || 'K';

  return (
    <aside
      style={{
        position: 'fixed', top: 0, left: 0, zIndex: 40, height: '100vh',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-sidebar)', backdropFilter: 'blur(24px)',
        borderRight: `1px solid ${P.border}`,
        width: collapsed ? 80 : 260,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', height: 72, borderBottom: `1px solid ${P.border}`, flexShrink: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(124,58,237,0.3)', border: '1px solid rgba(255,255,255,0.15)'
        }}>
          <Wallet size={20} color="#fff" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s' }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: P.text1, letterSpacing: '-0.02em' }}>FinCoach AI</span>
            <p style={{ fontSize: 10, fontWeight: 800, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.22em', margin: 0 }}>Finance Cockpit</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav role="navigation" aria-label="Ana Menü" style={{ flex: 1, padding: '24px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} aria-label={collapsed ? label : undefined}>
            {({ isActive }) => {
              const baseStyle = {
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 14,
                fontSize: 14, fontWeight: isActive ? 800 : 600, textDecoration: 'none',
                transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden',
                color: isActive ? '#fff' : P.text2,
                background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(124,58,237,0.35)' : 'transparent'}`,
              };

              return (
                <div
                  style={baseStyle}
                  onMouseEnter={e => {
                    if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = P.text2; }
                  }}
                >
                  {isActive && <div style={{ position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 3, borderRadius: '0 4px 4px 0', background: P.purple, boxShadow: '0 0 12px rgba(124,58,237,0.8)' }} />}
                  <Icon size={20} color={isActive ? P.purple : 'currentColor'} style={{ flexShrink: 0, transition: 'transform 0.2s' }} />
                  {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                </div>
              );
            }}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      {!collapsed && (
        <div style={{ padding: '0 16px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid ${P.border}` }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
              {initial}
            </div>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: P.text1, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>{userName}</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>{userBank}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Button */}
      <div style={{ padding: '0 16px 16px', flexShrink: 0 }}>
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Kenar çubuğunu genişlet' : 'Kenar çubuğunu daralt'}
          aria-expanded={!collapsed}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: 'none', color: P.text3, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = P.text3; }}
        >
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> Daralt</>}
        </button>
      </div>
    </aside>
  );
}
