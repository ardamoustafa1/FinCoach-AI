-- 1. PROFİLLER TABLOSU (Auth ile otomatik bağlanır)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone_text text,
  email text,
  onboarding_completed boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. İŞLEMLER TABLOSU
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  aciklama text not null,
  tutar decimal not null,
  tarih date default current_date,
  kategori text,
  magaza text,
  tur text check (tur in ('gelir', 'gider')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. HEDEFLER TABLOSU
create table goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  baslik text not null,
  hedef_tutar decimal not null,
  mevcut_tutar decimal default 0,
  icon text,
  renk text,
  deadline date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. BÜTÇE LİMİTLERİ
create table budget_limits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category text not null,
  limit_amount decimal not null,
  unique(user_id, category)
);

-- 5. ÜRÜN ANALİTİĞİ / HATA İZLEME
create table app_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  properties jsonb default '{}'::jsonb,
  path text,
  session_id text,
  occurred_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS (Row Level Security) - Güvenlik kuralları
alter table profiles enable row level security;
alter table transactions enable row level security;
alter table goals enable row level security;
alter table budget_limits enable row level security;
alter table app_events enable row level security;

-- Sadece kendi verilerini görme/düzenleme izinleri
create policy "Kullanıcılar sadece kendi profilini görebilir" on profiles for select using (auth.uid() = id);
create policy "Kullanıcılar kendi profilini oluşturabilir" on profiles for insert with check (auth.uid() = id);
create policy "Kullanıcılar kendi profilini güncelleyebilir" on profiles for update using (auth.uid() = id);

create policy "Kullanıcılar kendi işlemlerini yönetebilir" on transactions for all using (auth.uid() = user_id);
create policy "Kullanıcılar kendi hedeflerini yönetebilir" on goals for all using (auth.uid() = user_id);
create policy "Kullanıcılar kendi limitlerini yönetebilir" on budget_limits for all using (auth.uid() = user_id);
create policy "Kullanıcılar kendi eventlerini görebilir" on app_events for select using (auth.uid() = user_id);
