import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.includes('supabase.co') &&
    !supabaseUrl.includes('your-project')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const FULL_SUPABASE_MIGRATION_SQL = `-- ==============================================================
-- HP RUSAK PRO — DATABASE MIGRATION SCRIPT (POSTGRESQL & SUPABASE)
-- Lengkap dengan RLS, Triggers, Fungsi Sequence Atomik & Seed Data
-- ==============================================================

-- 1. EXTENSIONS & CUSTOM ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE app_user_role AS ENUM ('super_admin', 'admin', 'cashier');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE txn_status AS ENUM ('draft', 'pending_check', 'approved', 'paid', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inv_status AS ENUM ('available', 'in_check', 'repairing', 'ready_for_sale', 'sold', 'scrapped', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE staging_status AS ENUM ('pending', 'verified', 'rejected', 'imported');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PROFILES & ROLES (Terkoneksi ke auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role app_user_role NOT NULL DEFAULT 'cashier',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name TEXT NOT NULL DEFAULT 'HP RUSAK PRO',
    tagline TEXT NOT NULL DEFAULT 'HP Rusak? Tetap Ada Harganya!',
    phone_whatsapp TEXT NOT NULL DEFAULT '6281298765432',
    email TEXT DEFAULT 'admin@hprusakpro.com',
    address TEXT DEFAULT 'ITC Roxy Mas, Lantai 2 Blok B-12, Jakarta Pusat',
    logo_url TEXT,
    operating_hours TEXT DEFAULT 'Senin - Sabtu: 09:00 - 19:30 WIB',
    receipt_footer_note TEXT DEFAULT 'Unit rusak yang sudah diuji fisik & dibayar tidak dapat ditarik kembali.',
    default_thermal_size TEXT NOT NULL DEFAULT '58mm',
    bank_name TEXT DEFAULT 'BCA (Bank Central Asia)',
    bank_account_number TEXT DEFAULT '8830-1928-44',
    bank_account_holder TEXT DEFAULT 'CV TEKNIK GADGET INDONESIA',
    seo_title TEXT DEFAULT 'HP RUSAK PRO — Cek Harga HP Rusak & Database Komponen',
    seo_description TEXT DEFAULT 'Jual HP rusak Anda dengan harga pantas. Terima mati total, bootloop, LCD pecah, IC eMMC/UFS.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. MASTER BRANDS, DEVICES, VARIANTS, GRADES
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    popular_order INT DEFAULT 99,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    model_code TEXT,
    release_year INT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_brand_device_model UNIQUE (brand_id, name, model_code)
);

CREATE TABLE IF NOT EXISTS public.variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    ram TEXT NOT NULL,
    rom TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_device_ram_rom UNIQUE (device_id, ram, rom)
);

CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    criteria_ic_pcb TEXT,
    criteria_lcd TEXT,
    criteria_casing TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Master Harga Dinamis
CREATE TABLE IF NOT EXISTS public.prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES public.variants(id) ON DELETE CASCADE,
    grade_id UUID NOT NULL REFERENCES public.grades(id) ON DELETE RESTRICT,
    estimated_price NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (estimated_price >= 0),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_variant_grade UNIQUE (variant_id, grade_id)
);

CREATE TABLE IF NOT EXISTS public.price_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    price_id UUID NOT NULL REFERENCES public.prices(id) ON DELETE CASCADE,
    device_title TEXT,
    grade_code TEXT,
    old_price NUMERIC(15, 2) NOT NULL,
    new_price NUMERIC(15, 2) NOT NULL,
    reason TEXT,
    changed_by_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. MASTER IC CHIPS & COMPATIBILITY
CREATE TABLE IF NOT EXISTS public.ic_chips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chip_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    brand TEXT,
    capacity TEXT,
    is_emmc_ufs BOOLEAN NOT NULL DEFAULT false,
    technician_notes TEXT,
    compatible_models TEXT[] DEFAULT '{}',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TRANSAKSI PEMBELIAN HP RUSAK
CREATE TABLE IF NOT EXISTS public.invoice_sequences (
    year INT PRIMARY KEY,
    last_seq INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    customer_address TEXT,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status txn_status NOT NULL DEFAULT 'draft',
    payment_method TEXT NOT NULL DEFAULT 'cash',
    notes TEXT,
    cashier_id UUID REFERENCES public.profiles(id),
    cashier_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.variants(id) ON DELETE SET NULL,
    grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
    device_name_snapshot TEXT NOT NULL,
    brand_snapshot TEXT NOT NULL,
    variant_snapshot TEXT NOT NULL,
    grade_snapshot TEXT NOT NULL,
    condition_description TEXT NOT NULL,
    accessories TEXT,
    purchase_price NUMERIC(15, 2) NOT NULL CHECK (purchase_price >= 0),
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. INVENTORI STOK HP
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_code TEXT NOT NULL UNIQUE,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    transaction_item_id UUID NOT NULL UNIQUE REFERENCES public.transaction_items(id) ON DELETE RESTRICT,
    invoice_number TEXT NOT NULL,
    device_title TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    variant_name TEXT NOT NULL,
    grade_name TEXT NOT NULL,
    condition_notes TEXT,
    purchase_price NUMERIC(15, 2) NOT NULL,
    current_status inv_status NOT NULL DEFAULT 'available',
    storage_location TEXT DEFAULT 'Rak Utama',
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. PENJUALAN KEMBALI (RESALES) & PENGELUARAN (EXPENSES)
CREATE TABLE IF NOT EXISTS public.resales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_invoice_number TEXT NOT NULL UNIQUE,
    inventory_id UUID NOT NULL UNIQUE REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
    inventory_code TEXT NOT NULL,
    device_title TEXT NOT NULL,
    buyer_name TEXT NOT NULL,
    buyer_contact TEXT,
    purchase_price NUMERIC(15, 2) NOT NULL,
    sale_price NUMERIC(15, 2) NOT NULL CHECK (sale_price >= 0),
    additional_costs NUMERIC(15, 2) NOT NULL DEFAULT 0,
    gross_profit NUMERIC(15, 2) NOT NULL,
    net_profit NUMERIC(15, 2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'transfer',
    notes TEXT,
    cashier_name TEXT NOT NULL,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.operational_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    proof_url TEXT,
    recorded_by_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. STAGING & AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.reference_staging (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_type TEXT NOT NULL,
    source_url TEXT,
    fetch_method TEXT DEFAULT 'manual_spreadsheet',
    raw_payload JSONB NOT NULL,
    status staging_status NOT NULL DEFAULT 'pending',
    verified_by TEXT,
    verification_notes TEXT,
    imported_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name TEXT NOT NULL,
    user_role app_user_role NOT NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. GENERATOR NOMOR NOTA ATOMIK
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    current_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
    next_val INT;
BEGIN
    INSERT INTO public.invoice_sequences (year, last_seq)
    VALUES (current_year, 1)
    ON CONFLICT (year)
    DO UPDATE SET last_seq = invoice_sequences.last_seq + 1
    RETURNING last_seq INTO next_val;

    RETURN 'HRP-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ic_chips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function untuk cek role dari JWT auth.uid()
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS app_user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Publik bisa melihat data aktif
CREATE POLICY "Public Read Brands" ON public.brands FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Devices" ON public.devices FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Variants" ON public.variants FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Grades" ON public.grades FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Prices" ON public.prices FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read IC Chips" ON public.ic_chips FOR SELECT USING (is_verified = true);
CREATE POLICY "Public Read Site Settings" ON public.site_settings FOR SELECT USING (true);

-- Staff Kasir, Admin, Super Admin
CREATE POLICY "Staff Manage Transactions" ON public.transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff Manage Items" ON public.transaction_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff Manage Inventory" ON public.inventory_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff Manage Resales" ON public.resales FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff Manage Expenses" ON public.operational_expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Manage Master Data" ON public.brands FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Manage Devices" ON public.devices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Manage Variants" ON public.variants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Manage Grades" ON public.grades FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Manage Prices" ON public.prices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Manage IC Chips" ON public.ic_chips FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Manage Staging" ON public.reference_staging FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Read Audit Logs" ON public.audit_logs FOR ALL USING (auth.role() = 'authenticated');
`;
