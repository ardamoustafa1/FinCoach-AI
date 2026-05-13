import { useState, useMemo } from 'react';
import {
  RefreshCw, X, Calendar, TrendingUp,
  Bell, CreditCard, Clock, ChevronRight, Zap, ArrowRightLeft, CheckCircle2, Loader2
} from 'lucide-react';
import { fmt } from '../utils/categories';
import { abonelikleriTespit, yaklasanYenilemeler } from '../utils/subscriptionDetector';

// ─── Dismiss edilmiş abonelikleri localStorage'dan oku/yaz ───
const DISMISS_KEY = 'butceai_dismissed_subs';
function getDismissed() {
  try { return JSON.parse(localStorage.getItem(DISMISS_KEY) || '[]'); }
  catch { return []; }
}
function saveDismissed(list) {
  localStorage.setItem(DISMISS_KEY, JSON.stringify(list));
}

// ─── Mağaza ikonu renkleri ───────────────────────────────────
const MARKA_RENK = {
  netflix: { bg: 'bg-red-500/15', text: 'text-red-500', dot: '#ef4444' },
  spotify: { bg: 'bg-green-500/15', text: 'text-green-500', dot: '#22c55e' },
  'youtube premium': { bg: 'bg-red-600/15', text: 'text-red-600', dot: '#dc2626' },
  youtube: { bg: 'bg-red-600/15', text: 'text-red-600', dot: '#dc2626' },
  exxen: { bg: 'bg-purple-500/15', text: 'text-purple-500', dot: '#a855f7' },
  apple: { bg: 'bg-surface-500/15', text: 'text-surface-700 dark:text-surface-200', dot: '#64748b' },
  amazon: { bg: 'bg-orange-500/15', text: 'text-orange-500', dot: '#f97316' },
  disney: { bg: 'bg-blue-500/15', text: 'text-blue-500', dot: '#3b82f6' },
};
function markaRenk(magaza) {
  const key = (magaza || '').toLowerCase();
  for (const [k, v] of Object.entries(MARKA_RENK)) {
    if (key.includes(k)) return v;
  }
  return { bg: 'bg-primary-500/15', text: 'text-primary-500', dot: '#6366f1' };
}

