-- FinCoach production foundation: versioned, transactional, deny-by-default.
create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;
create schema if not exists private;

do $$ begin create type public.account_type as enum ('cash','checking','savings','credit_card','investment','loan','crypto','other'); exception when duplicate_object then null; end $$;
do $$ begin create type public.transaction_type as enum ('gelir','gider','transfer','refund'); exception when duplicate_object then null; end $$;
do $$ begin create type public.transaction_status as enum ('pending','posted','reversed','failed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.goal_status as enum ('active','paused','completed','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.recurrence_frequency as enum ('daily','weekly','monthly','quarterly','yearly','custom'); exception when duplicate_object then null; end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email extensions.citext, full_name text check (char_length(full_name)<=160), phone_text text check (char_length(phone_text)<=32),
  avatar_url text, locale text not null default 'tr-TR', timezone text not null default 'Europe/Istanbul',
  base_currency char(3) not null default 'TRY' check (base_currency=upper(base_currency)),
  onboarding_completed boolean not null default false, risk_profile smallint not null default 3 check (risk_profile between 1 and 5),
  financial_health_score smallint check (financial_health_score between 0 and 100), last_seen_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create unique index profiles_email_unique_idx on public.profiles(lower(email::text)) where email is not null and deleted_at is null;

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system' check(theme in ('light','dark','system')), reduced_motion boolean not null default false,
  marketing_email boolean not null default false, product_email boolean not null default true, push_notifications boolean not null default true,
  biometric_enabled boolean not null default false, ai_personalization boolean not null default true,
  settings jsonb not null default '{}' check(jsonb_typeof(settings)='object'), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.financial_institutions (
  id uuid primary key default gen_random_uuid(), code text not null unique check(code ~ '^[a-z0-9_-]{2,50}$'),
  name text not null check(char_length(name) between 2 and 160), country_code char(2) not null default 'TR', logo_url text,
  provider text, is_active boolean not null default true, metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.integration_connections (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  institution_id uuid references public.financial_institutions(id) on delete set null, provider text not null,
  provider_connection_id text, status text not null default 'pending' check(status in ('pending','active','reauth_required','error','revoked')),
  consent_expires_at timestamptz, last_synced_at timestamptz, last_error_code text, scopes text[] not null default '{}',
  metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object'), created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), revoked_at timestamptz, unique(user_id,provider,provider_connection_id)
);
create table private.integration_secrets (
  connection_id uuid primary key references public.integration_connections(id) on delete cascade,
  encrypted_payload bytea not null, key_version smallint not null default 1 check(key_version>0), rotated_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid references public.integration_connections(id) on delete set null, institution_id uuid references public.financial_institutions(id) on delete set null,
  external_id text, name text not null check(char_length(name) between 1 and 120), type public.account_type not null,
  currency char(3) not null default 'TRY' check(currency=upper(currency)), current_balance numeric(19,4) not null default 0,
  available_balance numeric(19,4), credit_limit numeric(19,4) check(credit_limit is null or credit_limit>=0), iban_masked text,
  account_mask text, is_manual boolean not null default true, is_archived boolean not null default false, balance_updated_at timestamptz,
  metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object'), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(user_id,connection_id,external_id)
);
create index accounts_user_active_idx on public.accounts(user_id,is_archived);

create table public.categories (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade,
  parent_id uuid references public.categories(id) on delete set null, slug text not null check(slug ~ '^[a-z0-9-]{2,64}$'),
  name text not null check(char_length(name) between 1 and 80), icon text, color text check(color is null or color ~ '^#[0-9A-Fa-f]{6}$'),
  transaction_type public.transaction_type, is_system boolean not null default false, sort_order smallint not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check((is_system and user_id is null) or (not is_system and user_id is not null))
);
create unique index categories_system_slug_idx on public.categories(slug) where is_system;
create unique index categories_user_slug_idx on public.categories(user_id,slug) where not is_system;
insert into public.categories(slug,name,icon,color,transaction_type,is_system,sort_order) values
 ('market','Market','ShoppingCart','#34C759','gider',true,10),('yemek','Yemek','Utensils','#FF9500','gider',true,20),
 ('ulasim','Ulaşım','Car','#007AFF','gider',true,30),('abonelik','Abonelik','RefreshCw','#AF52DE','gider',true,40),
 ('fatura','Fatura','Receipt','#FF3B30','gider',true,50),('alisveris','Alışveriş','ShoppingBag','#FF2D55','gider',true,60),
 ('eglence','Eğlence','Gamepad2','#5856D6','gider',true,70),('saglik','Sağlık','HeartPulse','#30B0C7','gider',true,80),
 ('maas','Maaş','WalletCards','#30D158','gelir',true,100),('diger','Diğer','CircleEllipsis','#8E8E93',null,true,999) on conflict do nothing;

create table public.transactions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null, transfer_account_id uuid references public.accounts(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null, external_id text, source text not null default 'manual',
  aciklama text not null check(char_length(aciklama) between 1 and 500), tutar numeric(19,4) not null check(tutar>=0),
  para_birimi char(3) not null default 'TRY', tarih date not null default current_date, booking_at timestamptz,
  kategori text, magaza text, tur public.transaction_type not null default 'gider', status public.transaction_status not null default 'posted',
  notes text, location jsonb, ai_category_confidence numeric(5,4) check(ai_category_confidence between 0 and 1),
  is_recurring boolean not null default false, is_reviewed boolean not null default false, fingerprint text,
  metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object'), created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), deleted_at timestamptz,
  check(transfer_account_id is null or account_id is null or transfer_account_id<>account_id)
);
create unique index transactions_external_idx on public.transactions(user_id,source,external_id) where external_id is not null;
create index transactions_user_date_idx on public.transactions(user_id,tarih desc,created_at desc) where deleted_at is null;
create index transactions_user_category_idx on public.transactions(user_id,category_id,tarih desc) where deleted_at is null;

create table public.transaction_splits (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid not null references public.transactions(id) on delete cascade, category_id uuid references public.categories(id) on delete set null,
  amount numeric(19,4) not null check(amount>0), description text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index transaction_splits_transaction_idx on public.transaction_splits(transaction_id);
create table public.tags (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check(char_length(name) between 1 and 40), color text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,name)
);
create table public.transaction_tags (
  user_id uuid not null references auth.users(id) on delete cascade, transaction_id uuid not null references public.transactions(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade, created_at timestamptz not null default now(), primary key(transaction_id,tag_id)
);
create index transaction_tags_user_idx on public.transaction_tags(user_id);

create table public.receipts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete set null, storage_path text not null check(storage_path ~ '^[0-9a-f-]{36}/'),
  mime_type text not null check(mime_type in ('image/jpeg','image/png','image/webp','application/pdf')),
  size_bytes bigint not null check(size_bytes between 1 and 20971520), sha256 text check(sha256 is null or sha256 ~ '^[0-9a-f]{64}$'),
  ocr_status text not null default 'pending' check(ocr_status in ('pending','processing','completed','failed')),
  extracted_data jsonb not null default '{}' check(jsonb_typeof(extracted_data)='object'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,storage_path)
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, period_start date not null, period_end date not null, currency char(3) not null default 'TRY',
  total_limit numeric(19,4) check(total_limit is null or total_limit>=0), rollover_enabled boolean not null default false,
  is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check(period_end>=period_start), unique(user_id,name,period_start)
);
create table public.budget_limits (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  budget_id uuid references public.budgets(id) on delete cascade, category_id uuid references public.categories(id) on delete set null,
  category text not null, limit_amount numeric(19,4) not null check(limit_amount>=0), warning_percent smallint not null default 80 check(warning_percent between 1 and 100),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,category)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  baslik text not null, aciklama text, hedef_tutar numeric(19,4) not null check(hedef_tutar>0), mevcut_tutar numeric(19,4) not null default 0 check(mevcut_tutar>=0),
  currency char(3) not null default 'TRY', icon text, renk text, deadline date, status public.goal_status not null default 'active', priority smallint not null default 3 check(priority between 1 and 5),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), completed_at timestamptz, deleted_at timestamptz
);
create index goals_user_status_idx on public.goals(user_id,status,deadline) where deleted_at is null;
create table public.goal_contributions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade, transaction_id uuid references public.transactions(id) on delete set null,
  amount numeric(19,4) not null check(amount>0), contributed_at timestamptz not null default now(), note text, created_at timestamptz not null default now()
);
create index goal_contributions_goal_idx on public.goal_contributions(goal_id,contributed_at desc);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null, merchant_name text not null, amount numeric(19,4) not null check(amount>=0),
  currency char(3) not null default 'TRY', frequency public.recurrence_frequency not null default 'monthly', interval_count smallint not null default 1 check(interval_count>0),
  next_charge_date date, category_id uuid references public.categories(id) on delete set null, status text not null default 'active' check(status in ('trial','active','paused','cancelled','expired')),
  cancellation_url text, reminder_days smallint not null default 3, detected_by_ai boolean not null default false, confidence numeric(5,4) check(confidence between 0 and 1),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), cancelled_at timestamptz
);
create index subscriptions_user_next_idx on public.subscriptions(user_id,next_charge_date) where status in ('trial','active');
create table public.recurring_rules (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, name text not null,
  transaction_type public.transaction_type not null, amount numeric(19,4) not null check(amount>=0), currency char(3) not null default 'TRY',
  frequency public.recurrence_frequency not null, interval_count smallint not null default 1, next_run_date date not null,
  account_id uuid references public.accounts(id) on delete set null, category_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true, metadata jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.debts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null, name text not null, type text not null default 'other',
  original_principal numeric(19,4) not null check(original_principal>=0), current_balance numeric(19,4) not null check(current_balance>=0),
  annual_interest_rate numeric(8,5) not null default 0 check(annual_interest_rate between 0 and 100), minimum_payment numeric(19,4) not null default 0,
  due_day smallint check(due_day between 1 and 31), currency char(3) not null default 'TRY', status text not null default 'active' check(status in ('active','paid','defaulted','closed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), closed_at timestamptz
);
create table public.assets (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null, name text not null, type text not null, symbol text,
  quantity numeric(28,10) not null default 1 check(quantity>=0), unit_cost numeric(19,6) check(unit_cost is null or unit_cost>=0),
  current_unit_price numeric(19,6) check(current_unit_price is null or current_unit_price>=0), currency char(3) not null default 'TRY',
  valuation_date date not null default current_date, metadata jsonb not null default '{}', created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), archived_at timestamptz
);
create index assets_user_type_idx on public.assets(user_id,type) where archived_at is null;

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text, model text not null default 'gemini-3.7-flash', purpose text not null default 'financial_coach', summary text,
  context jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), archived_at timestamptz
);
create table public.ai_messages (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade, role text not null check(role in ('user','assistant','system','tool')),
  content text not null check(char_length(content) between 1 and 100000), model text, prompt_tokens integer check(prompt_tokens>=0),
  completion_tokens integer check(completion_tokens>=0), latency_ms integer check(latency_ms>=0), safety jsonb not null default '{}', metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index ai_messages_conversation_idx on public.ai_messages(conversation_id,created_at);

create table public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, title text not null, body text not null, severity text not null default 'info' check(severity in ('info','success','warning','critical')),
  action_url text, data jsonb not null default '{}', read_at timestamptz, dismissed_at timestamptz, created_at timestamptz not null default now(), expires_at timestamptz
);
create index notifications_user_unread_idx on public.notifications(user_id,created_at desc) where read_at is null and dismissed_at is null;
create table public.consent_records (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null, policy_version text not null, status text not null check(status in ('granted','denied','withdrawn')),
  source text not null default 'app', ip_hash text, user_agent_hash text, evidence jsonb not null default '{}', recorded_at timestamptz not null default now(),
  expires_at timestamptz, created_at timestamptz not null default now()
);
create index consent_user_type_idx on public.consent_records(user_id,consent_type,recorded_at desc);

