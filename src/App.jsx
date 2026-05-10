import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import GoalsPage from './pages/GoalsPage';
import ChatPage from './pages/ChatPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import Onboarding from './components/Onboarding';
import { getTheme, saveTheme } from './utils/storage';
import { seedDataIfEmpty } from './utils/seedData';
import { initMockData } from './data/mockData';
import { ToastProvider } from './components/ToastProvider';

export default function App() {
  const [theme, setTheme] = useState(() => getTheme());
  const [onboardingCompleted, setOnboardingCompleted] = useState(
    () => localStorage.getItem('butceai_onboarding_completed') === 'true'
  );

  useEffect(() => {
    seedDataIfEmpty();
    initMockData();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ToastProvider>
      {!onboardingCompleted && (
        <Onboarding onComplete={() => setOnboardingCompleted(true)} />
      )}
      <BrowserRouter>
        <Routes>
          <Route element={<Layout theme={theme} onToggleTheme={toggleTheme} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage theme={theme} onToggleTheme={toggleTheme} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
