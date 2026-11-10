export type UserRole = 'super_admin' | 'admin' | 'cashier';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  store_name: string;
  tagline: string;
  phone_whatsapp: string;
  email: string;
  address: string;
  logo_url: string;
  operating_hours: string;
  receipt_footer_note: string;
  default_thermal_size: '58mm' | '80mm' | 'a4';
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
  seo_title: string;
  seo_description: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_active: boolean;
  popular_order?: number;
  created_at: string;
}

export interface Device {
  id: string;
  brand_id: string;
  brand_name?: string;
  name: string;
  model_code: string;
  release_year?: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Variant {
  id: string;
  device_id: string;
  ram: string;
  rom: string;
  is_active: boolean;
  created_at: string;
}

export interface Grade {
  id: string;
  code: string;
  name: string;
  description: string;
  criteria_ic_pcb?: string;
  criteria_lcd?: string;
  criteria_casing?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Price {
  id: string;
  variant_id: string;
  device_id?: string;
  grade_id: string;
  estimated_price: number;
  notes?: string;
  is_active: boolean;
  updated_at: string;
  updated_by?: string;
  // Joined helpers
  brand_name?: string;
  device_name?: string;
  model_code?: string;
  ram?: string;
  rom?: string;
  grade_code?: string;
  grade_name?: string;
}

export interface PriceLog {
  id: string;
  price_id: string;
  device_title: string;
  grade_code: string;
  old_price: number;
  new_price: number;
  reason: string;
  changed_by_name: string;
  created_at: string;
}

export interface IcChip {
  id: string;
  chip_code: string;
  name: string;
  type: string; // e.g. eMMC, UFS, Power IC, CPU, RF / Sinyal, Audio Codec
  brand: string; // Samsung, SK Hynix, Micron, Qualcomm, MediaTek
  capacity?: string; // 16GB, 32GB, 64GB, 128GB, 256GB
  is_emmc_ufs: boolean;
  technician_notes: string;
  compatible_models: string[]; // List of device names
  is_verified: boolean;
  created_at: string;
}

export type TransactionStatus = 'draft' | 'pending_check' | 'approved' | 'paid' | 'cancelled';
export type PaymentMethod = 'cash' | 'transfer' | 'partial';

export interface TransactionItem {
  id: string;
  transaction_id: string;
  device_id?: string;
  variant_id?: string;
  grade_id?: string;
  device_name_snapshot: string;
  brand_snapshot: string;
  variant_snapshot: string;
  grade_snapshot: string;
  condition_description: string;
  accessories: string;
  imei_or_sn?: string;
  purchase_price: number;
  photo_url?: string;
}

export interface Transaction {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_whatsapp: string;
  customer_address?: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: TransactionStatus;
  payment_method: PaymentMethod;
  notes?: string;
  cashier_id: string;
  cashier_name: string;
  created_at: string;
  updated_at: string;
  items: TransactionItem[];
}

export type InventoryStatus = 'available' | 'in_check' | 'repairing' | 'ready_for_sale' | 'sold' | 'scrapped' | 'cancelled';

export interface InventoryItem {
  id: string;
  inventory_code: string;
  transaction_id: string;
  transaction_item_id: string;
  invoice_number: string;
  device_title: string;
  brand_name: string;
  variant_name: string;
  grade_name: string;
  condition_notes: string;
  purchase_price: number;
  current_status: InventoryStatus;
  storage_location: string;
  entry_date: string;
  updated_at: string;
}

export interface InventoryLog {
  id: string;
  inventory_id: string;
  old_status: InventoryStatus;
  new_status: InventoryStatus;
  notes: string;
  changed_by_name: string;
  created_at: string;
}

export interface Resale {
  id: string;
  sale_invoice_number: string;
  inventory_id: string;
  inventory_code: string;
  device_title: string;
  buyer_name: string;
  buyer_contact?: string;
  purchase_price: number;
  sale_price: number;
  additional_costs: number; // Ongkir / part kanibalan
  gross_profit: number; // sale_price - purchase_price
  net_profit: number; // sale_price - purchase_price - additional_costs
  payment_method: string;
  sale_date: string;
  notes?: string;
  cashier_name: string;
}

export interface OperationalExpense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  proof_url?: string;
  recorded_by_name: string;
  created_at: string;
}

export type StagingStatus = 'pending' | 'verified' | 'rejected' | 'imported';

export interface ReferenceStaging {
  id: string;
  data_type: 'device' | 'price' | 'ic_chip';
  source_url: string;
  fetch_method: 'official_export' | 'public_api' | 'manual_spreadsheet';
  raw_payload: any;
  status: StagingStatus;
  verified_by?: string;
  verification_notes?: string;
  created_at: string;
  imported_at?: string;
}

export interface AuditLog {
  id: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  table_name: string;
  record_id: string;
  details: string;
  created_at: string;
}