create table public.app_events (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
  name text not null check(name ~ '^[a-zA-Z0-9_.-]{2,100}$'), properties jsonb not null default '{}' check(jsonb_typeof(properties)='object'),
  path text, session_id text, anonymous_id text, app_version text, occurred_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create index app_events_user_idx on public.app_events(user_id,occurred_at desc) where user_id is not null;
create table public.audit_logs (
  id bigint generated always as identity primary key, user_id uuid, actor_user_id uuid, table_name text not null, record_id text,
  operation text not null check(operation in ('INSERT','UPDATE','DELETE')), old_data jsonb, new_data jsonb, request_id text, occurred_at timestamptz not null default clock_timestamp()
);
create index audit_logs_user_idx on public.audit_logs(user_id,occurred_at desc);

create table private.idempotency_keys(scope text not null,key text not null,request_hash text not null,response_status integer,response_body jsonb,expires_at timestamptz not null,created_at timestamptz not null default now(),primary key(scope,key));
create table private.outbox_events(id uuid primary key default gen_random_uuid(),aggregate_type text not null,aggregate_id text not null,event_type text not null,payload jsonb not null,attempts smallint not null default 0,available_at timestamptz not null default now(),processed_at timestamptz,last_error text,created_at timestamptz not null default now());
create index outbox_pending_idx on private.outbox_events(available_at) where processed_at is null;
revoke all on private.integration_secrets,private.idempotency_keys,private.outbox_events from public,anon,authenticated;

create or replace function private.set_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
revoke all on function private.set_updated_at() from public,anon,authenticated;
create or replace function private.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,email,full_name) values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name')) on conflict(id) do update set email=excluded.email,updated_at=now();
 insert into public.user_preferences(user_id) values(new.id) on conflict(user_id) do nothing; return new;
