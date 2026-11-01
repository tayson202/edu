-- ==============================================================
-- SUPABASE POSTGRESQL RBAC & ROW LEVEL SECURITY (RLS) MIGRATION
-- Project: ULearn Marketplace
-- Roles: MEMBER, SELLER, COACH, BRAND, ADMIN
-- ==============================================================

-- 1. Enable required PostgreSQL cryptographic and UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Define Enum types for Roles & Account Status
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('MEMBER', 'SELLER', 'COACH', 'BRAND', 'ADMIN');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
    CREATE TYPE account_status AS ENUM ('ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
    CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
  END IF;
END $$;

-- 3. Trigger Function: Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. User Profiles Table (Linked to auth.users)
-- Passwords are NEVER stored here; passwords are securely hashed & managed by auth.users (bcrypt).
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'MEMBER',
  status account_status NOT NULL DEFAULT 'ACTIVE',
  avatar_url TEXT,
  headline TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for fast search and joins
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Child Profile Tables for Role-Specific Data

-- Member Profile
CREATE TABLE IF NOT EXISTS public.member_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  interests JSONB DEFAULT '[]'::jsonb,
  learning_goals JSONB DEFAULT '[]'::jsonb,
  enrolled_programs_count INT DEFAULT 0,
  orders_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seller Profile
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  payout_email TEXT NOT NULL,
  total_products INT DEFAULT 0,
  total_sales_cents BIGINT DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 5.0,
  verification_status verification_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coach Profile
CREATE TABLE IF NOT EXISTS public.coach_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  hourly_rate_cents INT NOT NULL DEFAULT 15000,
  booking_url TEXT,
  total_clients INT DEFAULT 0,
  total_sessions_completed INT DEFAULT 0,
  verification_status verification_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Brand Profile
CREATE TABLE IF NOT EXISTS public.brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  legal_entity_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  official_website TEXT,
  product_lines_count INT DEFAULT 0,
  partnership_tier TEXT DEFAULT 'STANDARD',
  verification_status verification_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Products Table (Owned by Seller or Brand)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category TEXT,
  price_cents INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  thumbnail_url TEXT,
  sales_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);

-- 7. Coaching Programs Table (Owned by Coach)
CREATE TABLE IF NOT EXISTS public.coaching_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 60,
  price_cents INT NOT NULL DEFAULT 0,
  max_clients INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coaching_coach ON public.coaching_programs(coach_id);

-- 8. Orders Table (Purchases by Member from Seller/Coach/Brand)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  amount_cents INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant ON public.orders(merchant_id);

-- ==============================================================
-- 9. PRIVILEGE ESCALATION SECURITY TRIGGER
-- Prevents ordinary users from elevating their own role or status.
-- Only platform administrators can change a user's role or status.
-- ==============================================================

CREATE OR REPLACE FUNCTION protect_role_escalation()
RETURNS TRIGGER AS $$
DECLARE
  current_user_role user_role;
BEGIN
  -- If role or status is unchanged, allow the update
  IF (OLD.role = NEW.role AND OLD.status = NEW.status) THEN
    RETURN NEW;
  END IF;

  -- Look up the role of the caller in public.profiles
  SELECT role INTO current_user_role 
  FROM public.profiles 
  WHERE id = auth.uid();

  -- Only ADMIN is authorized to modify role or account status
  IF current_user_role IS NULL OR current_user_role <> 'ADMIN' THEN
    RAISE EXCEPTION 'Access Denied: You are not authorized to modify user roles or account status.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_role_escalation ON public.profiles;
CREATE TRIGGER tr_protect_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION protect_role_escalation();

-- ==============================================================
-- 10. AUTHENTICATION TRIGGER: AUTO-CREATE PROFILE ON USER SIGNUP
-- ==============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role;
  initial_status account_status;
  selected_role_text TEXT;
