-- ====================================================================
-- 360 DROPSHIP NETWORK - PRODUCTION SUPABASE / POSTGRESQL SCHEMA
-- Execute this SQL script in your Supabase SQL Editor (supabase.com)
-- ====================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    role TEXT DEFAULT 'dropshipper' CHECK (role IN ('dropshipper', 'admin')),
    store_domain TEXT DEFAULT '',
    kyc_status TEXT DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    wallet_balance NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MASTER PRODUCTS CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT 'PROD-' || FLOOR(RANDOM() * 9000 + 1000)::TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    wholesale_price NUMERIC(10,2) NOT NULL,
    shipping_fee NUMERIC(10,2) DEFAULT 75.00,
    suggested_mrp NUMERIC(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 1000,
    image_url TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT 'ORD-' || FLOOR(RANDOM() * 90000 + 10000)::TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_city TEXT NOT NULL,
    product_name TEXT NOT NULL,
    selling_price NUMERIC(10,2) NOT NULL,
    wholesale_cost NUMERIC(10,2) NOT NULL,
    shipping_fee NUMERIC(10,2) DEFAULT 75.00,
    agency_fee NUMERIC(10,2) NOT NULL,
    net_profit NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'Processing' CHECK (status IN ('Processing', 'Dispatched', 'Delivered', 'RTO', 'Pending')),
    tracking_id TEXT DEFAULT 'AWB' || FLOOR(RANDOM() * 9000000 + 1000000)::TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ADS WALLET TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.wallet_topups (
    id TEXT PRIMARY KEY DEFAULT 'TXN-' || FLOOR(RANDOM() * 90000 + 10000)::TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    gst_amount NUMERIC(10,2) NOT NULL,
    total_paid NUMERIC(10,2) NOT NULL,
    utr_number TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'APPROVED' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_topups ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ ACCESS FOR PRODUCTS
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