export default function SubscriptionsTab({ islemler }) {
  const [dismissed, setDismissed] = useState(() => getDismissed());

  const abonelikler = useMemo(
    () => abonelikleriTespit(islemler, dismissed),
    [islemler, dismissed]
  );

  const yaklasan = useMemo(
    () => yaklasanYenilemeler(abonelikler),
    [abonelikler]
  );

  const toplamAylik = abonelikler.reduce((t, a) => t + a.aylikTutar, 0);
  const toplamYillik = toplamAylik * 12;

  const handleDismiss = (key) => {
    const yeni = [...dismissed, key];
    setDismissed(yeni);
    saveDismissed(yeni);
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* ── YAKLAŞAN YENİLEME UYARISI ── */}
      {yaklasan.length > 0 && (
        <div className="space-y-2.5">
          {yaklasan.map(ab => (
            <div
              key={ab.key}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-warn-500/10 via-warn-400/5 to-orange-500/10 border border-warn-500/20 animate-fade-in-up"
            >
              <div className="w-9 h-9 rounded-xl bg-warn-500/15 flex items-center justify-center shrink-0">
                <Bell className="w-4.5 h-4.5 text-warn-500 animate-pulse" />
              </div>
              <p className="text-sm text-surface-900 dark:text-white flex-1">
                <span className="font-bold">{ab.magaza}</span>
                {' '}{ab.gunAdi} yenileniyor — {' '}
                <span className="font-bold text-warn-500">{fmt(ab.aylikTutar)}</span>
                {' '}hazır olsun
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-warn-500 bg-warn-500/10 px-2.5 py-1 rounded-lg shrink-0">
                <Clock className="w-3 h-3" />
                {ab.gunKaldi === 0 ? 'Bugün' : `${ab.gunKaldi} gün`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ÖZET KARTI ── */}
      <div className="glass-card rounded-2xl p-5 overflow-hidden relative">
        {/* Arka plan dekorasyon */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-500/10 via-purple-500/5 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent-500/10 via-transparent to-transparent rounded-tr-full" />

        <div className="relative flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">Abonelik Özeti</h2>
            <p className="text-xs text-surface-700 dark:text-surface-200">
              {abonelikler.length} aktif abonelik tespit edildi
            </p>
          </div>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Aylık Toplam */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-50/80 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/30">
            <div className="w-10 h-10 rounded-xl bg-danger-500/10 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-danger-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-surface-700 dark:text-surface-200 uppercase tracking-wide">Aylık Gider</p>
              <p className="text-xl font-bold text-danger-500">{fmt(toplamAylik)}</p>
            </div>
          </div>

          {/* Yıllık Toplam */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-50/80 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/30">
            <div className="w-10 h-10 rounded-xl bg-warn-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-warn-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-surface-700 dark:text-surface-200 uppercase tracking-wide">Yıllık Tahmin</p>
              <p className="text-xl font-bold text-warn-500">{fmt(toplamYillik)}</p>
            </div>
          </div>

          {/* Abonelik Sayısı */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-50/80 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/30">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-surface-700 dark:text-surface-200 uppercase tracking-wide">Aktif Abonelik</p>
              <p className="text-xl font-bold text-primary-500">{abonelikler.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ABONELİK KARTLARI ── */}
      {abonelikler.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            <RefreshCw className="w-7 h-7 text-surface-700 dark:text-surface-200" />
          </div>
          <p className="text-lg font-semibold text-surface-900 dark:text-white mb-1">Abonelik bulunamadı</p>
          <p className="text-sm text-surface-700 dark:text-surface-200">
            En az 2 ay düzenli tekrar eden ödeme tespit edilmedi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {abonelikler.map(ab => (
            <AbonelikKarti
              key={ab.key}
              abonelik={ab}
              onDismiss={() => handleDismiss(ab.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Abonelik Kartı ──────────────────────────────────────────
function AbonelikKarti({ abonelik, onDismiss }) {
  const renk = markaRenk(abonelik.magaza);
  const sonrakiTarih = new Date(abonelik.sonrakiOdeme);
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const gunKaldi = Math.ceil((sonrakiTarih - bugun) / (1000 * 60 * 60 * 24));
  const yaklasiyorMu = gunKaldi >= 0 && gunKaldi <= 7;

  const [swapping, setSwapping] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const isNetflix = abonelik.magaza.toLowerCase().includes('netflix');

  const handleSwap = () => {
    setSwapping(true);
    setTimeout(() => {
      setSwapping(false);
      setSwapped(true);
    }, 2500);
  };

  return (
    <div className="glass-card rounded-2xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden">
      {/* Yaklaşıyor indicator */}
      {yaklasiyorMu && (
        <div className="absolute top-0 right-0">
          <div className="w-2 h-2 bg-warn-500 rounded-full absolute top-3 right-3 animate-ping" />
          <div className="w-2 h-2 bg-warn-500 rounded-full absolute top-3 right-3" />
        </div>
      )}

      {/* Üst: Logo + Mağaza + Tutar */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${renk.bg} flex items-center justify-center shrink-0`}>
            <RefreshCw className={`w-5 h-5 ${renk.text}`} />
          </div>
          <div>
            <h3 className="text-base font-bold text-surface-900 dark:text-white">{abonelik.magaza}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${renk.bg} mt-0.5`}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: renk.dot }} />
              {abonelik.kategori}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-danger-500">{fmt(abonelik.aylikTutar)}</p>
          <p className="text-[10px] text-surface-700 dark:text-surface-200 font-medium">/ ay</p>
        </div>
      </div>

      {/* Orta: Detaylar */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-surface-700 dark:text-surface-200">
            <Calendar className="w-3 h-3" />
            Son ödeme
          </span>
          <span className="font-medium text-surface-900 dark:text-white">{abonelik.sonOdeme}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-surface-700 dark:text-surface-200">
            <ChevronRight className="w-3 h-3" />
            Tahmini sonraki
          </span>
          <span className={`font-medium ${yaklasiyorMu ? 'text-warn-500' : 'text-surface-900 dark:text-white'}`}>
            {abonelik.sonrakiOdeme}
            {yaklasiyorMu && (
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-warn-500/15 text-warn-500 font-semibold">
                {gunKaldi === 0 ? 'Bugün' : `${gunKaldi}g`}
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-surface-700 dark:text-surface-200">
            <RefreshCw className="w-3 h-3" />
            Tekrar sayısı
          </span>
          <span className="font-medium text-surface-900 dark:text-white">{abonelik.tekrarSayisi} ay</span>
        </div>
      </div>

      {/* Alt: İşlem Butonları */}
      <div className="flex gap-2">
        <button
          onClick={onDismiss}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
            bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-200
            hover:bg-danger-500/10 hover:text-danger-500
            border border-surface-200/50 dark:border-surface-700/30
            opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
        >
          <X className="w-3 h-3" />
          Abonelik Değil
        </button>
        
        {isNetflix && !swapped && (
          <button
            onClick={handleSwap}
            disabled={swapping}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
              bg-purple-600 text-white hover:bg-purple-500 border border-purple-500/50 shadow-lg shadow-purple-500/30
              transition-all duration-200 cursor-pointer"
          >
            {swapping ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRightLeft className="w-3 h-3" />}
            {swapping ? 'Geçiliyor...' : 'Mubi\'ye Geç (Kar: 120₺)'}
          </button>
        )}
        
        {isNetflix && swapped && (
          <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-green-500/20 text-green-500 border border-green-500/30">
             <CheckCircle2 className="w-3 h-3" /> Mubi Aktif
          </div>
        )}
      </div>
    </div>
  );
}
