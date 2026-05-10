import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Bot,
  BarChart3,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Ana Sayfa', icon: LayoutDashboard },
  { to: '/transactions', label: 'İşlemler', icon: ArrowLeftRight },
  { to: '/goals', label: 'Hedefler', icon: Target },
  { to: '/chat', label: 'AI Koç', icon: Bot },
  { to: '/reports', label: 'Raporlar', icon: BarChart3 },
];

export default function MobileNav() {
  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-white/90 dark:bg-surface-900/95 backdrop-blur-xl
        border-t border-surface-200 dark:border-surface-800
        flex items-center justify-around
        h-16 px-2
        lg:hidden
      "
    >
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium
             transition-all duration-200
             ${
               isActive
                 ? 'text-primary-600 dark:text-primary-400'
                 : 'text-surface-700 dark:text-surface-200'
             }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/10 dark:bg-primary-500/15'
                    : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="leading-none">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
