import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import FeatureTourModal from './components/FeatureTourModal';
import CommandMenu from './components/CommandMenu';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import useStore from './store/useStore';
import { ToastProvider } from './components/ToastProvider';
import { supabase } from './utils/supabase';
import ErrorBoundary from './components/ErrorBoundary';
import { DEMO_EMAIL } from './config/demoAccount';
import { mockGelir, mockTransactions } from './data/mockData';
import { sampleGoals } from './utils/seedData';
import { pageTitleFor } from './config/pageTitles';

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
const GraphAnalysisPage = lazy(() => import('./pages/GraphAnalysisPage'));
const SystemMonitorPage = lazy(() => import('./pages/SystemMonitorPage'));
const FederatedLearningPage = lazy(() => import('./pages/FederatedLearningPage'));
const EscrowPage = lazy(() => import('./pages/EscrowPage'));
const ShopSimulationPage = lazy(() => import('./pages/ShopSimulationPage'));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'));
const AutonomousAgentPage = lazy(() => import('./pages/AutonomousAgentPage'));
const FinancialICUPage = lazy(() => import('./pages/FinancialICUPage'));
const DeadMansSwitchPage = lazy(() => import('./pages/DeadMansSwitchPage'));
const VoiceBiometricEscrowPage = lazy(() => import('./pages/VoiceBiometricEscrowPage'));
const SyntheticDataGeneratorPage = lazy(() => import('./pages/SyntheticDataGeneratorPage'));

const DEMO_SCOPED_KEYS = [
  'fincoach_transactions', 'fincoach_goals', 'fincoach_budget_limits', 'fincoach_gelir',
  'fincoach_category_rules', 'fincoach_mock_initialized', 'fincoach_profile',
  'fincoach_income', 'fincoach_bank', 'fincoach_emotion_logs',
];

const demoBudgetLimits = {
  Market: 3000,
  'Yemek Siparişi': 2000,
  Ulaşım: 1000,
  Abonelik: 500,
  Fatura: 1500,
  Alışveriş: 2000,
  Eğlence: 800,
  Sağlık: 1000,
};

function hydrateDemoWorkspace() {
  useStore.getState().setUserProfile({
    name: 'Demo Kullanıcı',
    email: DEMO_EMAIL,
    phone: '+90 555 000 00 00',
    bank: 'Finansal Koç',
  });
  useStore.getState().setTransactions([...mockTransactions, ...mockGelir].map((tx) => ({
    id: tx.id,
    aciklama: tx.aciklama || tx.title || '',
    tutar: Number(tx.tutar ?? tx.amount ?? 0),
    tarih: tx.tarih || tx.date || new Date().toISOString().slice(0, 10),
    kategori: tx.kategori || tx.category || 'Diğer',
    magaza: tx.magaza || '',
    tur: tx.tur || (tx.type === 'income' ? 'gelir' : 'gider'),
    createdAt: tx.createdAt || new Date().toISOString(),
  })));
  useStore.getState().setGoals(sampleGoals.map((goal) => ({
    id: goal.id,
    name: goal.title || goal.name,
    targetAmount: Number(goal.targetAmount || 0),
    currentAmount: Number(goal.currentAmount || 0),
    deadline: goal.deadline,
    icon: goal.icon,
    color: goal.color,
    createdAt: goal.createdAt,
  })));
  useStore.getState().setBudgetLimits(demoBudgetLimits);
}

/** Inner component so it can use useLocation (must be inside BrowserRouter) */
function TourOverlay() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('fincoach:open-tour', handler);
    return () => window.removeEventListener('fincoach:open-tour', handler);
  }, []);

  if (!open) return null;
  return (
    <FeatureTourModal
      pathname={pathname}
      forceShow
      onClose={() => setOpen(false)}
    />
  );
}

