import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Bot,
  BarChart4,
  Globe,
  Landmark,
  Calculator
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Ana Sayfa', icon: LayoutDashboard },
  { to: '/wealth', label: 'Varlık', icon: Landmark },
  { to: '/tax', label: 'Vergi', icon: Calculator },
  { to: '/cashflow', label: 'Nakit', icon: BarChart4 },
  { to: '/stress-test', label: 'Stres', icon: Globe },
];

export default function MobileNav() {
  return (
    <nav
      className="
        fixed bottom-3 left-3 right-3 z-50
        bg-[var(--bg-surface)]/90 backdrop-blur-2xl
        border border-[var(--border-color)]
        shadow-2xl shadow-black/10
        flex items-center justify-around
        h-16 px-2 rounded-2xl
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
