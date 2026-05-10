import { getGoals } from '../utils/storage';

export default function GoalsPage() {
  const goals = getGoals();
  const fmt = (v) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">Hedefler 🎯</h1>
        <p className="text-surface-700 dark:text-surface-200 mt-1">Finansal hedeflerinizi takip edin</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {goals.map((g) => {
          const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
          return (
            <div key={g.id} className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${g.color}15` }}>{g.icon}</div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">{g.title}</h3>
                  <p className="text-xs text-surface-700 dark:text-surface-200">Hedef: {new Date(g.deadline).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-surface-700 dark:text-surface-200">İlerleme</span>
                  <span className="font-semibold text-surface-900 dark:text-white">%{pct.toFixed(0)}</span>
                </div>
                <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${g.color}, ${g.color}cc)` }} />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <div><p className="text-surface-700 dark:text-surface-200">Biriken</p><p className="font-bold text-surface-900 dark:text-white">{fmt(g.currentAmount)}</p></div>
                <div className="text-right"><p className="text-surface-700 dark:text-surface-200">Kalan</p><p className="font-bold text-surface-900 dark:text-white">{fmt(g.targetAmount - g.currentAmount)}</p></div>
              </div>
            </div>
          );
        })}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] border-2 border-dashed border-surface-200 dark:border-surface-700 hover:border-primary-500 transition-colors duration-300 cursor-pointer group">
          <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300"><span className="text-3xl">➕</span></div>
          <p className="font-semibold text-surface-700 dark:text-surface-200 group-hover:text-primary-500 transition-colors">Yeni Hedef Ekle</p>
        </div>
      </div>
    </div>
  );
}