BEGIN
  selected_role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'MEMBER');

  -- Parse and validate role
  IF selected_role_text IN ('SELLER', 'COACH', 'BRAND') THEN
    assigned_role := selected_role_text::user_role;
    initial_status := 'PENDING_APPROVAL'; -- Requires business review
  ELSIF selected_role_text = 'ADMIN' THEN
    -- Prevent unauthorized users from signing up directly as ADMIN
    assigned_role := 'MEMBER';
    initial_status := 'ACTIVE';
  ELSE
    assigned_role := 'MEMBER';
    initial_status := 'ACTIVE';
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    status,
    avatar_url,
    headline,
    bio,
    created_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    assigned_role,
    initial_status,
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    assigned_role::text || ' at ULearn',
    'Active ' || assigned_role::text || ' profile.',
    NOW()
  );

  -- Create corresponding child profile
  IF assigned_role = 'MEMBER' THEN
    INSERT INTO public.member_profiles (user_id) VALUES (NEW.id);
  ELSIF assigned_role = 'SELLER' THEN
    INSERT INTO public.seller_profiles (user_id, store_name, payout_email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Store') || '''s Digital Store', NEW.email);
  ELSIF assigned_role = 'COACH' THEN
    INSERT INTO public.coach_profiles (user_id, specialty)
    VALUES (NEW.id, 'Professional Coaching & Mentorship');
  ELSIF assigned_role = 'BRAND' THEN
    INSERT INTO public.brand_profiles (user_id, brand_name, legal_entity_name, industry)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Brand') || ' Solutions', 'Corporate Partner LLC', 'Education');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Helper function: Get calling user's role
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- -------------------------------------------------------------
-- PROFILES POLICIES
-- -------------------------------------------------------------
-- Anyone can view basic profiles (public directory)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can only update their own profile (trigger blocks role tampering)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- -------------------------------------------------------------
-- PRODUCTS POLICIES (SELLER / BRAND)
-- -------------------------------------------------------------
-- Anyone can view published products; Sellers and Brands can view all their own
CREATE POLICY "Public can view published products"
  ON public.products FOR SELECT
  USING (is_published = true OR auth.uid() = seller_id);

-- Only Sellers, Brands, or Admins can insert products
CREATE POLICY "Sellers and Brands can insert products"
  ON public.products FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id AND
    public.get_current_role() IN ('SELLER', 'BRAND', 'ADMIN')
  );

-- Only the owner can update their products
CREATE POLICY "Owners can update own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = seller_id OR public.get_current_role() = 'ADMIN');

-- Only the owner can delete their products
CREATE POLICY "Owners can delete own products"
  ON public.products FOR DELETE
  USING (auth.uid() = seller_id OR public.get_current_role() = 'ADMIN');

-- -------------------------------------------------------------
-- COACHING PROGRAMS POLICIES (COACH)
-- -------------------------------------------------------------
-- Public can view active programs; Coaches can view all their own
CREATE POLICY "Public can view active coaching programs"
  ON public.coaching_programs FOR SELECT
  USING (is_active = true OR auth.uid() = coach_id);

-- Only Coaches can create programs
CREATE POLICY "Coaches can insert programs"
  ON public.coaching_programs FOR INSERT
  WITH CHECK (
    auth.uid() = coach_id AND
    public.get_current_role() IN ('COACH', 'ADMIN')
  );

-- Only the owner coach can update/delete
CREATE POLICY "Coaches can update own programs"
  ON public.coaching_programs FOR UPDATE
  USING (auth.uid() = coach_id OR public.get_current_role() = 'ADMIN');

CREATE POLICY "Coaches can delete own programs"
  ON public.coaching_programs FOR DELETE
  USING (auth.uid() = coach_id OR public.get_current_role() = 'ADMIN');

-- -------------------------------------------------------------
-- ORDERS POLICIES (MEMBER, SELLER, COACH, BRAND)
-- -------------------------------------------------------------
-- Buyers view their purchases; Merchants view sales on their items; Admins view all
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (
    buyer_id = auth.uid() OR 
    merchant_id = auth.uid() OR 
    public.get_current_role() = 'ADMIN'
  );

-- Members can place orders
CREATE POLICY "Authenticated users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (buyer_id = auth.uid());
