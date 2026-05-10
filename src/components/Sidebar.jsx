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
  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen flex flex-col
        bg-white/80 dark:bg-surface-900/95 backdrop-blur-xl
        border-r border-surface-200 dark:border-surface-800
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-surface-200 dark:border-surface-800 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold gradient-text whitespace-nowrap">
            BütçeAI
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
               transition-all duration-200 relative
               ${
                 isActive
                   ? 'bg-primary-500/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 sidebar-active'
                   : 'text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white'
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

      {/* Collapse Button */}
      <div className="px-3 pb-4 shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                     text-sm font-medium text-surface-700 dark:text-surface-200
                     hover:bg-surface-100 dark:hover:bg-surface-800
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