function RouteHandler() {
  const { pathname } = useLocation();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    // 1. Üstte ince bir loading bar efekti başlat
    setNavigating(true);
    
    // 2. Yumuşak Scroll Restoration (Timeout ile DOM'un çizilmesini bekler)
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      setNavigating(false);
    }, 50);

    // 3. SEO / Sayfa başlıkları
    const currentTitle = pageTitleFor(pathname);
    document.title = `${currentTitle} | FinCoach AI`;

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <style>{`
        @keyframes top-progress {
          0% { width: 0%; opacity: 1; }
          50% { width: 70%; opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
        .nav-progress-bar {
          position: fixed; top: 0; left: 0; height: 3px;
          background: linear-gradient(90deg, #C3CBD3, #45939C, #C0705C);
          z-index: 99999; pointer-events: none;
          animation: top-progress 0.4s ease-out forwards;
        }
      `}</style>
      {navigating && <div className="nav-progress-bar" />}
    </>
  );
}

// ErrorBoundary: ./components/ErrorBoundary.jsx'den import ediliyor (KRİTİK-02 düzeltmesi)

function LoadingScreen({ label = 'FinCoach AI başlatılıyor…' }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#0A0B0C', color: '#F2F4F5',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 26, position: 'relative', overflow: 'hidden', padding: 24,
    }}>
      <style>{`
        @keyframes boot-sweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes boot-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      `}</style>

      {/* Zemin ışığı */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(600px 400px at 50% 38%, rgba(195,203,211,0.10), transparent 68%)',
      }} />

      <div style={{ position: 'relative', textAlign: 'center', animation: 'boot-fade .6s cubic-bezier(0.16,1,0.3,1) both' }}>
        <p style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: 34, letterSpacing: '-0.02em', marginBottom: 10,
        }}>
          FinCoach<span style={{ color: '#C3CBD3' }}> AI</span>
        </p>
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: '#6B7075',
        }} aria-live="polite">
          {label}
        </p>
      </div>

      {/* İnce yükleme çizgisi */}
      <div style={{ position: 'relative', width: 190, height: 1, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <span style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent, #C3CBD3, transparent)',
          animation: 'boot-sweep 1.5s cubic-bezier(0.65,0,0.35,1) infinite',
        }} />
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('fincoach_theme') || 'dark');
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [authView, setAuthView] = useState(null); // null → tanıtım sayfası | 'login' | 'register'

  const checkUserStatus = useCallback(async (user) => {
    try {
      if (user?.isDemo || user?.id === 'demo-local-123' || user?.email?.toLowerCase() === DEMO_EMAIL.toLowerCase()) {
        hydrateDemoWorkspace();
        setAuthUser({
          id: 'demo-local-123',
          email: DEMO_EMAIL,
          name: 'Demo Kullanıcı'
        });
        setOnboardingCompleted(true);
        setSyncError(null);
        return;
      }

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
      useStore.getState().setUserProfile({
        name: profile?.full_name || user.email.split('@')[0],
        email: user.email,
        phone: profile?.phone_text || ''
      });

      setOnboardingCompleted(profile?.onboarding_completed || false);

      // 2. Veri Senkronizasyonu (Buluttan yerele)
      const [tx, gl, lm] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('budget_limits').select('*').eq('user_id', user.id)
      ]);

      if (tx.error || gl.error || lm.error) {
        setSyncError('Veriler yüklenirken bir sorun oluştu. Çevrimdışı modda çalışıyor olabilirsiniz.');
        console.error('Data Sync Error:', { tx: tx.error, gl: gl.error, lm: lm.error });
      } else {
        setSyncError(null);
      }

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
        useStore.getState().setTransactions(formattedTx);
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
        useStore.getState().setGoals(formattedGl);
      }

      if (lm.data) {
        const limits = {};
        lm.data.forEach(l => { limits[l.category] = Number(l.limit_amount); });
        useStore.getState().setBudgetLimits(limits);
      }

    } catch (err) {
      console.error('Statü kontrol hatası:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('fincoach_demo_session') === 'true') {
      Promise.resolve().then(() => {
        hydrateDemoWorkspace();
        setAuthUser({
          id: 'demo-local-123',
          email: DEMO_EMAIL,
          name: 'Demo Kullanıcı'
        });
        setOnboardingCompleted(true);
        setLoading(false);
      });
      return undefined;
    }

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
    // Tanıtım sayfası daima koyu temada sunulur; uygulama içinde kullanıcı tercihi geçerlidir.
    const showingLanding = !authUser && !authView;
    if (theme === 'dark' || showingLanding) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('fincoach_theme', theme);
  }, [theme, authUser, authView]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Henüz giriş yapılmamış → önce tanıtım sitesi, sonra kimlik doğrulama
  if (!authUser) {
    const enterDemo = () => {
      DEMO_SCOPED_KEYS.forEach((key) => localStorage.removeItem(key));
      localStorage.setItem('fincoach_demo_session', 'true');
      hydrateDemoWorkspace();
      setAuthUser({ id: 'demo-local-123', email: DEMO_EMAIL, name: 'Demo Kullanıcı' });
      setOnboardingCompleted(true);
      setLoading(false);
    };

    if (!authView) {
      return (
        <ToastProvider>
          <LandingPage
            onEnter={(mode) => {
              if (mode === 'demo') { enterDemo(); return; }
              setAuthView(mode === 'register' ? 'register' : 'login');
            }}
          />
        </ToastProvider>
      );
    }

    return (
      <ToastProvider>
        <AuthPage initialMode={authView} onBack={() => setAuthView(null)} onAuth={(user) => {
          if (user?.isDemo || user?.id === 'demo-local-123' || user?.email?.toLowerCase() === DEMO_EMAIL.toLowerCase()) {
            hydrateDemoWorkspace();
            setAuthUser({
              id: 'demo-local-123',
              email: DEMO_EMAIL,
              name: 'Demo Kullanıcı'
            });
            setOnboardingCompleted(true);
            setLoading(false);
            return;
          }
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
        <Onboarding userName={authUser.name} onComplete={async (profile) => {
          await supabase.from('profiles').upsert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.name,
            onboarding_completed: true
          });
          useStore.getState().setBehavioralProfile(profile);
          useStore.getState().setUserProfile({ bank: profile?.bank || 'Finansal Koç' });
          setOnboardingCompleted(true);
        }} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <RouteHandler />
        <TourOverlay />
        <CommandMenu />
        {authUser?.id === 'demo-local-123' && (
          <div style={{
            position: 'fixed', bottom: 18, right: 18, zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(195,203,211,0.10)', border: '1px solid rgba(195,203,211,0.3)',
            backdropFilter: 'blur(18px)', color: '#E4E9ED',
            padding: '8px 14px', borderRadius: 999,
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
            pointerEvents: 'none',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: '#C3CBD3' }} />
            Demo Modu
          </div>
        )}
        {syncError && (
          <div style={{
            position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
            background: 'rgba(219,92,78,0.12)', border: '1px solid rgba(219,92,78,0.36)',
            backdropFilter: 'blur(20px)', color: '#F0AFA6',
            padding: '12px 20px', borderRadius: 999,
            display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, fontWeight: 500,
            animation: 'fadeSlideUp .4s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: '#DB5C4E', flexShrink: 0 }} />
            {syncError}
            <button onClick={() => setSyncError(null)} aria-label="Kapat" style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 2, marginLeft: 4, opacity: 0.7, fontSize: 14 }}>✕</button>
          </div>
        )}
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
              <Route path="/graph-analysis" element={<GraphAnalysisPage />} />
              <Route path="/system-monitor" element={<SystemMonitorPage />} />
              <Route path="/federated" element={<FederatedLearningPage />} />
              <Route path="/escrow" element={<EscrowPage />} />
              <Route path="/shop-sim" element={<ShopSimulationPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/autonomous-agent" element={<AutonomousAgentPage />} />
              <Route path="/financial-icu" element={<FinancialICUPage />} />
              <Route path="/dead-mans-switch" element={<DeadMansSwitchPage />} />
              <Route path="/voice-escrow" element={<VoiceBiometricEscrowPage />} />
              <Route path="/synthetic-data" element={<SyntheticDataGeneratorPage />} />
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
