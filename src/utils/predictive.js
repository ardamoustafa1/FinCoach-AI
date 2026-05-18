import { getBudgetLimits } from './storage';

export function calculatePrediction(transactions) {
  const limits = getBudgetLimits();
  const now = new Date();

  // Bu ayın ilk günü ve son günü
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const totalDays = endOfMonth.getDate();
  const currentDay = now.getDate();
  const remainingDays = totalDays - currentDay;

  // Bu ayki işlemler
  const currentMonthTx = (transactions || []).filter(t => {
    const d = new Date(t.tarih || t.createdAt);
    return d >= startOfMonth && d <= endOfMonth;
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryExpenses = {};

  // Güne göre harcama haritası (gün → toplam gider)
  const dailyExpenseMap = {};
  currentMonthTx.forEach(tx => {
    const amount = Number(tx.tutar || tx.amount || 0);
    const type = tx.tur || tx.type;
    const day = new Date(tx.tarih || tx.createdAt).getDate();

    if (type === 'gelir') {
      totalIncome += amount;
    } else {
      totalExpense += amount;
      categoryExpenses[tx.kategori] = (categoryExpenses[tx.kategori] || 0) + amount;
      dailyExpenseMap[day] = (dailyExpenseMap[day] || 0) + amount;
    }
  });

  // ─── Ağırlıklı Üstel Tahmin (Exponential Weighted Moving Average) ───
  // Son 7 günün harcamalarına daha fazla ağırlık ver
  const ALPHA = 0.6; // yakın geçmişe ağırlık (0=düz ortalama, 1=sadece bugün)
  let ewmaDaily = 0;
  let weightSum = 0;
  let decayWeight = 1.0;

  for (let d = currentDay; d >= 1; d--) {
    const daySpend = dailyExpenseMap[d] || 0;
    ewmaDaily += daySpend * decayWeight;
    weightSum += decayWeight;
    decayWeight *= (1 - ALPHA);
  }

  const weightedDailyAvg = weightSum > 0 ? ewmaDaily / weightSum : 0;

  // ─── Hafta sonu etkisi ───
  // Kalan günlerde hafta sonu kaç gün var?
  let weekendDaysLeft = 0;
  let weekdayDaysLeft = 0;
  for (let d = currentDay + 1; d <= totalDays; d++) {
    const dayOfWeek = new Date(now.getFullYear(), now.getMonth(), d).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) weekendDaysLeft++;
    else weekdayDaysLeft++;
  }

  // Hafta sonları genellikle %40 daha fazla harcama (genel ortalama)
  const WEEKEND_MULTIPLIER = 1.4;
  const adjustedRemainingSpend =
    (weekdayDaysLeft * weightedDailyAvg) +
    (weekendDaysLeft * weightedDailyAvg * WEEKEND_MULTIPLIER);

  // Tahmini ay sonu harcaması
  const predictedTotalExpense = totalExpense + adjustedRemainingSpend;

  // Eğer hiç gelir yoksa, bütçe limitleri toplamını kullan
  const totalBudget = Object.values(limits).reduce((sum, val) => sum + val, 0);
  const effectiveIncome = totalIncome > 0 ? totalIncome : totalBudget;

  const predictedBalance = effectiveIncome - predictedTotalExpense;

  // En çok harcama yapılan kategoriyi bul
  let maxCategory = '';
  let maxAmount = 0;
  for (const [cat, amt] of Object.entries(categoryExpenses)) {
    if (amt > maxAmount) { maxAmount = amt; maxCategory = cat; }
  }

  // Tasarruf tavsiyesi (%20 kısma senaryosu)
  const potentialSavings = maxCategory ? Math.round(maxAmount * 0.20) : 0;

  // Tavsiye metni
  let advice;
  if (remainingDays === 0) {
    advice = 'Ayın son günündesin! Bütçe analizi tamamlandı.';
  } else if (predictedBalance < 0) {
    advice = `🔴 Dikkat! Ay sonunda ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Math.abs(predictedBalance))} açık verebilirsin. '${maxCategory}' harcamalarını %20 azaltırsan ${potentialSavings}₺ tasarruf edip gidişatı düzeltebilirsin.`;
  } else {
    advice = `✅ Harika gidiyorsun! Ay sonunda ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(predictedBalance)} artıda kapanması bekleniyor. '${maxCategory}' harcamalarını %20 azaltarak ${potentialSavings}₺ daha biriktirebilirsin.`;
  }

  return {
    predictedBalance: Math.round(predictedBalance),
    predictedExpense: Math.round(predictedTotalExpense),
    isWarning: predictedBalance < 0,
    advice,
    maxCategory,
    potentialSavings,
  };
}
