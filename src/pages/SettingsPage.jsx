import { Moon, Sun, Globe, Bell, Trash2 } from 'lucide-react';

export default function SettingsPage({ theme, onToggleTheme }) {
  const handleClearData = () => {
    if (window.confirm('Tüm veriler silinecek. Emin misiniz?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">Ayarlar ⚙️</h1>
        <p className="text-surface-700 dark:text-surface-200 mt-1">Uygulama tercihlerinizi yönetin</p>
      </div>

      <div className="space-y-4">
        {/* Tema */}
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-primary-400" /> : <Sun className="w-5 h-5 text-warn-500" />}
            <div>
              <p className="font-medium text-surface-900 dark:text-white">Tema</p>
              <p className="text-xs text-surface-700 dark:text-surface-200">{theme === 'dark' ? 'Koyu mod aktif' : 'Açık mod aktif'}</p>
            </div>
          </div>
          <button onClick={onToggleTheme} className="px-4 py-2 rounded-xl bg-primary-500/10 text-primary-500 text-sm font-medium hover:bg-primary-500/20 transition-colors cursor-pointer">
            {theme === 'dark' ? 'Açık Mod' : 'Koyu Mod'}
          </button>
        </div>

        {/* Dil */}
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-accent-500" />
            <div>
              <p className="font-medium text-surface-900 dark:text-white">Dil</p>
              <p className="text-xs text-surface-700 dark:text-surface-200">Türkçe</p>
            </div>
          </div>
          <span className="px-4 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-sm text-surface-700 dark:text-surface-200">🇹🇷 Türkçe</span>
        </div>

        {/* Bildirimler */}
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-warn-500" />
            <div>
              <p className="font-medium text-surface-900 dark:text-white">Bildirimler</p>
              <p className="text-xs text-surface-700 dark:text-surface-200">Hatırlatıcılar ve uyarılar</p>
            </div>
          </div>
          <span className="px-4 py-2 rounded-xl bg-accent-500/10 text-accent-500 text-sm font-medium">Aktif</span>
        </div>

        {/* Verileri Sil */}
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between border border-danger-500/20">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-danger-500" />
            <div>
              <p className="font-medium text-surface-900 dark:text-white">Verileri Temizle</p>
              <p className="text-xs text-surface-700 dark:text-surface-200">Tüm yerel verileri sil</p>
            </div>
          </div>
          <button onClick={handleClearData} className="px-4 py-2 rounded-xl bg-danger-500/10 text-danger-500 text-sm font-medium hover:bg-danger-500/20 transition-colors cursor-pointer">
            Temizle
          </button>
        </div>
      </div>
    </div>
  );
}
