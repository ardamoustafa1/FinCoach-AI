import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import ThemeToggle from './ThemeToggle';

export default function Layout({ theme, onToggleTheme }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300
          pb-20 lg:pb-0
          ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}
        `}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-end px-6 bg-surface-50/80 dark:bg-surface-950/80 backdrop-blur-lg border-b border-surface-200/50 dark:border-surface-800/50">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
