import { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sparkles, QrCode } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import ThemeToggle from './ThemeToggle';
import DemoQRCodeModal from './DemoQRCodeModal';
import { useToast } from '../hooks/useToast';
import { fmt } from '../utils/categories';
import { getBudgetLimits } from '../utils/storage';
import {
  markWeeklySummarySeen,
  shouldShowWeeklySummary,
  upcomingSubscriptionReminders,
  weeklySummary,
} from '../utils/notifications';

export default function Layout({ theme, onToggleTheme }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showWeeklySummary, setShowWeeklySummary] = useState(() => shouldShowWeeklySummary());
  const [showQrModal, setShowQrModal] = useState(false);
  const toast = useToast();
  const haftalik = useMemo(() => weeklySummary(getBudgetLimits()), []);

  useEffect(() => {
    upcomingSubscriptionReminders().forEach((abonelik) => {
      toast.warning(`${abonelik.magaza} ${abonelik.gunAdi} yenileniyor — ${fmt(abonelik.aylikTutar)} hazır olsun 📅`);
    });
  }, [toast]);

  const closeWeeklySummary = () => {
    markWeeklySummarySeen();
    setShowWeeklySummary(false);
  };

  return (
    <div className="premium-surface min-h-screen bg-transparent transition-colors duration-300">
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
          pb-24 lg:pb-0
          ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}
        `}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-[72px] flex items-center justify-between gap-4 px-4 md:px-6 lg:px-8 bg-white/58 dark:bg-surface-950/62 backdrop-blur-2xl border-b border-white/50 dark:border-surface-800/60">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary-600 dark:text-primary-300">BütçeAI</p>
            <p className="hidden sm:block text-sm text-surface-600 dark:text-surface-300 truncate">Akıllı bütçe, hedef ve harcama koçu</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowQrModal(true)}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-primary-500/20 bg-primary-500/10 hover:bg-primary-500/20 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-bold text-primary-700 dark:text-primary-300">Sunum QR</span>
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Demo hazır</span>
            </div>
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} onToggle={onToggleTheme} />
          </div>
        </header>

        {showWeeklySummary && (
          <div className="px-4 md:px-6 lg:px-8 pt-6">
            <div className="rounded-2xl bg-gradient-to-r from-primary-500 to-purple-500 p-[1px] animate-fade-in-up shadow-xl shadow-primary-500/10">
              <div className="bg-white dark:bg-surface-850 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900 dark:text-white mb-0.5">Haftalık Özeti</h3>
                    <p className="text-sm text-surface-700 dark:text-surface-200">
                      Geçen hafta <strong className="text-danger-500">{fmt(haftalik.total)}</strong> harcadın, bu haftaki hedefin <strong className="text-emerald-500">{fmt(2000)}</strong>.
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeWeeklySummary}
                  className="self-start sm:self-auto px-4 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200 text-xs font-bold hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors cursor-pointer shrink-0"
                >
                  Anladım
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="mx-auto w-full max-w-[1540px] p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {showQrModal && (
        <DemoQRCodeModal onClose={() => setShowQrModal(false)} />
      )}
    </div>
  );
}
