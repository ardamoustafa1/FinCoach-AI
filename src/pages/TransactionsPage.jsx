import { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Search, Filter } from 'lucide-react';
import { getTransactions } from '../utils/storage';

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const transactions = getTransactions();

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (val) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">
          İşlemler
        </h1>
        <p className="text-surface-700 dark:text-surface-200 mt-1">
          Tüm gelir ve gider işlemlerinizi görüntüleyin
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-700 dark:text-surface-200" />
          <input
            type="text"
            placeholder="İşlem ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl
                       bg-white dark:bg-surface-800
                       border border-surface-200 dark:border-surface-700
                       text-surface-900 dark:text-white
                       placeholder-surface-700 dark:placeholder-surface-200
                       focus:outline-none focus:ring-2 focus:ring-primary-500
                       transition-all duration-200"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'Tümü' },
            { value: 'income', label: 'Gelir' },
            { value: 'expense', label: 'Gider' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilterType(value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                ${
                  filterType === value
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200 border border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-700'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="glass-card rounded-2xl divide-y divide-surface-200 dark:divide-surface-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Filter className="w-12 h-12 mx-auto text-surface-700 dark:text-surface-200 mb-3" />
            <p className="text-surface-700 dark:text-surface-200">
              Eşleşen işlem bulunamadı.
            </p>
          </div>
        ) : (
          filtered.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors duration-200"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center
                    ${
                      tx.type === 'income'
                        ? 'bg-accent-500/10 text-accent-500'
                        : 'bg-danger-500/10 text-danger-500'
                    }`}
                >
                  {tx.type === 'income' ? (
                    <ArrowUpCircle className="w-5 h-5" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {tx.title}
                  </p>
                  <p className="text-xs text-surface-700 dark:text-surface-200 mt-0.5">
                    {tx.category} · {tx.date}
                  </p>
                </div>
              </div>
              <span
                className={`font-bold text-sm ${
                  tx.type === 'income' ? 'text-accent-500' : 'text-danger-500'
                }`}
              >
                {tx.type === 'income' ? '+' : '-'}
                {formatCurrency(tx.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
