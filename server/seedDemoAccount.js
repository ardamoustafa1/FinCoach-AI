import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  demoBudgetLimits,
  demoGoals,
  demoProfile,
  demoTransactions,
} from './demoSeedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('SUPABASE_URL/VITE_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 100;

  while (page < 20) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const user = data?.users?.find((item) => item.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (!data?.users?.length || data.users.length < perPage) return null;
    page += 1;
  }

  return null;
}

async function ensureDemoUser() {
  const existingUser = await findUserByEmail(DEMO_EMAIL);
  if (existingUser) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: demoProfile.full_name, account_type: 'demo' },
    });
    if (error) throw error;
    return data.user;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: demoProfile.full_name, account_type: 'demo' },
  });
  if (error) throw error;
  return data.user;
}

async function replaceDemoData(userId) {
  const profilePayload = {
    id: userId,
    ...demoProfile,
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' });
  if (profileError) throw profileError;

  await Promise.all([
    supabaseAdmin.from('transactions').delete().eq('user_id', userId),
    supabaseAdmin.from('goals').delete().eq('user_id', userId),
    supabaseAdmin.from('budget_limits').delete().eq('user_id', userId),
  ]);

  const { error: txError } = await supabaseAdmin.from('transactions').insert(
    demoTransactions.map((item) => ({ user_id: userId, ...item }))
  );
  if (txError) throw txError;

  const { error: goalsError } = await supabaseAdmin.from('goals').insert(
    demoGoals.map((goal) => ({
      user_id: userId,
      baslik: goal.name,
      hedef_tutar: goal.targetAmount,
      mevcut_tutar: goal.currentAmount,
      deadline: goal.deadline,
      icon: goal.icon,
      renk: goal.color,
    }))
  );
  if (goalsError) throw goalsError;

  const { error: limitError } = await supabaseAdmin.from('budget_limits').insert(
    Object.entries(demoBudgetLimits).map(([category, limitAmount]) => ({
      user_id: userId,
      category,
      limit_amount: limitAmount,
    }))
  );
  if (limitError) throw limitError;
}

try {
  const user = await ensureDemoUser();
  await replaceDemoData(user.id);
  console.log(`Demo hesabı hazır: ${DEMO_EMAIL}`);
  console.log(`Demo şifresi: ${DEMO_PASSWORD}`);
  console.log(`Demo user id: ${user.id}`);
} catch (error) {
  console.error('Demo hesabı hazırlanamadı:', error.message || error);
  process.exit(1);
}
