import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getTransactions } from '../utils/storage';

const monthlyData = [
  { ay: 'Oca', gelir: 42000, gider: 28000 },
  { ay: 'Şub', gelir: 45000, gider: 31000 },
  { ay: 'Mar', gelir: 48000, gider: 27000 },
  { ay: 'Nis', gelir: 44000, gider: 33000 },
  { ay: 'May', gelir: 72000, gider: 35000 },
];

export default function ReportsPage() {
  const transactions = getTransactions();
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0;
  const fmt = (v) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

  const stats = [
    { label: 'Toplam Gelir', value: fmt(totalIncome), color: 'text-accent-500' },
    { label: 'Toplam Gider', value: fmt(totalExpense), color: 'text-danger-500' },
    { label: 'Net Tasarruf', value: fmt(totalIncome - totalExpense), color: 'text-primary-500' },
    { label: 'Tasarruf Oranı', value: `%${savingsRate}`, color: 'text-warn-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">Raporlar 📊</h1>
        <p className="text-surface-700 dark:text-surface-200 mt-1">Detaylı finansal analizleriniz</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-5">
            <p className="text-sm text-surface-700 dark:text-surface-200 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Aylık Gelir / Gider</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="ay" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }} formatter={v => fmt(v)} />
              <Bar dataKey="gelir" fill="#6366f1" radius={[6,6,0,0]} />
              <Bar dataKey="gider" fill="#f87171" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Tasarruf Trendi</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData.map(d => ({ ...d, tasarruf: d.gelir - d.gider }))}>
              <defs><linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="ay" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }} formatter={v => fmt(v)} />
              <Area type="monotone" dataKey="tasarruf" stroke="#6366f1" fillOpacity={1} fill="url(#tGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
