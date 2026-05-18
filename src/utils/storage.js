/**
 * FinCoach AI - Supabase-first helper layer.
 *
 * Finansal veri localStorage'a yazılmaz. Bu dosya legacy import'lar için
 * session belleğinde küçük bir cache tutar ve mümkünse Supabase ile senkronize eder.
 */
import { supabase } from './supabase';

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

const memoryStore = {
  transactions: [],
  goals: [],
  budgetLimits: { ...DEFAULT_LIMITS },
  categoryRules: {},
};

const clone = (value) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));

function upsertById(list, item) {
  const id = item.id || crypto.randomUUID();
  const nextItem = { ...item, id };
  const idx = list.findIndex(i => i.id === id);
  if (idx >= 0) list[idx] = nextItem;
  else list.unshift(nextItem);
  return nextItem;
}

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user || null;
}

// ─── İşlemler (Transactions) ─────────────────────────────────
export function getTransactions() {
  return clone(memoryStore.transactions);
}

export async function saveTransaction(islem) {
  const islemToSave = upsertById(memoryStore.transactions, {
    createdAt: new Date().toISOString(),
    ...islem,
  });

  const user = await getUser();
  if (user) {
    const payload = {
      user_id: user.id,
      aciklama: islemToSave.aciklama,
      tutar: Number(islemToSave.tutar),
      tarih: islemToSave.tarih || new Date().toISOString().split('T')[0],
      kategori: islemToSave.kategori,
      magaza: islemToSave.magaza,
      tur: islemToSave.tur || 'gider',
    };

    const { data, error } = await supabase
      .from('transactions')
      .upsert({ id: islemToSave.id, ...payload })
      .select()
      .single();
    if (error) throw error;
    if (data?.id) islemToSave.id = data.id;
  }

  if (islemToSave.magaza) saveCategoryRule(islemToSave.magaza, islemToSave.kategori);
  return clone(islemToSave);
}

export async function removeTransaction(id) {
  memoryStore.transactions = memoryStore.transactions.filter(i => i.id !== id);

  const user = await getUser();
  if (user) {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
  }
}

// ─── Hedefler (Goals) ────────────────────────────────────────
export function getGoals() {
  return clone(memoryStore.goals);
}

export async function addGoal(goal) {
  const newGoal = upsertById(memoryStore.goals, {
    createdAt: new Date().toISOString(),
    currentAmount: 0,
    ...goal,
  });

  const user = await getUser();
  if (user) {
    const { data, error } = await supabase.from('goals').insert([{
      user_id: user.id,
      baslik: newGoal.name,
      hedef_tutar: Number(newGoal.targetAmount),
      mevcut_tutar: Number(newGoal.currentAmount),
      icon: newGoal.icon,
      renk: newGoal.color,
      deadline: newGoal.deadline,
    }]).select().single();
    if (error) throw error;
    if (data?.id) newGoal.id = data.id;
  }

  return clone(newGoal);
}

export async function updateGoal(id, updates) {
  memoryStore.goals = memoryStore.goals.map(g => g.id === id ? { ...g, ...updates } : g);

  const user = await getUser();
  if (user) {
    const payload = {};
    if (updates.name) payload.baslik = updates.name;
    if (updates.targetAmount) payload.hedef_tutar = Number(updates.targetAmount);
    if (updates.currentAmount !== undefined) payload.mevcut_tutar = Number(updates.currentAmount);
    if (updates.deadline) payload.deadline = updates.deadline;
    if (updates.icon) payload.icon = updates.icon;
    if (updates.color) payload.renk = updates.color;

    if (Object.keys(payload).length) {
      const { error } = await supabase.from('goals').update(payload).eq('id', id);
      if (error) throw error;
    }
  }

  return getGoals();
}

export async function deleteGoal(id) {
  memoryStore.goals = memoryStore.goals.filter(g => g.id !== id);

  const user = await getUser();
  if (user) {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
  }

  return getGoals();
}

// ─── Bütçe Limitleri ─────────────────────────────────────────
export function getBudgetLimits() {
  return clone(memoryStore.budgetLimits);
}

export async function saveBudgetLimits(limits) {
  memoryStore.budgetLimits = { ...limits };

  const user = await getUser();
  if (user) {
    const writes = Object.entries(limits || {}).map(([kategori, limit]) =>
      supabase.from('budget_limits').upsert({
        user_id: user.id,
        category: kategori,
        limit_amount: Number(limit),
      }, { onConflict: 'user_id,category' })
    );
    const results = await Promise.all(writes);
    const failed = results.find(({ error }) => error);
    if (failed?.error) throw failed.error;
  }

  return getBudgetLimits();
}

export async function updateBudgetLimit(kategori, limit) {
  memoryStore.budgetLimits = { ...memoryStore.budgetLimits, [kategori]: Number(limit) };

  const user = await getUser();
  if (user) {
    const { error } = await supabase.from('budget_limits').upsert({
      user_id: user.id,
      category: kategori,
      limit_amount: Number(limit),
    }, { onConflict: 'user_id,category' });
    if (error) throw error;
  }

  return getBudgetLimits();
}

// ─── Diğerleri ───────────────────────────────────────────────
export function saveTheme(theme) {
  localStorage.setItem('fincoach_theme', theme);
}

export function saveCategoryRule(magaza, kategori) {
  if (!magaza || !kategori) return;
  memoryStore.categoryRules[magaza.trim().toLowerCase()] = kategori;
}

export function suggestCategory(magaza) {
  if (!magaza) return '';
  return memoryStore.categoryRules[magaza.trim().toLowerCase()] || '';
}
