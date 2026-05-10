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
  const currentMonthTx = transactions.filter(t => {
    const d = new Date(t.tarih || t.createdAt);
    return d >= startOfMonth && d <= endOfMonth;
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryExpenses = {};

  currentMonthTx.forEach(tx => {
    const amount = Number(tx.tutar || tx.amount || 0);
    const type = tx.tur || tx.type;
    
    if (type === 'gelir') {
      totalIncome += amount;
    } else {
      totalExpense += amount;
      categoryExpenses[tx.kategori] = (categoryExpenses[tx.kategori] || 0) + amount;
    }
  });

  // Günlük ortalama harcama hızı (ilk günse 1'e böl)
  const averageDailySpend = totalExpense / Math.max(1, currentDay);

  // Tahmini ay sonu harcaması
  const predictedTotalExpense = totalExpense + (averageDailySpend * remainingDays);
  
  // Eğer hiç gelir yoksa, tahmini bakiye sürekli eksi çıkar, bu yüzden bütçe limitleri toplamını "beklenen gelir/bütçe" sayabiliriz.
  const totalBudget = Object.values(limits).reduce((sum, val) => sum + val, 0);
  const effectiveIncome = totalIncome > 0 ? totalIncome : totalBudget;

  const predictedBalance = effectiveIncome - predictedTotalExpense;

  // En çok harcama yapılan kategoriyi bul
  let maxCategory = '';
  let maxAmount = 0;
  for (const [cat, amt] of Object.entries(categoryExpenses)) {
    if (amt > maxAmount) {
      maxAmount = amt;
      maxCategory = cat;
    }
  }

  // Tasarruf tavsiyesi hesapla (en çok harcanan kategoriyi %20 kısarsak)
  const potentialSavings = maxCategory ? Math.round(maxAmount * 0.20) : 0;
  
  // Tavsiye metni
  let advice = '';
  if (remainingDays === 0) {
    advice = 'Ayın son günündesin! Bütçe analizi tamamlandı.';
  } else if (predictedBalance < 0) {
    advice = `Kırmızı alarm! Ay sonunda ${new Intl.NumberFormat('tr-TR', {style: 'currency', currency: 'TRY'}).format(Math.abs(predictedBalance))} içeride olabilirsin. '${maxCategory}' harcamalarını %20 azaltırsan, ${potentialSavings}₺ tasarruf edip gidişatı düzeltebilirsin.`;
  } else {
    advice = `Harika gidiyorsun! Ay sonunda ${new Intl.NumberFormat('tr-TR', {style: 'currency', currency: 'TRY'}).format(predictedBalance)} artıda kapatacaksın. '${maxCategory}' harcamalarını %20 azaltarak tasarrufunu ${potentialSavings}₺ daha büyütebilirsin.`;
  }

  return {
    predictedBalance: Math.round(predictedBalance),
    predictedExpense: Math.round(predictedTotalExpense),
    isWarning: predictedBalance < 0,
    advice,
    maxCategory,
    potentialSavings
  };
}
