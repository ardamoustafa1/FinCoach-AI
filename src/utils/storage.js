/**
 * BütçeAI - localStorage Veri Yönetimi
 * Tüm veri işlemleri için temel CRUD fonksiyonları
 */

const KEYS = {
  TRANSACTIONS: 'butceai_transactions',
  GOALS: 'butceai_goals',
  SETTINGS: 'butceai_settings',
  THEME: 'butceai_theme',
  BUDGET_LIMITS: 'butceai_budget_limits',
  CATEGORY_RULES: 'butceai_category_rules',
};

// ─── Varsayılan kategori limitleri ───────────────────────────
export const DEFAULT_LIMITS = {
  Market: 3000,
  'Yemek Siparişi': 2000,
  Ulaşım: 1000,
  Abonelik: 500,
  Fatura: 1500,
  Alışveriş: 2000,
  Eğlence: 800,
  Sağlık: 1000,
};

// ─── Genel yardımcılar ───────────────────────────────────────
function getItem(key, fallback = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    console.error(`[BütçeAI] Veri okunamadı: ${key}`);
    return fallback;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    console.error(`[BütçeAI] Veri yazılamadı: ${key}`);
    return false;
  }
}

// ─── İşlemler (Transactions) ─────────────────────────────────
export function getTransactions() {
  return getItem(KEYS.TRANSACTIONS, []);
}

export function saveTransactions(transactions) {
  return setItem(KEYS.TRANSACTIONS, transactions);
}

export function addTransaction(transaction) {
  const transactions = getTransactions();
  const newTransaction = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...transaction,
  };
  transactions.unshift(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
}

export function deleteTransaction(id) {
  const transactions = getTransactions().filter((t) => t.id !== id);
  saveTransactions(transactions);
  return transactions;
}

// ─── Hedefler (Goals) ────────────────────────────────────────
export function getGoals() {
  const existing = getItem(KEYS.GOALS, null);
  if (existing) return existing;

  // Demo verileri
  const bugun = new Date();
  const ucAySonra = new Date(bugun); ucAySonra.setMonth(ucAySonra.getMonth() + 3);
  const altiAySonra = new Date(bugun); altiAySonra.setMonth(altiAySonra.getMonth() + 6);
  const onIkiAySonra = new Date(bugun); onIkiAySonra.setMonth(onIkiAySonra.getMonth() + 12);

  const demoGoals = [
    {
      id: crypto.randomUUID(),
      createdAt: bugun.toISOString(),
      name: 'Tatil Fonu',
      targetAmount: 8000,
      currentAmount: 5200,
      deadline: ucAySonra.toISOString().slice(0, 10),
      icon: '✈️',
      color: 'blue'
    },
    {
      id: crypto.randomUUID(),
      createdAt: bugun.toISOString(),
      name: 'Yeni Laptop',
      targetAmount: 15000,
      currentAmount: 4500,
      deadline: altiAySonra.toISOString().slice(0, 10),
      icon: '📱',
      color: 'purple'
    },
    {
      id: crypto.randomUUID(),
      createdAt: bugun.toISOString(),
      name: 'Acil Durum Fonu',
      targetAmount: 20000,
      currentAmount: 9000,
      deadline: onIkiAySonra.toISOString().slice(0, 10),
      icon: '💰',
      color: 'emerald'
    }
  ];
  saveGoals(demoGoals);
  return demoGoals;
}

export function saveGoals(goals) {
  return setItem(KEYS.GOALS, goals);
}

export function addGoal(goal) {
  const goals = getGoals();
  const newGoal = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    currentAmount: 0,
    ...goal,
  };
  goals.push(newGoal);
  saveGoals(goals);
  return newGoal;
}

export function updateGoal(id, updates) {
  const goals = getGoals().map((g) =>
    g.id === id ? { ...g, ...updates } : g
  );
  saveGoals(goals);
  return goals;
}

export function deleteGoal(id) {
  const goals = getGoals().filter((g) => g.id !== id);
  saveGoals(goals);
  return goals;
}

// ─── Ayarlar (Settings) ──────────────────────────────────────
export function getSettings() {
  return getItem(KEYS.SETTINGS, {
    currency: 'TRY',
    language: 'tr',
    notifications: true,
  });
}

export function saveSettings(settings) {
  return setItem(KEYS.SETTINGS, settings);
}

// ─── Tema (Theme) ────────────────────────────────────────────
export function getTheme() {
  return localStorage.getItem(KEYS.THEME) || 'dark';
}

export function saveTheme(theme) {
  localStorage.setItem(KEYS.THEME, theme);
}

// ─── Bütçe Limitleri ─────────────────────────────────────────
export function getBudgetLimits() {
  return getItem(KEYS.BUDGET_LIMITS, DEFAULT_LIMITS);
}

export function saveBudgetLimits(limits) {
  return setItem(KEYS.BUDGET_LIMITS, limits);
}

export function updateBudgetLimit(kategori, limit) {
  const limits = getBudgetLimits();
  limits[kategori] = Number(limit);
  return saveBudgetLimits(limits);
}

// ─── Kategori Öğrenme Kuralları ──────────────────────────────
export function getCategoryRules() {
  return getItem(KEYS.CATEGORY_RULES, {});
}

export function saveCategoryRule(magaza, kategori) {
  if (!magaza || !kategori) return;
  const rules = getCategoryRules();
  rules[magaza.trim().toLowerCase()] = kategori;
  setItem(KEYS.CATEGORY_RULES, rules);
}

export function suggestCategory(magaza) {
  if (!magaza) return null;
  const rules = getCategoryRules();
  return rules[magaza.trim().toLowerCase()] || null;
}

// ─── İşlem CRUD ──────────────────────────────────────────────
export function saveTransaction(islem) {
  const list = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
  const idx = list.findIndex(i => i.id === islem.id);
  if (idx >= 0) {
    list[idx] = islem;
  } else {
    islem.id = crypto.randomUUID();
    islem.createdAt = new Date().toISOString();
    list.unshift(islem);
  }
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(list));
  // Kategori kuralı öğren
  if (islem.magaza) saveCategoryRule(islem.magaza, islem.kategori);
  return islem;
}

export function removeTransaction(id) {
  const list = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]')
    .filter(i => i.id !== id);
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(list));
}