end $$;
revoke all on function private.handle_new_user() from public,anon,authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

create or replace function private.capture_audit_log() returns trigger language plpgsql security definer set search_path='' as $$
declare old_row jsonb:=case when tg_op='INSERT' then null else to_jsonb(old) end; new_row jsonb:=case when tg_op='DELETE' then null else to_jsonb(new) end; owner_id uuid; row_id text;
begin
 owner_id:=nullif(coalesce(new_row->>'user_id',old_row->>'user_id',new_row->>'id',old_row->>'id'),'')::uuid;
 row_id:=coalesce(new_row->>'id',old_row->>'id');
 insert into public.audit_logs(user_id,actor_user_id,table_name,record_id,operation,old_data,new_data,request_id)
 values(owner_id,auth.uid(),tg_table_name,row_id,tg_op,old_row,new_row,current_setting('request.headers',true)::jsonb->>'x-request-id');
 return coalesce(new,old);
end $$;
revoke all on function private.capture_audit_log() from public,anon,authenticated;

do $$ declare t text; begin
 foreach t in array array['profiles','accounts','transactions','goals','budgets','integration_connections','consent_records'] loop
  execute format('create trigger %I after insert or update or delete on public.%I for each row execute function private.capture_audit_log()','audit_'||t,t);
 end loop;
 foreach t in array array['profiles','user_preferences','financial_institutions','integration_connections','accounts','categories','transactions','transaction_splits','tags','receipts','budgets','budget_limits','goals','subscriptions','recurring_rules','debts','assets','ai_conversations'] loop
  execute format('create trigger %I before update on public.%I for each row execute function private.set_updated_at()','updated_'||t,t);
 end loop;
