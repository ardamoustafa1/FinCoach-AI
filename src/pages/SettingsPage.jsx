import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Moon, Sun, Globe, Bell, Trash2, Database, RotateCcw, Save, Wallet } from 'lucide-react';
import { initMockData } from '../data/mockData';
import { getBudgetLimits, saveBudgetLimits } from '../utils/storage';
import { TUM_KATEGORILER } from '../utils/categories';

export default function SettingsPage({ theme, onToggleTheme }) {
  const [limits, setLimits] = useState({});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLimits(getBudgetLimits());
  }, []);

  const handleLimitChange = (kat, value) => {
    setLimits(prev => ({ ...prev, [kat]: Number(value) }));
    setIsSaved(false);
  };

  const handleSaveLimits = () => {
    saveBudgetLimits(limits);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLoadDemoData = () => {
    if (window.confirm('Demo verileri yeniden yüklenecek. Mevcut yerel veriler silinsin mi?')) {
      localStorage.clear();
      initMockData();
      window.location.reload();
    }
  };

  const handleClearData = () => {
    if (window.confirm('Tüm veriler silinecek. Emin misiniz?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <div className="page-hero p-5 md:p-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-600 dark:text-primary-300 mb-2">Demo kontrol merkezi</p>
        <h1 className="text-3xl md:text-4xl font-black text-surface-950 dark:text-white">Ayarlar</h1>
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

        {/* Bütçe Limitleri */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-primary-500" />
              <div>
                <p className="font-medium text-surface-900 dark:text-white">Aylık Kategori Limitleri</p>
                <p className="text-xs text-surface-700 dark:text-surface-200">Kategorilere göre bütçe sınırlarınızı belirleyin</p>
              </div>
            </div>
            <button 
              onClick={handleSaveLimits} 
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSaved ? 'Kaydedildi!' : 'Kaydet'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TUM_KATEGORILER.filter(k => k !== 'Diğer').map(kat => (
              <div key={kat} className="flex flex-col">
                <label className="text-xs font-semibold text-surface-700 dark:text-surface-200 mb-1">{kat}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-surface-500">₺</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={limits[kat] || ''}
                    onChange={(e) => handleLimitChange(kat, e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Verileri */}
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-primary-500" />
            <div>
              <p className="font-medium text-surface-900 dark:text-white">Demo Verilerini Yükle</p>
              <p className="text-xs text-surface-700 dark:text-surface-200">Tüm localStorage temizlenir ve demo veri seti yeniden kurulur</p>
            </div>
          </div>
          <button onClick={handleLoadDemoData} className="px-4 py-2 rounded-xl bg-primary-500/10 text-primary-500 text-sm font-medium hover:bg-primary-500/20 transition-colors cursor-pointer">
            Yükle
          </button>
        </div>

        {/* Verileri Sil */}
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between border border-danger-500/20">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-danger-500" />
            <div>
              <p className="font-medium text-surface-900 dark:text-white">Tüm Verileri Sıfırla</p>
              <p className="text-xs text-surface-700 dark:text-surface-200">Tüm yerel verileri sil</p>
            </div>
          </div>
          <button onClick={handleClearData} className="px-4 py-2 rounded-xl bg-danger-500/10 text-danger-500 text-sm font-medium hover:bg-danger-500/20 transition-colors cursor-pointer">
            Temizle
          </button>
        </div>

        {/* Demo QR */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="p-3 rounded-2xl bg-white">
              <QRCodeSVG value="https://butceai.vercel.app" size={200} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trash2 className="w-5 h-5 text-surface-500" />
                <p className="font-medium text-surface-900 dark:text-white">Demo QR Kodu</p>
              </div>
              <p className="text-sm text-surface-700 dark:text-surface-200 break-all">https://butceai.vercel.app</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
