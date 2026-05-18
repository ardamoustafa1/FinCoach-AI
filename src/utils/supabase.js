import { createClient } from '@supabase/supabase-js';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../config/demoAccount';
import { mockGelir, mockTransactions } from '../data/mockData';
import { sampleGoals } from './seedData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const LOCAL_DB_KEY = 'fincoach_local_supabase';
const LOCAL_SESSION_KEY = 'fincoach_local_session';

const defaultBudgetLimits = {
  Market: 3000,
  'Yemek Siparişi': 2000,
  Ulaşım: 1000,
  Abonelik: 500,
  Fatura: 1500,
  Alışveriş: 2000,
  Eğlence: 800,
  Sağlık: 1000,
};

function dbTransactionFromApp(tx) {
  return {
    id: tx.id || crypto.randomUUID(),
    user_id: 'demo-local-123',
    aciklama: tx.aciklama || tx.title || '',
    tutar: Number(tx.tutar ?? tx.amount ?? 0),
    tarih: tx.tarih || tx.date || new Date().toISOString().slice(0, 10),
    kategori: tx.kategori || tx.category || 'Diğer',
    magaza: tx.magaza || tx.merchant || '',
    tur: tx.tur || (tx.type === 'income' ? 'gelir' : 'gider'),
    created_at: tx.createdAt || new Date().toISOString(),
  };
}

function dbGoalFromApp(goal) {
  return {
    id: goal.id || crypto.randomUUID(),
    user_id: 'demo-local-123',
    baslik: goal.name || goal.title || 'Hedef',
    hedef_tutar: Number(goal.targetAmount || 0),
    mevcut_tutar: Number(goal.currentAmount || 0),
    deadline: goal.deadline || '',
    icon: goal.icon || 'Target',
    renk: goal.color || '#7c3aed',
    created_at: goal.createdAt || new Date().toISOString(),
  };
}

function createInitialDb() {
  return {
    profiles: [{
      id: 'demo-local-123',
      email: DEMO_EMAIL,
      full_name: 'Demo Kullanıcı',
      phone_text: '+90 555 000 00 00',
      onboarding_completed: true,
      created_at: new Date().toISOString(),
    }],
    transactions: [...mockTransactions, ...mockGelir].map(dbTransactionFromApp),
    goals: sampleGoals.map(dbGoalFromApp),
    budget_limits: Object.entries(defaultBudgetLimits).map(([category, limit_amount]) => ({
      id: crypto.randomUUID(),
      user_id: 'demo-local-123',
      category,
      limit_amount,
      created_at: new Date().toISOString(),
    })),
    app_events: [],
  };
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : clone(fallback);
  } catch {
    return clone(fallback);
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Demo fallback cannot persist in private/restricted storage, but in-memory return values still work.
  }
}

function readDb() {
  const db = readJson(LOCAL_DB_KEY, null);
  if (db) return db;
  const initial = createInitialDb();
  writeJson(LOCAL_DB_KEY, initial);
  return initial;
}

function writeDb(db) {
  writeJson(LOCAL_DB_KEY, db);
}

function normalizeRows(payload) {
  return Array.isArray(payload) ? payload : [payload];
}

function applyPayloadDefaults(table, row) {
  const base = { ...row };
  if (!base.id) base.id = crypto.randomUUID();
  if (!base.created_at) base.created_at = new Date().toISOString();
  if (table !== 'profiles' && table !== 'app_events' && !base.user_id) base.user_id = 'demo-local-123';
  return base;
}

class LocalQuery {
  constructor(table) {
    this.table = table;
    this.action = 'select';
    this.payload = null;
    this.filters = [];
    this.returnSingle = false;
    this.orderBy = null;
    this.conflictColumns = [];
  }

  select() {
    this.shouldReturnRows = true;
    return this;
  }

  insert(payload) {
    this.action = 'insert';
    this.payload = payload;
    return this;
  }

  upsert(payload, options = {}) {
    this.action = 'upsert';
    this.payload = payload;
    this.conflictColumns = String(options.onConflict || 'id').split(',').map(col => col.trim()).filter(Boolean);
    return this;
  }

  update(payload) {
    this.action = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column, value) {
    this.filters.push({ column, value });
    return this;
  }

  order(column, options = {}) {
    this.orderBy = { column, ascending: options.ascending !== false };
    return this;
  }

  single() {
    this.returnSingle = true;
    return this;
  }

  matches(row) {
    return this.filters.every(({ column, value }) => row?.[column] === value);
  }

  findConflictIndex(rows, candidate) {
    const columns = this.conflictColumns.length ? this.conflictColumns : ['id'];
    return rows.findIndex(row => columns.every(column => row?.[column] === candidate?.[column]));
  }

  format(data) {
    const rows = clone(data);
    return {
      data: this.returnSingle ? (Array.isArray(rows) ? rows[0] || null : rows) : rows,
      error: null,
    };
  }

