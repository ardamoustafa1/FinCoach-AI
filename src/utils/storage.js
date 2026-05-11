/**
 * BütçeAI - localStorage & Supabase Senkronizasyon Katmanı
 */
import { supabase } from './supabase';

const KEYS = {
  TRANSACTIONS: 'butceai_transactions',
  GOALS: 'butceai_goals',
  SETTINGS: 'butceai_settings',
  THEME: 'butceai_theme',
  BUDGET_LIMITS: 'butceai_budget_limits',
  CATEGORY_RULES: 'butceai_category_rules',
};

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
    return fallback;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ─── İşlemler (Transactions) ─────────────────────────────────
export function getTransactions() {
  return getItem(KEYS.TRANSACTIONS, []);
}

export async function saveTransaction(islem) {
  // 1. Yerel kaydet (Offline-first / Hızlı UI için)
  const list = getTransactions();
  const idx = list.findIndex(i => i.id === islem.id);
  
  const islemToSave = { ...islem };
  if (idx >= 0) {
    list[idx] = islemToSave;
  } else {
    if (!islemToSave.id) islemToSave.id = crypto.randomUUID();
    if (!islemToSave.createdAt) islemToSave.createdAt = new Date().toISOString();
    list.unshift(islemToSave);
  }
  setItem(KEYS.TRANSACTIONS, list);

  // 2. Supabase Senkronizasyonu
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const payload = {
      user_id: user.id,
      aciklama: islemToSave.aciklama,
      tutar: Number(islemToSave.tutar),
      tarih: islemToSave.tarih || new Date().toISOString().split('T')[0],
      kategori: islemToSave.kategori,
      magaza: islemToSave.magaza,
      tur: islemToSave.tur || 'gider'
    };

    if (idx >= 0 && typeof islemToSave.id === 'string' && islemToSave.id.length > 30) {
      // UUID ise update dene
      await supabase.from('transactions').upsert({ id: islemToSave.id, ...payload });
    } else {
      // Yeni ekle
      const { data } = await supabase.from('transactions').insert([payload]).select().single();
      if (data) {
        // ID'yi eşle
        islemToSave.id = data.id;
        setItem(KEYS.TRANSACTIONS, list.map(i => i.id === (islem.id || islemToSave.id) ? { ...i, id: data.id } : i));
      }
    }
  }
  
  if (islemToSave.magaza) saveCategoryRule(islemToSave.magaza, islemToSave.kategori);
  return islemToSave;
}

export async function removeTransaction(id) {
  // 1. Yerel sil
  const list = getTransactions().filter(i => i.id !== id);
  setItem(KEYS.TRANSACTIONS, list);

  // 2. Supabase sil
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('transactions').delete().eq('id', id);
  }
}

// ─── Hedefler (Goals) ────────────────────────────────────────
export function getGoals() {
  return getItem(KEYS.GOALS, []);
}

export async function addGoal(goal) {
  const goals = getGoals();
  const newGoal = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    currentAmount: 0,
    ...goal,
  };
  goals.push(newGoal);
  setItem(KEYS.GOALS, goals);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data } = await supabase.from('goals').insert([{
      user_id: user.id,
      baslik: newGoal.name,
      hedef_tutar: Number(newGoal.targetAmount),
      mevcut_tutar: Number(newGoal.currentAmount),
      icon: newGoal.icon,
      renk: newGoal.color,
      deadline: newGoal.deadline
    }]).select().single();
    
    if (data) {
      newGoal.id = data.id;
      setItem(KEYS.GOALS, goals.map(g => g.id === (goal.id || newGoal.id) ? { ...g, id: data.id } : g));
    }
  }
  return newGoal;
}

export async function updateGoal(id, updates) {
  const goals = getGoals().map((g) =>
    g.id === id ? { ...g, ...updates } : g
  );
  setItem(KEYS.GOALS, goals);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const payload = {};
    if (updates.name) payload.baslik = updates.name;
    if (updates.targetAmount) payload.hedef_tutar = Number(updates.targetAmount);
    if (updates.currentAmount !== undefined) payload.mevcut_tutar = Number(updates.currentAmount);
    if (updates.deadline) payload.deadline = updates.deadline;
    if (updates.icon) payload.icon = updates.icon;
    if (updates.color) payload.renk = updates.color;

    await supabase.from('goals').update(payload).eq('id', id);
  }
  return goals;
}

export async function deleteGoal(id) {
  const goals = getGoals().filter((g) => g.id !== id);
  setItem(KEYS.GOALS, goals);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('goals').delete().eq('id', id);
  }
  return goals;
}

// ─── Bütçe Limitleri ─────────────────────────────────────────
export function getBudgetLimits() {
  return getItem(KEYS.BUDGET_LIMITS, DEFAULT_LIMITS);
}

export async function saveBudgetLimits(limits) {
  setItem(KEYS.BUDGET_LIMITS, limits);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Toplu güncelleme Supabase tarafında biraz daha zahmetli olabilir, 
    // ama her kategoriyi tek tek upsert edelim
    const promises = Object.entries(limits).map(([kategori, limit]) => 
      supabase.from('budget_limits').upsert({
        user_id: user.id,
        category: kategori,
        limit_amount: Number(limit)
      }, { onConflict: 'user_id,category' })
    );
    await Promise.all(promises);
  }
  return limits;
}

export async function updateBudgetLimit(kategori, limit) {
  const limits = getBudgetLimits();
  limits[kategori] = Number(limit);
  setItem(KEYS.BUDGET_LIMITS, limits);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('budget_limits').upsert({
      user_id: user.id,
      category: kategori,
      limit_amount: Number(limit)
    }, { onConflict: 'user_id,category' });
  }
  return limits;
}

// ─── Diğerleri ───────────────────────────────────────────────
export function saveTheme(theme) {
  localStorage.setItem(KEYS.THEME, theme);
}

export function saveCategoryRule(magaza, kategori) {
  if (!magaza || !kategori) return;
  const rules = getItem(KEYS.CATEGORY_RULES, {});
  rules[magaza.trim().toLowerCase()] = kategori;
  setItem(KEYS.CATEGORY_RULES, rules);
}

export function suggestCategory(magaza) {
  if (!magaza) return '';
  const rules = getItem(KEYS.CATEGORY_RULES, {});
  return rules[magaza.trim().toLowerCase()] || '';
}
