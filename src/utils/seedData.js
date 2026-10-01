/**
 * FinCoach AI - Örnek (Seed) Veriler
 * Uygulamayı ilk açışta doldurmak için kullanılır.
 */

export const sampleTransactions = [
  {
    id: '1',
    title: 'Maaş',
    amount: 45000,
    type: 'income',
    category: 'Maaş',
    date: '2026-05-01',
    createdAt: '2026-05-01T09:00:00Z',
  },
  {
    id: '2',
    title: 'Market Alışverişi',
    amount: 2350,
    type: 'expense',
    category: 'Market',
    date: '2026-05-02',
    createdAt: '2026-05-02T14:30:00Z',
  },
  {
    id: '3',
    title: 'Elektrik Faturası',
    amount: 890,
    type: 'expense',
    category: 'Faturalar',
    date: '2026-05-03',
    createdAt: '2026-05-03T10:00:00Z',
  },
  {
    id: '4',
    title: 'Freelance Proje',
    amount: 12000,
    type: 'income',
    category: 'Ek Gelir',
    date: '2026-05-05',
    createdAt: '2026-05-05T16:00:00Z',
  },
  {
    id: '5',
    title: 'Netflix Abonelik',
    amount: 149,
    type: 'expense',
    category: 'Eğlence',
    date: '2026-05-06',
    createdAt: '2026-05-06T08:00:00Z',
  },
  {
    id: '6',
    title: 'Benzin',
    amount: 1800,
    type: 'expense',
    category: 'Ulaşım',
    date: '2026-05-07',
    createdAt: '2026-05-07T11:00:00Z',
  },
  {
    id: '7',
    title: 'Restoran',
    amount: 650,
    type: 'expense',
    category: 'Yeme-İçme',
    date: '2026-05-08',
    createdAt: '2026-05-08T20:00:00Z',
  },
  {
    id: '8',
    title: 'Kira Geliri',
    amount: 15000,
    type: 'income',
    category: 'Kira',
    date: '2026-05-01',
    createdAt: '2026-05-01T10:00:00Z',
  },
];

export const sampleGoals = [
  {
    id: '1',
    title: 'Acil Durum Fonu',
    targetAmount: 100000,
    currentAmount: 42000,
    deadline: '2026-12-31',
    icon: '🛡️',
    color: '#8B949D',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Tatil Biriktirme',
    targetAmount: 30000,
    currentAmount: 18500,
    deadline: '2026-08-01',
    icon: '✈️',
    color: '#34C08A',
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: '3',
    title: 'Yeni Laptop',
    targetAmount: 55000,
    currentAmount: 12000,
    deadline: '2026-10-01',
    icon: '💻',
    color: '#D2894F',
    createdAt: '2026-03-01T00:00:00Z',
  },
];

export function seedDataIfEmpty() {
  return {
    transactions: sampleTransactions,
    goals: sampleGoals,
  };
}
