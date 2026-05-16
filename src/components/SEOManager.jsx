import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Dashboard | FinCoach AI',
  '/transactions': 'İşlemler | FinCoach AI',
  '/wealth': 'Varlık Yönetimi | FinCoach AI',
  '/micro-invest': 'Küsürat Kumbarası | FinCoach AI',
  '/debt-snowball': 'Borç Yapılandırma | FinCoach AI',
  '/freelancer-smoother': 'Freelancer Dengeleyici | FinCoach AI',
  '/tax': 'Vergi Asistanı | FinCoach AI',
  '/real-estate': 'Ev & Kredi AI | FinCoach AI',
  '/anomaly': 'Anomali & Fraud AI | FinCoach AI',
  '/shop-sim': 'Harcama Simülatörü | FinCoach AI',
  '/graph-analysis': 'Market Basket Graph | FinCoach AI',
  '/system-monitor': 'Sistem Mimarisi | FinCoach AI',
  '/federated': 'Federated AI | FinCoach AI',
  '/escrow': 'Web3 Escrow | FinCoach AI',
  '/goals': 'Finansal Hedefler | FinCoach AI',
  '/league': 'Tasarruf Ligi | FinCoach AI',
  '/cashflow': 'Nakit Akışı Analizi | FinCoach AI',
  '/stress-test': 'Finansal Stres Testi | FinCoach AI',
  '/time-machine': 'Finansal Zaman Makinesi | FinCoach AI',
  '/subscriptions': 'Abonelik Yönetimi | FinCoach AI',
  '/chat': 'AI Finansal Koç | FinCoach AI',
  '/reports': 'Raporlar | FinCoach AI',
  '/settings': 'Ayarlar | FinCoach AI',
  '/auth': 'Giriş Yap | FinCoach AI',
};

export default function SEOManager() {
  const location = useLocation();

  useEffect(() => {
    const title = pageTitles[location.pathname] || 'FinCoach AI - Akıllı Finansal Yönetim';
    document.title = title;
  }, [location]);

  return null;
}
