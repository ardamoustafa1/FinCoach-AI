import { abonelikleriTespit, yaklasanYenilemeler } from './subscriptionDetector';

export const WEEKLY_SUMMARY_SEEN_KEY = 'butceai_weekly_summary_seen_at';
export const UNUSUAL_SPENDING_KEY = 'butceai_unusual_spending_reviews';

export function readExpenses() {
  try {
    return JSON.parse(localStorage.getItem('butceai_transactions') || '[]')
      .map(tx => ({
        ...tx,
        tarih: tx.tarih || tx.date,
        tutar: Number(tx.tutar ?? tx.amount ?? 0),
        kategori: tx.kategori || tx.category || 'Diğer',
        magaza: tx.magaza || tx.title || tx.aciklama || 'İşlem',
        tur: tx.tur || (tx.type === 'income' ? 'gelir' : 'gider'),
      }))
      .filter(tx => tx.tarih && tx.tutar > 0 && tx.tur !== 'gelir');
  } catch {
    return [];
  }
}

export function latestMonthKey(expenses = readExpenses()) {
  const keys = expenses.map(tx => tx.tarih.slice(0, 7)).sort();
  return keys[keys.length - 1] || new Date().toISOString().slice(0, 7);
}

export function monthlyCategoryTotals(expenses, monthKey) {
  return expenses
    .filter(tx => tx.tarih?.startsWith(monthKey))
    .reduce((acc, tx) => {
      acc[tx.kategori] = (acc[tx.kategori] || 0) + tx.tutar;
      return acc;
    }, {});
}

export function budgetStatus(expenses, limits, monthKey = latestMonthKey(expenses)) {
  const totals = monthlyCategoryTotals(expenses, monthKey);
  return Object.entries(limits).map(([kategori, limit]) => {
    const harcanan = totals[kategori] || 0;
    const oran = limit > 0 ? (harcanan / limit) * 100 : 0;
    return { kategori, limit, harcanan, oran };
  });
}

export function upcomingSubscriptionReminders() {
  const dismissed = (() => {
    try { return JSON.parse(localStorage.getItem('butceai_dismissed_subs') || '[]'); }
    catch { return []; }
  })();
  return yaklasanYenilemeler(abonelikleriTespit(readExpenses(), dismissed));
}

export function weeklySummary(limits) {
  const expenses = readExpenses();
  const latestDate = expenses
    .map(tx => new Date(tx.tarih))
    .filter(date => !Number.isNaN(date.getTime()))
    .sort((a, b) => b - a)[0];
  const now = latestDate || new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weekly = expenses.filter(tx => {
    const tarih = new Date(tx.tarih);
    return tarih >= sevenDaysAgo && tarih <= now;
  });
  const total = weekly.reduce((sum, tx) => sum + tx.tutar, 0);
  const statuses = budgetStatus(expenses, limits);
  const greenCount = statuses.filter(item => item.oran < 80).length;
  return { total, greenCount, categoryCount: statuses.length };
}

export function shouldShowWeeklySummary() {
  const lastSeen = localStorage.getItem(WEEKLY_SUMMARY_SEEN_KEY);
  if (!lastSeen) return true;
  const days = (Date.now() - new Date(lastSeen).getTime()) / (1000 * 60 * 60 * 24);
  return days >= 7;
}

export function markWeeklySummarySeen() {
  localStorage.setItem(WEEKLY_SUMMARY_SEEN_KEY, new Date().toISOString());
}

export function detectUnusualSpending(transaction, previousExpenses = readExpenses()) {
  if (!transaction?.kategori || !transaction?.tarih || Number(transaction.tutar) <= 0) return null;

  const txDate = new Date(transaction.tarih);
  const start = new Date(txDate);
  start.setMonth(start.getMonth() - 3);
  const sameCategory = previousExpenses.filter(tx => {
    if (tx.id === transaction.id) return false;
    const tarih = new Date(tx.tarih);
    return tx.kategori === transaction.kategori && tarih < txDate && tarih >= start;
  });

  if (sameCategory.length === 0) return null;

  const average = sameCategory.reduce((sum, tx) => sum + tx.tutar, 0) / sameCategory.length;
  if (transaction.tutar > average * 2) {
    return {
      transaction,
      average: Math.round(average),
      amount: Number(transaction.tutar),
    };
  }

  return null;
}

export function saveUnusualSpendingDecision(alert, decision) {
  const list = (() => {
    try { return JSON.parse(localStorage.getItem(UNUSUAL_SPENDING_KEY) || '[]'); }
    catch { return []; }
  })();
  list.unshift({
    id: crypto.randomUUID(),
    transactionId: alert.transaction.id,
    kategori: alert.transaction.kategori,
    tutar: alert.amount,
    ortalama: alert.average,
    decision,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(UNUSUAL_SPENDING_KEY, JSON.stringify(list.slice(0, 100)));
}
