import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../utils/supabase';

// UTF-8 Safe Base64 Obfuscation for KVKK / Enterprise Security
function safeBtoa(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
}

function safeAtob(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

const secureStorage = {
  getItem: (name) => {
    const raw = localStorage.getItem(name);
    if (!raw) return null;
    try {
      const decrypted = safeAtob(raw);
      return JSON.parse(decrypted);
    } catch (e) {
      try {
        return JSON.parse(raw);
      } catch (err) {
        return null;
      }
    }
  },
  setItem: (name, value) => {
    const str = JSON.stringify(value);
    const encrypted = safeBtoa(str);
    localStorage.setItem(name, encrypted);
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  }
};

const toTransactionDbPayload = (transaction = {}) => {
  const payload = {};
  if (transaction.aciklama !== undefined) payload.aciklama = transaction.aciklama;
  if (transaction.tutar !== undefined) payload.tutar = Number(transaction.tutar);
  if (transaction.tarih !== undefined) payload.tarih = transaction.tarih;
  if (transaction.kategori !== undefined) payload.kategori = transaction.kategori;
  if (transaction.magaza !== undefined) payload.magaza = transaction.magaza;
  if (transaction.tur !== undefined) payload.tur = transaction.tur || 'gider';
  return payload;
};

const useStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      goals: [],
      budgetLimits: {},
      categoryRules: {},
      // Duygu günlüğü session içinde tutulur; hassas davranış verisi localStorage'a yazılmaz.
      emotionLogs: [],
      userProfile: {
        name: '',
        phone: '',
        bank: 'Finansal Koç',
        email: ''
      },
      behavioralProfile: {},
      seenTours: [],

      setTransactions: (transactions) => set({ transactions }),
      setGoals: (goals) => set({ goals }),
      setBudgetLimits: (budgetLimits) => set({ budgetLimits }),
      setCategoryRules: (categoryRules) => set({ categoryRules }),
      markTourSeen: (path) => set((state) => {
        if (state.seenTours.includes(path)) return state;
        return { seenTours: [...state.seenTours, path] };
      }),
      
      setUserProfile: (updates) => {
        set((state) => {
          const newUserProfile = { ...state.userProfile, ...updates };
          return { userProfile: newUserProfile };
        });
      },

  setBehavioralProfile: (profile) => {
    set({ behavioralProfile: profile });
  },

  // Transactions
  addTransaction: async (transaction) => {
    // 1. Optimistic Update
    const newTx = { ...transaction };
    if (!newTx.id) newTx.id = crypto.randomUUID();
    if (!newTx.createdAt) newTx.createdAt = new Date().toISOString();

    const previousTransactions = get().transactions;
    set((state) => ({ transactions: [newTx, ...state.transactions] }));

    try {
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
        
        const { data, error } = await supabase.from('transactions').insert([payload]).select().single();
        if (error) throw error;
        
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
    } catch (err) {
      set({ transactions: previousTransactions }); // Rollback
      throw new Error('İşlem kaydedilemedi: ' + err.message, { cause: err });
    }
  },

  updateTransaction: async (id, transaction) => {
    const previousTransactions = get().transactions;
    set((state) => ({
      transactions: state.transactions.map(t => t.id === id ? { ...t, ...transaction } : t)
    }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const payload = toTransactionDbPayload(transaction);
        if (Object.keys(payload).length > 0) {
          const { error } = await supabase.from('transactions').update(payload).eq('id', id);
          if (error) throw error;
        }
      }
    } catch (err) {
      set({ transactions: previousTransactions });
      throw new Error('İşlem güncellenemedi: ' + err.message, { cause: err });
    }
  },

  removeTransaction: async (id) => {
    const previousTransactions = get().transactions;
    set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) }));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
      }
    } catch (err) {
      set({ transactions: previousTransactions });
      throw new Error('İşlem silinemedi: ' + err.message, { cause: err });
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
  },

  // ─── Emotion Coach ───────────────────────────────────────────────────────
  addEmotionLog: (log) => {
    const newLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      dayOfWeek: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'][new Date().getDay()],
      createdAt: new Date().toISOString(),
      cancelled: false,
      regretScore: null,
      regretDays: null,
      regretNote: null,
      ...log,
    };
    set((state) => {
      // Son 90 günü tut (bellek yönetimi)
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      const pruned = state.emotionLogs.filter(l => new Date(l.createdAt) >= cutoff);
      const next = [newLog, ...pruned];
      return { emotionLogs: next };
    });
    return newLog;
  },

      markEmotionRegret: (id, regretScore, regretNote = '') => {
        set((state) => {
          const now = new Date();
          const next = state.emotionLogs.map(l => {
            if (l.id !== id) return l;
            const created = new Date(l.createdAt);
            const regretDays = Math.round((now - created) / (1000 * 60 * 60 * 24));
            return { ...l, regretScore, regretDays, regretNote };
          });
          return { emotionLogs: next };
        });
      },

    }),
    {
      name: 'fincoach_secure_store',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        goals: state.goals,
        budgetLimits: state.budgetLimits,
        categoryRules: state.categoryRules,
        userProfile: state.userProfile,
        behavioralProfile: state.behavioralProfile,
        seenTours: state.seenTours,
      })
    }
  )
);

export default useStore;
