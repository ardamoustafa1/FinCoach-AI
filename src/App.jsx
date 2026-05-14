import { lazy, Suspense, useState, useEffect, useCallback, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import AuthPage from './pages/AuthPage';
import { saveTheme } from './utils/storage';
import { ToastProvider } from './components/ToastProvider';
import { supabase } from './utils/supabase';

const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LeaguePage = lazy(() => import('./pages/LeaguePage'));
const TimeMachinePage = lazy(() => import('./pages/TimeMachinePage'));
const CashFlowPage = lazy(() => import('./pages/CashFlowPage'));
const StressTestPage = lazy(() => import('./pages/StressTestPage'));
const WealthPage = lazy(() => import('./pages/WealthPage'));
const TaxOptimizerPage = lazy(() => import('./pages/TaxOptimizerPage'));
const RealEstatePage = lazy(() => import('./pages/RealEstatePage'));
const MicroInvestPage = lazy(() => import('./pages/MicroInvestPage'));
const DebtSnowballPage = lazy(() => import('./pages/DebtSnowballPage'));
const FreelancerPage = lazy(() => import('./pages/FreelancerPage'));
const AnomalyPage = lazy(() => import('./pages/AnomalyPage'));
const SystemMonitorPage = lazy(() => import('./pages/SystemMonitorPage'));
const FederatedLearningPage = lazy(() => import('./pages/FederatedLearningPage'));
const EscrowPage = lazy(() => import('./pages/EscrowPage'));
const ShopSimulationPage = lazy(() => import('./pages/ShopSimulationPage'));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('[Global Error]:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#050714', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: 20 }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>Hoppala! Bir Şeyler Yanlış Gitti.</h2>
            <p style={{ color: '#94A3B8', marginBottom: 24 }}>Uygulama beklenmedik bir hata ile karşılaştı. Lütfen sayfayı yenileyin.</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{ padding: '12px 24px', borderRadius: 12, background: '#7c3aed', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoadingScreen({ label = 'FinCoach AI Başlatılıyor...' }) {
  return (
    <div style={{ minHeight: '100vh', background: '#050714', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: 20 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(124,58,237,0.2)', borderTopColor: '#7c3aed', animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: 14, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.05em' }}>{label}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('fincoach_theme') || 'dark');
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const checkUserStatus = useCallback(async (user) => {
    try {
      // 1. Profil bilgisini çek
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      let profile = existingProfile;
      if (!profile) {
        const fallbackProfile = {
          id: user.id,
          email: user.email,
          full_name: user.email?.split('@')[0] || 'Kullanıcı',
          onboarding_completed: false
        };
        const { data: createdProfile } = await supabase
          .from('profiles')
          .upsert([fallbackProfile])
          .select()
          .single();
        profile = createdProfile || fallbackProfile;
      }

      setAuthUser({
        id: user.id,
        email: user.email,
        name: profile?.full_name || user.email.split('@')[0]
      });

      setOnboardingCompleted(profile?.onboarding_completed || false);

      // 2. Veri Senkronizasyonu (Buluttan yerele)
      const [tx, gl, lm] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('budget_limits').select('*').eq('user_id', user.id)
      ]);

      if (tx.data) {
        const formattedTx = tx.data.map(t => ({
          id: t.id,
          aciklama: t.aciklama,
          tutar: Number(t.tutar),
          tarih: t.tarih,
          kategori: t.kategori,
          magaza: t.magaza,
          tur: t.tur,
          createdAt: t.created_at
        }));
        localStorage.setItem('fincoach_transactions', JSON.stringify(formattedTx));
      }

      if (gl.data) {
        const formattedGl = gl.data.map(g => ({
          id: g.id,
          name: g.baslik,
          targetAmount: Number(g.hedef_tutar),
          currentAmount: Number(g.mevcut_tutar),
          deadline: g.deadline,
          icon: g.icon,
          color: g.renk,
          createdAt: g.created_at
        }));
        localStorage.setItem('fincoach_goals', JSON.stringify(formattedGl));
      }

      if (lm.data) {
        const limits = {};
        lm.data.forEach(l => { limits[l.category] = Number(l.limit_amount); });
        localStorage.setItem('fincoach_budget_limits', JSON.stringify(limits));
      }

    } catch (err) {
      console.error('Statü kontrol hatası:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Mevcut session'ı kontrol et
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkUserStatus(session.user);
      } else {
        setLoading(false);
      }
    });

    // 2. Auth değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkUserStatus(session.user);
      } else {
        setAuthUser(null);
        setOnboardingCompleted(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkUserStatus]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Henüz giriş yapılmamış
  if (!authUser) {
    return (
      <ToastProvider>
        <AuthPage onAuth={(user) => {
          setLoading(true);
          checkUserStatus({ id: user.id, email: user.email });
        }} />
      </ToastProvider>
    );
  }

  // Giriş yapıldı ama onboarding bitmedi
  if (!onboardingCompleted) {
    return (
      <ToastProvider>
        <Onboarding onComplete={async () => {
          await supabase.from('profiles').upsert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.name,
            onboarding_completed: true
          });
          setOnboardingCompleted(true);
        }} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<LoadingScreen label="Sayfa hazırlanıyor..." />}>
          <Routes>
            <Route element={
              <ErrorBoundary>
                <Layout theme={theme} onToggleTheme={toggleTheme} />
              </ErrorBoundary>
            }>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/league" element={<LeaguePage />} />
              <Route path="/time-machine" element={<TimeMachinePage />} />
              <Route path="/stress-test" element={<StressTestPage />} />
              <Route path="/cashflow" element={<CashFlowPage />} />
              <Route path="/wealth" element={<WealthPage />} />
              <Route path="/tax" element={<TaxOptimizerPage />} />
              <Route path="/real-estate" element={<RealEstatePage />} />
              <Route path="/micro-invest" element={<MicroInvestPage />} />
              <Route path="/debt-snowball" element={<DebtSnowballPage />} />
              <Route path="/freelancer-smoother" element={<FreelancerPage />} />
              <Route path="/anomaly" element={<AnomalyPage />} />
              <Route path="/system-monitor" element={<SystemMonitorPage />} />
              <Route path="/federated" element={<FederatedLearningPage />} />
              <Route path="/escrow" element={<EscrowPage />} />
              <Route path="/shop-sim" element={<ShopSimulationPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage theme={theme} onToggleTheme={toggleTheme} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
}
