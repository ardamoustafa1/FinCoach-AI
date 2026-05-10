/**
 * BütçeAI - localStorage Veri Yönetimi
 * Tüm veri işlemleri için temel CRUD fonksiyonları
 */

const KEYS = {
  TRANSACTIONS: 'butceai_transactions',
  GOALS: 'butceai_goals',
  SETTINGS: 'butceai_settings',
  THEME: 'butceai_theme',
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
  return getItem(KEYS.GOALS, []);
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
