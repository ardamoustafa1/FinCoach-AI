import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Target, Leaf } from 'lucide-react';
import { getTransactions, getGoals } from '../utils/storage';
import { calculateEcoScore } from '../utils/ecoScore';
import { calculatePrediction } from '../utils/predictive';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899'];

export default function HomePage() {
  const transactions = getTransactions();
  const goals = getGoals();
  
  // Real Data Calculations
  const ecoData = calculateEcoScore(transactions);
  const prediction = calculatePrediction(transactions);

  const totalIncome = transactions
    .filter((t) => t.type === 'income' || t.tur === 'gelir')
    .reduce((sum, t) => sum + Number(t.amount || t.tutar || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense' || t.tur === 'gider' || (!t.tur && Number(t.tutar) < 0))
    .reduce((sum, t) => sum + Math.abs(Number(t.amount || t.tutar || 0)), 0);

  const balance = totalIncome - totalExpense;

  // Kategori bazlı harcama
  const categoryExpenses = transactions
    .filter((t) => t.type === 'expense' || t.tur === 'gider' || (!t.tur && Number(t.tutar) < 0))
    .reduce((acc, t) => {
      const cat = t.category || t.kategori || 'Diğer';
      acc[cat] = (acc[cat] || 0) + Math.abs(Number(t.amount || t.tutar || 0));
      return acc;
    }, {});

  const pieData = Object.entries(categoryExpenses).map(([name, value]) => ({
    name,
    value,
  }));

  // Son 7 günlük bar chart verisi
  const barData = [
    { day: 'Pzt', gelir: 8000, gider: 3200 },
    { day: 'Sal', gelir: 2000, gider: 1500 },
    { day: 'Çar', gelir: 0, gider: 890 },
    { day: 'Per', gelir: 12000, gider: 650 },
    { day: 'Cum', gelir: 0, gider: 1800 },
    { day: 'Cmt', gelir: 15000, gider: 2350 },
    { day: 'Paz', gelir: 0, gider: 149 },
  ];

  const summaryCards = [
    {
      label: 'Toplam Bakiye',
      value: balance,
      icon: Wallet,
      color: 'from-primary-500 to-purple-500',
      textColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      label: 'Gelirler',
      value: totalIncome,
      icon: TrendingUp,
      color: 'from-accent-500 to-emerald-400',
      textColor: 'text-accent-600 dark:text-accent-400',
    },
    {
      label: 'Giderler',
      value: totalExpense,
      icon: TrendingDown,
      color: 'from-danger-500 to-rose-400',
      textColor: 'text-danger-500 dark:text-danger-400',
    },
    {
      label: 'Aktif Hedefler',
      value: goals.length,
      icon: Target,
      color: 'from-warn-500 to-amber-400',
      textColor: 'text-warn-500 dark:text-warn-400',
      isCurrency: false,
    },
  ];

  const formatCurrency = (val) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Title */}
      <div className="page-hero p-5 md:p-7 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-600 dark:text-primary-300 mb-2">Canlı finans kokpiti</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-surface-950 dark:text-white">
              Merhaba {localStorage.getItem('butceai_user_name') || 'Kullanıcı'},<br/>paranı daha net gör.
            </h1>
            <p className="text-surface-700 dark:text-surface-200 mt-3 max-w-2xl">
              Harcamalar, hedefler, raporlar ve AI içgörüleri tek bir akıcı deneyimde.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 min-w-full sm:min-w-[360px]">
            {[
              ['AI', 'aktif'],
              ['OCR', 'hazır'],
              ['Demo', 'sunum modu'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/60 dark:border-surface-700 bg-white/64 dark:bg-surface-900/50 px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-surface-500">{label}</p>
                <p className="text-sm font-black text-surface-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color, textColor, isCurrency = true }) => (
          <div
            key={label}
            className="glass-card p-5 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-200">
                {label}
              </span>
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${textColor}`}>
              {isCurrency ? formatCurrency(value) : value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Predictive AI Banner (Zaman Makinesi) */}
        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-purple-500 via-primary-500 to-blue-500 shadow-xl shadow-primary-500/10 hover:-translate-y-1 transition-transform duration-300 h-full flex">
          <div className="bg-white dark:bg-surface-850 rounded-2xl p-5 md:p-6 flex flex-col items-start gap-4 flex-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/10 to-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
                <span className="text-2xl">🔮</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-surface-900 dark:text-white">Bütçe Zaman Makinesi</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-wider animate-pulse">AI Tahmini</span>
              </div>
            </div>
            <p className="text-sm text-surface-700 dark:text-surface-200 flex-1 leading-relaxed">
              {prediction.advice}
            </p>
            <div className="flex items-center gap-3 w-full pt-2">
              <div className="flex-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-2 text-center">
                <p className="text-[10px] uppercase text-surface-500 font-bold mb-0.5">Tahmini Bakiye</p>
                <p className={`text-sm font-black ${prediction.isWarning ? 'text-danger-500' : 'text-emerald-500'}`}>
                  {prediction.isWarning ? '' : '+'}{formatCurrency(prediction.predictedBalance)}
                </p>
              </div>
              <button className="flex-[2] py-2.5 rounded-xl bg-surface-900 dark:bg-white text-white dark:text-surface-900 text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer">
                Plana Uymak İçin Tavsiye Al
              </button>
            </div>
          </div>
        </div>

        {/* Eco-Score Banner */}
        <div className={`rounded-2xl p-[1px] bg-gradient-to-r ${
            ecoData.status === 'excellent' ? 'from-emerald-400 to-green-500' :
            ecoData.status === 'good' ? 'from-blue-400 to-emerald-500' :
            'from-warn-400 to-danger-500'
          } shadow-xl shadow-emerald-500/10 hover:-translate-y-1 transition-transform duration-300 h-full flex`}
        >
          <div className="bg-white dark:bg-surface-850 rounded-2xl p-5 md:p-6 flex flex-col items-start gap-4 flex-1">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                ecoData.status === 'excellent' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                ecoData.status === 'good' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                'bg-danger-500/10 border-danger-500/20 text-danger-500'
              }`}>
                <Leaf className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-surface-900 dark:text-white">ESG & Karbon Ayak İzi</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">Sürdürülebilir Bütçe</span>
              </div>
            </div>
            <p className="text-sm text-surface-700 dark:text-surface-200 flex-1 leading-relaxed">
              {ecoData.message}
            </p>
            <div className="flex items-center gap-3 w-full pt-2">
              <div className="flex-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-2 text-center">
                <p className="text-[10px] uppercase text-surface-500 font-bold mb-0.5">Aylık Karbon İzin</p>
                <p className={`text-sm font-black ${
                  ecoData.status === 'excellent' ? 'text-emerald-500' :
                  ecoData.status === 'good' ? 'text-blue-500' : 'text-danger-500'
                }`}>
                  {ecoData.footprint} kg CO₂
                </p>
              </div>
              <button className="flex-[2] py-2.5 rounded-xl border-2 border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white text-sm font-bold hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors cursor-pointer">
                Yeşil Bütçe Önerileri
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
            Haftalık Gelir / Gider
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Bar dataKey="gelir" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="gider" fill="#f87171" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
            Harcama Dağılımı
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                }}
                formatter={(value) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-2">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-surface-200">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
          Son İşlemler
        </h2>
        <div className="space-y-3">
          {transactions.slice(0, 5).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-3 px-4 rounded-xl
                         bg-surface-50 dark:bg-surface-800/50
                         hover:bg-surface-100 dark:hover:bg-surface-800
                         transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg
                    ${tx.type === 'income' ? 'bg-accent-500/10' : 'bg-danger-500/10'}`}
                >
                  {tx.type === 'income' ? '📈' : '📉'}
                </div>
                <div>
                  <p className="font-medium text-surface-900 dark:text-white text-sm">
                    {tx.title}
                  </p>
                  <p className="text-xs text-surface-700 dark:text-surface-200">
                    {tx.category} · {tx.date}
                  </p>
                </div>
              </div>
              <span
                className={`font-semibold text-sm ${
                  tx.type === 'income'
                    ? 'text-accent-500'
                    : 'text-danger-500'
                }`}
              >
                {tx.type === 'income' ? '+' : '-'}
                {formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
