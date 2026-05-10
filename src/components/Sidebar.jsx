import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Bot,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Ana Sayfa', icon: LayoutDashboard },
  { to: '/transactions', label: 'İşlemler', icon: ArrowLeftRight },
  { to: '/goals', label: 'Hedefler', icon: Target },
  { to: '/chat', label: 'AI Koç', icon: Bot },
  { to: '/reports', label: 'Raporlar', icon: BarChart3 },
  { to: '/settings', label: 'Ayarlar', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  const userName = localStorage.getItem('butceai_user_name') || 'Kullanıcı';
  const userBank = localStorage.getItem('butceai_bank') || 'Finansal Koç';
  const initial = userName.charAt(0).toUpperCase() || 'K';

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen flex flex-col
        bg-white/70 dark:bg-surface-950/76 backdrop-blur-2xl
        border-r border-white/60 dark:border-surface-800/70
        shadow-2xl shadow-surface-950/5 dark:shadow-black/30
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-18 border-b border-white/60 dark:border-surface-800/70 shrink-0">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 via-primary-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-primary-500/25 ring-1 ring-white/40">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-lg font-black gradient-text whitespace-nowrap">BütçeAI</span>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-surface-500">Finance cockpit</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold
               transition-all duration-200 relative overflow-hidden
               ${
                 isActive
                   ? 'bg-gradient-to-r from-primary-500/14 to-emerald-500/10 text-primary-700 dark:text-white sidebar-active shadow-sm'
                   : 'text-surface-600 dark:text-surface-300 hover:bg-white/70 dark:hover:bg-surface-800/70 hover:text-surface-950 dark:hover:text-white'
               }`
            }
          >
            <Icon
              className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110`}
            />
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      {!collapsed && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-100/50 dark:bg-surface-900/50 border border-surface-200/50 dark:border-surface-800/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-surface-900 dark:text-white truncate">
                {userName}
              </p>
              <p className="text-[10px] text-surface-500 font-semibold uppercase tracking-wider truncate">
                {userBank}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Button */}
      <div className="px-3 pb-4 shrink-0 mt-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
                     text-sm font-bold text-surface-600 dark:text-surface-300
                     hover:bg-white/70 dark:hover:bg-surface-800/70
                     transition-all duration-200 cursor-pointer"
          aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Daralt</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
