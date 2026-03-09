-- ================================================
-- DompetKu - Aplikasi Keuangan Pribadi
-- SQL Migration for Supabase
-- ================================================

-- 1. Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'IDR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Wallets
CREATE TABLE wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('cash', 'bank', 'ewallet', 'investment', 'other')),
  balance DECIMAL(15,2) DEFAULT 0,
  color TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Transactions
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL(15,2) NOT NULL,
  note TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Budgets
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  period TEXT CHECK (period IN ('monthly', 'weekly', 'yearly')),
  month INTEGER,
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Savings Goals
CREATE TABLE savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  deadline DATE,
  icon TEXT,
  color TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Notification Settings
CREATE TABLE notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  budget_alert BOOLEAN DEFAULT TRUE,
  daily_reminder BOOLEAN DEFAULT FALSE,
  reminder_time TIME DEFAULT '20:00',
  goal_alert BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Receipt Scans
CREATE TABLE receipt_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  image_url TEXT,
  raw_ai_result JSONB,
  merchant_name TEXT,
  scan_date TIMESTAMPTZ DEFAULT NOW(),
  confidence TEXT,
  is_applied BOOLEAN DEFAULT FALSE
);

-- ================================================
-- Row Level Security (RLS)
-- ================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_scans ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- All other tables: users can manage own data
CREATE POLICY "Users can manage own wallets" ON wallets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own categories" ON categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own savings_goals" ON savings_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notification_settings" ON notification_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own receipt_scans" ON receipt_scans FOR ALL USING (auth.uid() = user_id);

-- ================================================
-- Auto-create profile on signup
-- ================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- Default Categories Seed
-- ================================================

-- Note: These will be inserted per-user.
-- You can use a trigger or insert them manually after user registers.
-- Below is a helper function to seed default categories for a user:

CREATE OR REPLACE FUNCTION seed_default_categories(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES
    -- Expense categories
    (p_user_id, 'Makanan & Minuman', 'expense', '🍔', '#F43F5E', true),
    (p_user_id, 'Transportasi', 'expense', '🚗', '#3B82F6', true),
    (p_user_id, 'Belanja', 'expense', '🛍️', '#8B5CF6', true),
    (p_user_id, 'Hiburan', 'expense', '🎮', '#EC4899', true),
    (p_user_id, 'Kesehatan', 'expense', '🏥', '#06B6D4', true),
    (p_user_id, 'Pendidikan', 'expense', '📚', '#F59E0B', true),
    (p_user_id, 'Tagihan', 'expense', '📄', '#EF4444', true),
    (p_user_id, 'Lainnya', 'expense', '📦', '#64748B', true),
    -- Income categories
    (p_user_id, 'Gaji', 'income', '💼', '#10B981', true),
    (p_user_id, 'Freelance', 'income', '💻', '#34D399', true),
    (p_user_id, 'Investasi', 'income', '📈', '#059669', true),
    (p_user_id, 'Hadiah', 'income', '🎁', '#6EE7B7', true),
    (p_user_id, 'Lainnya', 'income', '📦', '#64748B', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- Supabase Storage Buckets
-- ================================================
-- Run in Supabase SQL Editor or via Dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);