  async execute() {
    const db = readDb();
    db[this.table] ||= [];
    const rows = db[this.table];
    let result = [];

    if (this.action === 'insert') {
      result = normalizeRows(this.payload).map(row => applyPayloadDefaults(this.table, row));
      rows.push(...result);
      writeDb(db);
      return this.format(result);
    }

    if (this.action === 'upsert') {
      result = normalizeRows(this.payload).map(row => applyPayloadDefaults(this.table, row));
      result.forEach((candidate) => {
        const index = this.findConflictIndex(rows, candidate);
        if (index >= 0) rows[index] = { ...rows[index], ...candidate };
        else rows.push(candidate);
      });
      writeDb(db);
      return this.format(result);
    }

    if (this.action === 'update') {
      result = [];
      rows.forEach((row, index) => {
        if (!this.matches(row)) return;
        rows[index] = { ...row, ...this.payload };
        result.push(rows[index]);
      });
      writeDb(db);
      return this.format(result);
    }

    if (this.action === 'delete') {
      result = rows.filter(row => this.matches(row));
      db[this.table] = rows.filter(row => !this.matches(row));
      writeDb(db);
      return this.format(result);
    }

    result = rows.filter(row => this.matches(row));
    if (this.orderBy) {
      const { column, ascending } = this.orderBy;
      result = [...result].sort((a, b) => {
        const direction = ascending ? 1 : -1;
        return String(a?.[column] ?? '').localeCompare(String(b?.[column] ?? '')) * direction;
      });
    }
    return this.format(result);
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

function createLocalSupabaseClient() {
  const listeners = new Set();

  const readSession = () => readJson(LOCAL_SESSION_KEY, null);
  const writeSession = (session) => writeJson(LOCAL_SESSION_KEY, session);
  const notify = (event, session) => listeners.forEach(callback => callback(event, session));

  const ensureProfile = (email, updates = {}) => {
    const db = readDb();
    const normalizedEmail = String(email || DEMO_EMAIL).toLowerCase();
    let profile = db.profiles.find(item => item.email?.toLowerCase() === normalizedEmail);
    if (!profile) {
      profile = {
        id: normalizedEmail === DEMO_EMAIL.toLowerCase() ? 'demo-local-123' : crypto.randomUUID(),
        email: normalizedEmail,
        full_name: normalizedEmail.split('@')[0],
        phone_text: '',
        onboarding_completed: normalizedEmail === DEMO_EMAIL.toLowerCase(),
        created_at: new Date().toISOString(),
      };
      db.profiles.push(profile);
    }
    Object.assign(profile, updates);
    writeDb(db);
    return profile;
  };

  return {
    auth: {
      onAuthStateChange: (callback) => {
        listeners.add(callback);
        return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
      },
      getSession: async () => ({ data: { session: readSession() }, error: null }),
      getUser: async () => ({ data: { user: readSession()?.user || null }, error: null }),
      signInWithPassword: async ({ email, password }) => {
        const normalizedEmail = String(email || '').toLowerCase();
        const isDemo = normalizedEmail === DEMO_EMAIL.toLowerCase() && password === DEMO_PASSWORD;
        const localUsers = readJson('fincoach_local_users', {});
        const localUser = localUsers[normalizedEmail];

        if (!isDemo && localUser?.password !== password) {
          return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
        }

        const profile = ensureProfile(normalizedEmail);
        const session = {
          access_token: `local-demo-token-${profile.id}`,
          user: { id: profile.id, email: profile.email },
        };
        writeSession(session);
        notify('SIGNED_IN', session);
        return { data: { user: session.user, session }, error: null };
      },
      signUp: async ({ email, password }) => {
        const normalizedEmail = String(email || '').toLowerCase();
        const localUsers = readJson('fincoach_local_users', {});
        if (localUsers[normalizedEmail]) {
          return { data: { user: null, session: null }, error: { message: 'User already registered' } };
        }

        const profile = ensureProfile(normalizedEmail, { onboarding_completed: false });
        localUsers[normalizedEmail] = { id: profile.id, email: normalizedEmail, password };
        writeJson('fincoach_local_users', localUsers);

        const session = {
          access_token: `local-demo-token-${profile.id}`,
          user: { id: profile.id, email: normalizedEmail },
        };
        writeSession(session);
        notify('SIGNED_IN', session);
        return { data: { user: session.user, session }, error: null };
      },
      signOut: async () => {
        writeSession(null);
        notify('SIGNED_OUT', null);
        return { error: null };
      },
      updateUser: async (updates) => {
        const session = readSession();
        if (!session?.user) return { data: { user: null }, error: { message: 'No active session' } };
        if (updates.email) {
          session.user.email = updates.email.toLowerCase();
          ensureProfile(session.user.email, { id: session.user.id, email: session.user.email });
          writeSession(session);
        }
        return { data: { user: session.user }, error: null };
      },
      resend: async () => ({ data: {}, error: null }),
    },
    from: (table) => new LocalQuery(table),
  };
}

let supabase;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL veya Anon Key eksik; local demo client kullanılıyor.');
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (err) {
  console.warn('[FinCoach AI] Supabase yapılandırması yok, local demo client etkin:', err.message);
  supabase = createLocalSupabaseClient();
}

export { supabase };
