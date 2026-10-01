/**
 * Sayfa başlıkları — tek kaynak.
 * App.jsx (document.title) ve Layout.jsx (üst bar başlığı) aynı haritayı kullanır.
 */
export const PAGE_TITLES = {
  '/': 'Ana Sayfa',
  '/dashboard': 'Dashboard',
  '/transactions': 'İşlemler',
  '/wealth': 'Varlık Portföyü',
  '/micro-invest': 'Küsürat Kumbarası (DeFi)',
  '/debt-snowball': 'Borç Kartopu',
  '/freelancer-smoother': 'Freelancer Nakit Dengesi',
  '/tax': 'Vergi Optimizasyonu',
  '/real-estate': 'Emlak & Kredi AI',
  '/anomaly': 'Güvenlik & Anomali',
  '/graph-analysis': 'Harcama Graph Analizi',
  '/system-monitor': 'Sistem Sağlığı',
  '/federated': 'Privacy-Preserving AI',
  '/escrow': 'Güvenli Ödeme (Web3)',
  '/goals': 'Finansal Hedefler',
  '/league': 'Tasarruf Ligi',
  '/cashflow': 'Nakit Akışı Simülasyonu',
  '/stress-test': 'Ekonomik Stres Testi',
  '/time-machine': 'Finansal Gelecek Zaman Makinesi',
  '/subscriptions': 'Abonelik Takibi',
  '/chat': 'AI Finansal Asistan',
  '/reports': 'Detaylı Analitik Raporlar',
  '/settings': 'Kullanıcı Ayarları',
  '/shop-sim': 'Dürtüsel Harcama Simülatörü',
  '/autonomous-agent': 'Self-Driving Money',
  '/financial-icu': 'Financial ICU (İflas Radarı)',
  '/dead-mans-switch': "Dead Man's Switch (Web3 Vasiyet)",
  '/voice-escrow': 'Voice Biometric Escrow',
  '/synthetic-data': 'Synthetic Data Generator',
};

export const pageTitleFor = (pathname) => PAGE_TITLES[pathname] || 'Finansal Koçunuz';

export default PAGE_TITLES;
