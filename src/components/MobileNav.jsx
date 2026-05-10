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
        fixed bottom-3 left-3 right-3 z-50
        bg-[#0d0f1e]/90 backdrop-blur-2xl
        border border-white/8
        shadow-2xl shadow-black/35
        flex items-center justify-around
        h-16 px-2 rounded-lg
        lg:hidden
      "
    >
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold
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
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-br from-[#7c3aed] to-[#6366f1] text-white shadow-lg shadow-primary-500/25'
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
