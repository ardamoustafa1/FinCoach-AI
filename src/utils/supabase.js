import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL veya Anon Key eksik! Lütfen .env dosyanızı kontrol edin.');
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (err) {
  console.error('Supabase başlatılamadı:', err);
  // Fallback as minimal object to prevent total crash
  supabase = {
    auth: { 
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }), 
      getSession: async () => ({ data: { session: null } }), 
      getUser: async () => ({ data: { user: null } }),
      signInWithPassword: async ({ email, password }) => {
        if (import.meta.env.VITE_DEMO_EMAIL && email === import.meta.env.VITE_DEMO_EMAIL && password === import.meta.env.VITE_DEMO_PASSWORD) {
          return { data: { user: { id: 'demo-local-123', email } }, error: null };
        }
        return { data: null, error: { message: 'Supabase yapılandırılmadı. Sadece geçerli DEMO girişine izin veriliyor.' } };
      },
      signUp: async () => ({ data: null, error: { message: 'Supabase yapılandırılmadı.' } })
    },
    from: () => ({ 
      select: () => ({ eq: () => ({ single: async () => ({ data: null }) }), order: () => ({}) }),
      upsert: () => ({ select: () => ({ single: async () => ({ data: null }) }) })
    })
  };
}

export { supabase };
