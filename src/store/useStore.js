import { create } from 'zustand';
import { supabase } from '../utils/supabase';

const useStore = create((set, get) => ({
  transactions: [],
  goals: [],
  budgetLimits: {},
  categoryRules: {},

  setTransactions: (transactions) => set({ transactions }),
  setGoals: (goals) => set({ goals }),
  setBudgetLimits: (budgetLimits) => set({ budgetLimits }),
  setCategoryRules: (categoryRules) => set({ categoryRules }),

  // Transactions
  addTransaction: async (transaction) => {
    // 1. Optimistic Update (Hızlı UI)
    const newTx = { ...transaction };
    if (!newTx.id) newTx.id = crypto.randomUUID();
    if (!newTx.createdAt) newTx.createdAt = new Date().toISOString();

    set((state) => ({ transactions: [newTx, ...state.transactions] }));

    // 2. Supabase Sync
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const payload = {
        user_id: session.user.id,
        aciklama: newTx.aciklama,
        tutar: Number(newTx.tutar),
        tarih: newTx.tarih || new Date().toISOString().split('T')[0],
        kategori: newTx.kategori,
        magaza: newTx.magaza,
        tur: newTx.tur || 'gider'
      };
      
      const { data } = await supabase.from('transactions').insert([payload]).select().single();
      if (data) {
        set((state) => ({
          transactions: state.transactions.map(t => t.id === newTx.id ? { ...t, id: data.id } : t)
        }));
      }
    }
    
    if (newTx.magaza) {
      get().saveCategoryRule(newTx.magaza, newTx.kategori);
    }
    return newTx;
  },

  updateTransaction: async (id, transaction) => {
    set((state) => ({
      transactions: state.transactions.map(t => t.id === id ? { ...t, ...transaction } : t)
    }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const payload = { ...transaction };
      await supabase.from('transactions').update(payload).eq('id', id);
    }
  },

  removeTransaction: async (id) => {
    set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) }));
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('transactions').delete().eq('id', id);
    }
  },

  // Goals
  addGoal: async (goal) => {
    const newGoal = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      currentAmount: 0,
      ...goal,
    };
    set((state) => ({ goals: [...state.goals, newGoal] }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase.from('goals').insert([{
        user_id: session.user.id,
        baslik: newGoal.name,
        hedef_tutar: Number(newGoal.targetAmount),
        mevcut_tutar: Number(newGoal.currentAmount),
        icon: newGoal.icon,
        renk: newGoal.color,
        deadline: newGoal.deadline
      }]).select().single();
      
      if (data) {
        set((state) => ({
          goals: state.goals.map(g => g.id === newGoal.id ? { ...g, id: data.id } : g)
        }));
      }
    }
    return newGoal;
  },

  updateGoal: async (id, updates) => {
    set((state) => ({
      goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const payload = {};
      if (updates.name) payload.baslik = updates.name;
      if (updates.targetAmount) payload.hedef_tutar = Number(updates.targetAmount);
      if (updates.currentAmount !== undefined) payload.mevcut_tutar = Number(updates.currentAmount);
      if (updates.deadline) payload.deadline = updates.deadline;
      if (updates.icon) payload.icon = updates.icon;
      if (updates.color) payload.renk = updates.color;

      await supabase.from('goals').update(payload).eq('id', id);
    }
  },

  deleteGoal: async (id) => {
    set((state) => ({ goals: state.goals.filter(g => g.id !== id) }));
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('goals').delete().eq('id', id);
    }
  },

  // Budget Limits
  saveBudgetLimits: async (limits) => {
    set({ budgetLimits: limits });
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const promises = Object.entries(limits).map(([kategori, limit]) => 
        supabase.from('budget_limits').upsert({
          user_id: session.user.id,
          category: kategori,
          limit_amount: Number(limit)
        }, { onConflict: 'user_id,category' })
      );
      await Promise.all(promises);
    }
  },

  updateBudgetLimit: async (kategori, limit) => {
    set((state) => ({
      budgetLimits: { ...state.budgetLimits, [kategori]: Number(limit) }
    }));
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('budget_limits').upsert({
        user_id: session.user.id,
        category: kategori,
        limit_amount: Number(limit)
      }, { onConflict: 'user_id,category' });
    }
  },

  saveCategoryRule: (magaza, kategori) => {
    if (!magaza || !kategori) return;
    set((state) => ({
      categoryRules: { ...state.categoryRules, [magaza.trim().toLowerCase()]: kategori }
    }));
  },
  
  suggestCategory: (magaza) => {
    if (!magaza) return '';
    const rules = get().categoryRules;
    return rules[magaza.trim().toLowerCase()] || '';
  }

}));

export default useStore;