end $$;

do $$ declare t text; begin
 foreach t in array array['profiles','user_preferences','financial_institutions','integration_connections','accounts','categories','transactions','transaction_splits','tags','transaction_tags','receipts','budgets','budget_limits','goals','goal_contributions','subscriptions','recurring_rules','debts','assets','ai_conversations','ai_messages','notifications','consent_records','app_events','audit_logs'] loop
  execute format('alter table public.%I enable row level security',t); execute format('revoke all on public.%I from anon,authenticated',t);
 end loop;
end $$;
grant select,insert,update,delete on public.profiles,public.user_preferences,public.integration_connections,public.accounts,public.transactions,public.transaction_splits,public.tags,public.transaction_tags,public.receipts,public.budgets,public.budget_limits,public.goals,public.goal_contributions,public.subscriptions,public.recurring_rules,public.debts,public.assets,public.ai_conversations,public.ai_messages,public.notifications,public.consent_records to authenticated;
grant select on public.financial_institutions,public.categories to authenticated;
grant insert on public.categories to authenticated;
grant select,insert on public.app_events to authenticated;

create policy profiles_select_own on public.profiles for select to authenticated using((select auth.uid())=id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check((select auth.uid())=id);
create policy profiles_update_own on public.profiles for update to authenticated using((select auth.uid())=id) with check((select auth.uid())=id);
create policy profiles_delete_own on public.profiles for delete to authenticated using((select auth.uid())=id);
create policy institutions_select_active on public.financial_institutions for select to authenticated using(is_active);
create policy categories_select_visible on public.categories for select to authenticated using(is_system or (select auth.uid())=user_id);
create policy categories_insert_own on public.categories for insert to authenticated with check(not is_system and (select auth.uid())=user_id);

do $$ declare t text; begin
 foreach t in array array['user_preferences','integration_connections','accounts','transactions','transaction_splits','tags','transaction_tags','receipts','budgets','budget_limits','goals','goal_contributions','subscriptions','recurring_rules','debts','assets','ai_conversations','ai_messages','notifications','consent_records'] loop
  execute format('create policy %I on public.%I for select to authenticated using((select auth.uid())=user_id)',t||'_select_own',t);
  execute format('create policy %I on public.%I for insert to authenticated with check((select auth.uid())=user_id)',t||'_insert_own',t);
  execute format('create policy %I on public.%I for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id)',t||'_update_own',t);
  execute format('create policy %I on public.%I for delete to authenticated using((select auth.uid())=user_id)',t||'_delete_own',t);
 end loop;
end $$;
create policy app_events_select_own on public.app_events for select to authenticated using((select auth.uid())=user_id);
create policy app_events_insert_own on public.app_events for insert to authenticated with check((select auth.uid())=user_id);

comment on table public.transactions is 'Canonical financial ledger; monetary values use exact numeric types.';
comment on table public.audit_logs is 'Append-only audit trail unavailable to browser roles.';
comment on table private.integration_secrets is 'Encrypted provider credentials available only to trusted server roles.';
