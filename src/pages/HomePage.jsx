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
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';
import { getTransactions, getGoals } from '../utils/storage';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899'];

export default function HomePage() {
  const transactions = getTransactions();
  const goals = getGoals();

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Kategori bazlı harcama
  const categoryExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">
          Hoş Geldiniz! 👋
        </h1>
        <p className="text-surface-700 dark:text-surface-200 mt-1">
          Finansal durumunuzun genel özeti
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color, textColor, isCurrency = true }) => (
          <div
            key={label}
            className="glass-card rounded-2xl p-5 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-200">
                {label}
              </span>
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
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
        <div className="glass-card rounded-2xl p-6">
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
      <div className="glass-card rounded-2xl p-6">
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
