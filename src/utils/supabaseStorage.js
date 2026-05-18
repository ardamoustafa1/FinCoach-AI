import { supabase } from './supabase';

/**
 * FinCoach AI - Supabase Veri Yönetimi
 * Bulut tabanlı veri işlemleri için CRUD fonksiyonları
 */

// ─── Yardımcılar ─────────────────────────────────────────────
const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ─── İşlemler (Transactions) ─────────────────────────────────
export async function fetchTransactions() {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('tarih', { ascending: false });

  if (error) {
    console.error('[Supabase] İşlemler yüklenemedi:', error);
    return [];
  }

  // Frontend formatına dönüştür (gerekirse)
  return (data || []).map(t => ({
    id: t.id,
    aciklama: t.aciklama,
    tutar: Number(t.tutar),
    tarih: t.tarih,
    kategori: t.kategori,
    magaza: t.magaza,
    tur: t.tur,
    createdAt: t.created_at
  }));
}

export async function addSupabaseTransaction(transaction) {
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      user_id: user.id,
      aciklama: transaction.aciklama,
      tutar: transaction.tutar,
      tarih: transaction.tarih || new Date().toISOString().split('T')[0],
      kategori: transaction.kategori,
      magaza: transaction.magaza,
      tur: transaction.tur || 'gider'
    }])
    .select()
    .single();

  if (error) {
    console.error('[Supabase] İşlem eklenemedi:', error);
    return null;
  }

  return data;
}

export async function deleteSupabaseTransaction(id) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] İşlem silinemedi:', error);
    return false;
  }
  return true;
}

// ─── Hedefler (Goals) ────────────────────────────────────────
export async function fetchGoals() {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('goals')
    .select('*');

  if (error) {
    console.error('[Supabase] Hedefler yüklenemedi:', error);
    return [];
  }

  return (data || []).map(g => ({
    id: g.id,
    name: g.baslik,
    targetAmount: Number(g.hedef_tutar),
    currentAmount: Number(g.mevcut_tutar),
    deadline: g.deadline,
    icon: g.icon,
    color: g.renk,
    createdAt: g.created_at
  }));
}

export async function addSupabaseGoal(goal) {
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('goals')
    .insert([{
      user_id: user.id,
      baslik: goal.name,
      hedef_tutar: goal.targetAmount,
      mevcut_tutar: goal.currentAmount || 0,
      icon: goal.icon,
      renk: goal.color,
      deadline: goal.deadline
    }])
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Hedef eklenemedi:', error);
    return null;
  }
  return data;
}

export async function updateSupabaseGoal(id, updates) {
  const payload = {};
  if (updates.name) payload.baslik = updates.name;
  if (updates.targetAmount) payload.hedef_tutar = updates.targetAmount;
  if (updates.currentAmount !== undefined) payload.mevcut_tutar = updates.currentAmount;
  if (updates.deadline) payload.deadline = updates.deadline;

  const { data, error } = await supabase
    .from('goals')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Hedef güncellenemedi:', error);
    return null;
  }
  return data;
}

export async function deleteSupabaseGoal(id) {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Hedef silinemedi:', error);
    return false;
  }
  return true;
}

// ─── Bütçe Limitleri ─────────────────────────────────────────
export async function fetchBudgetLimits() {
  const user = await getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from('budget_limits')
    .select('category, limit_amount');

  if (error) {
    console.error('[Supabase] Limitler yüklenemedi:', error);
    return {};
  }

  const limits = {};
  const dataList = data || [];
  dataList.forEach(item => {
    limits[item.category] = Number(item.limit_amount);
  });
  return limits;
}

export async function saveSupabaseBudgetLimit(category, amount) {
  const user = await getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('budget_limits')
    .upsert({
      user_id: user.id,
      category: category,
      limit_amount: amount
    }, { onConflict: 'user_id,category' });

  if (error) {
    console.error('[Supabase] Limit kaydedilemedi:', error);
    return false;
  }
  return true;
}
