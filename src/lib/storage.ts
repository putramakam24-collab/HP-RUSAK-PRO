import {
  Brand,
  Device,
  Variant,
  Grade,
  Price,
  PriceLog,
  IcChip,
  Transaction,
  InventoryItem,
  InventoryLog,
  Resale,
  OperationalExpense,
  UserProfile,
  SiteSettings,
  AuditLog,
  ReferenceStaging,
  TransactionStatus
} from '../types';
import {
  initialSiteSettings,
  initialUsers,
  initialBrands,
  initialGrades,
  initialDevices,
  initialVariants,
  initialPrices,
  initialPriceLogs,
  initialIcChips,
  initialTransactions,
  initialInventory,
  initialResales,
  initialExpenses,
  initialAuditLogs,
  initialStaging
} from './mockData';

const STORAGE_KEYS = {
  SETTINGS: 'hrp_site_settings',
  USERS: 'hrp_users',
  CURRENT_USER: 'hrp_current_user',
  BRANDS: 'hrp_brands',
  DEVICES: 'hrp_devices',
  VARIANTS: 'hrp_variants',
  GRADES: 'hrp_grades',
  PRICES: 'hrp_prices',
  PRICE_LOGS: 'hrp_price_logs',
  IC_CHIPS: 'hrp_ic_chips',
  TRANSACTIONS: 'hrp_transactions',
  INVENTORY: 'hrp_inventory',
  INVENTORY_LOGS: 'hrp_inventory_logs',
  RESALES: 'hrp_resales',
  EXPENSES: 'hrp_expenses',
  AUDIT_LOGS: 'hrp_audit_logs',
  STAGING: 'hrp_staging',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(val) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('hrp_storage_updated'));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

export const StorageService = {
  // --- SITE SETTINGS ---
  getSettings(): SiteSettings {
    return getItem(STORAGE_KEYS.SETTINGS, initialSiteSettings);
  },
  saveSettings(settings: SiteSettings, adminName: string): void {
    const updated = { ...settings, updated_at: new Date().toISOString() };
    setItem(STORAGE_KEYS.SETTINGS, updated);
    this.addAuditLog(adminName, 'super_admin', 'UPDATE_SETTINGS', 'site_settings', settings.id, 'Pembaruan identitas dan profil toko');
  },

  // --- USERS & AUTH ---
  getUsers(): UserProfile[] {
    return getItem(STORAGE_KEYS.USERS, initialUsers);
  },
  getCurrentUser(): UserProfile {
    return getItem(STORAGE_KEYS.CURRENT_USER, initialUsers[0]);
  },
  setCurrentUser(user: UserProfile): void {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
  },
  addUser(user: UserProfile, adminName: string): void {
    const users = this.getUsers();
    users.push(user);
    setItem(STORAGE_KEYS.USERS, users);
    this.addAuditLog(adminName, 'super_admin', 'CREATE_USER', 'profiles', user.id, `Tambah staff baru: ${user.full_name} (${user.role})`);
  },
  updateUser(id: string, updates: Partial<UserProfile>, adminName: string): void {
    const users = this.getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
    setItem(STORAGE_KEYS.USERS, users);
    this.addAuditLog(adminName, 'super_admin', 'UPDATE_USER', 'profiles', id, `Update user data: ${JSON.stringify(updates)}`);
  },

  // --- BRANDS ---
  getBrands(): Brand[] {
    return getItem(STORAGE_KEYS.BRANDS, initialBrands);
  },
  saveBrand(brand: Brand, adminName: string): void {
    const brands = this.getBrands();
    const idx = brands.findIndex(b => b.id === brand.id);
    if (idx >= 0) {
      brands[idx] = brand;
      this.addAuditLog(adminName, 'admin', 'UPDATE_BRAND', 'brands', brand.id, `Ubah merek: ${brand.name}`);
    } else {
      brands.push(brand);
      this.addAuditLog(adminName, 'admin', 'CREATE_BRAND', 'brands', brand.id, `Tambah merek baru: ${brand.name}`);
    }
    setItem(STORAGE_KEYS.BRANDS, brands);
  },
  deleteBrand(brandId: string, adminName: string): void {
    const brands = this.getBrands().filter(b => b.id !== brandId);
    setItem(STORAGE_KEYS.BRANDS, brands);
    this.addAuditLog(adminName, 'admin', 'DELETE_BRAND', 'brands', brandId, `Hapus brand id ${brandId}`);
  },

  // --- DEVICES ---
  getDevices(): Device[] {
    return getItem(STORAGE_KEYS.DEVICES, initialDevices);
  },
  saveDevice(device: Device, adminName: string): void {
    const devices = this.getDevices();
    const brands = this.getBrands();
    const brand = brands.find(b => b.id === device.brand_id);
    device.brand_name = brand ? brand.name : 'Unknown';

    const idx = devices.findIndex(d => d.id === device.id);
    if (idx >= 0) {
      devices[idx] = device;
      this.addAuditLog(adminName, 'admin', 'UPDATE_DEVICE', 'devices', device.id, `Ubah tipe HP: ${device.name}`);
    } else {
      devices.push(device);
      this.addAuditLog(adminName, 'admin', 'CREATE_DEVICE', 'devices', device.id, `Tambah tipe HP baru: ${device.name}`);
    }
    setItem(STORAGE_KEYS.DEVICES, devices);
  },
  deleteDevice(deviceId: string, adminName: string): void {
    const devices = this.getDevices().filter(d => d.id !== deviceId);
    setItem(STORAGE_KEYS.DEVICES, devices);
    this.addAuditLog(adminName, 'admin', 'DELETE_DEVICE', 'devices', deviceId, `Hapus device id ${deviceId}`);
  },

  // --- VARIANTS ---
  getVariants(): Variant[] {
    return getItem(STORAGE_KEYS.VARIANTS, initialVariants);
  },
  saveVariant(variant: Variant, adminName: string): void {
    const variants = this.getVariants();
    const idx = variants.findIndex(v => v.id === variant.id);
    if (idx >= 0) {
      variants[idx] = variant;
    } else {
      variants.push(variant);
    }
    setItem(STORAGE_KEYS.VARIANTS, variants);
    this.addAuditLog(adminName, 'admin', 'SAVE_VARIANT', 'variants', variant.id, `Varian ${variant.ram}/${variant.rom}`);
  },
  deleteVariant(variantId: string): void {
    const variants = this.getVariants().filter(v => v.id !== variantId);
    setItem(STORAGE_KEYS.VARIANTS, variants);
  },

  // --- GRADES ---
  getGrades(): Grade[] {
    return getItem(STORAGE_KEYS.GRADES, initialGrades).sort((a, b) => a.sort_order - b.sort_order);
  },
  saveGrade(grade: Grade, adminName: string): void {
    const grades = this.getGrades();
    const idx = grades.findIndex(g => g.id === grade.id);
    if (idx >= 0) {
      grades[idx] = grade;
      this.addAuditLog(adminName, 'admin', 'UPDATE_GRADE', 'grades', grade.id, `Ubah grade: ${grade.code}`);
    } else {
      grades.push(grade);
      this.addAuditLog(adminName, 'admin', 'CREATE_GRADE', 'grades', grade.id, `Tambah grade baru: ${grade.code}`);
    }
    setItem(STORAGE_KEYS.GRADES, grades);
  },

  // --- PRICES & PRICE LOGS ---
  getPrices(): Price[] {
    const rawPrices = getItem<Price[]>(STORAGE_KEYS.PRICES, initialPrices);
    const variants = this.getVariants();
    const devices = this.getDevices();
    const brands = this.getBrands();
    const grades = this.getGrades();

    // Populate joined relations for rapid UI rendering
    return rawPrices.map(p => {
      const variant = variants.find(v => v.id === p.variant_id);
      const device = variant ? devices.find(d => d.id === variant.device_id) : undefined;
      const brand = device ? brands.find(b => b.id === device.brand_id) : undefined;
      const grade = grades.find(g => g.id === p.grade_id);

      return {
        ...p,
        brand_name: brand?.name || 'Merek',
        device_name: device?.name || 'Tipe HP',
        model_code: device?.model_code || '',
        ram: variant?.ram || '-',
        rom: variant?.rom || '-',
        grade_code: grade?.code || '-',
        grade_name: grade?.name || '-'
      };
    });
  },
  getPriceLogs(): PriceLog[] {
    return getItem(STORAGE_KEYS.PRICE_LOGS, initialPriceLogs);
  },
  updatePrice(priceId: string, newPrice: number, reason: string, adminName: string): void {
    const prices = getItem<Price[]>(STORAGE_KEYS.PRICES, initialPrices);
    const priceIndex = prices.findIndex(p => p.id === priceId);
    if (priceIndex < 0) return;

    const oldPrice = prices[priceIndex].estimated_price;
    prices[priceIndex].estimated_price = newPrice;
    prices[priceIndex].updated_at = new Date().toISOString();
    prices[priceIndex].updated_by = adminName;
    setItem(STORAGE_KEYS.PRICES, prices);

    // Add Price Log
    const fullPrice = this.getPrices().find(p => p.id === priceId);
    const logs = this.getPriceLogs();
    const newLog: PriceLog = {
      id: `plog-${Date.now()}`,
      price_id: priceId,
      device_title: `${fullPrice?.device_name || 'HP'} (${fullPrice?.ram}/${fullPrice?.rom})`,
      grade_code: fullPrice?.grade_code || '-',
      old_price: oldPrice,
      new_price: newPrice,
      reason: reason || 'Penyesuaian estimasi pasar berkala',
      changed_by_name: adminName,
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    setItem(STORAGE_KEYS.PRICE_LOGS, logs);

    this.addAuditLog(adminName, 'admin', 'UPDATE_PRICE', 'prices', priceId, `Ubah harga dari ${oldPrice} ke ${newPrice}. Alasan: ${reason}`);
  },
  createPrice(newPriceObj: Price, adminName: string): void {
    const prices = getItem<Price[]>(STORAGE_KEYS.PRICES, initialPrices);
    prices.push(newPriceObj);
    setItem(STORAGE_KEYS.PRICES, prices);
    this.addAuditLog(adminName, 'admin', 'CREATE_PRICE', 'prices', newPriceObj.id, `Tambah patokan harga baru: Rp ${newPriceObj.estimated_price}`);
  },

  // --- IC CHIPS ---
  getIcChips(): IcChip[] {
    return getItem(STORAGE_KEYS.IC_CHIPS, initialIcChips);
  },
  saveIcChip(chip: IcChip, adminName: string): void {
    const chips = this.getIcChips();
    const idx = chips.findIndex(c => c.id === chip.id);
    if (idx >= 0) {
      chips[idx] = chip;
      this.addAuditLog(adminName, 'admin', 'UPDATE_IC', 'ic_chips', chip.id, `Update IC ${chip.chip_code}`);
    } else {
      chips.unshift(chip);
      this.addAuditLog(adminName, 'admin', 'CREATE_IC', 'ic_chips', chip.id, `Tambah IC ${chip.chip_code}`);
    }
    setItem(STORAGE_KEYS.IC_CHIPS, chips);
  },
  deleteIcChip(chipId: string, adminName: string): void {
    const chips = this.getIcChips().filter(c => c.id !== chipId);
    setItem(STORAGE_KEYS.IC_CHIPS, chips);
    this.addAuditLog(adminName, 'admin', 'DELETE_IC', 'ic_chips', chipId, `Hapus IC id ${chipId}`);
  },

  // --- TRANSACTIONS ---
  getTransactions(): Transaction[] {
    return getItem(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
  },
  generateNextInvoiceNumber(): string {
    const transactions = this.getTransactions();
    const currentYear = new Date().getFullYear();
    const prefix = `HRP-${currentYear}-`;
    const numbers = transactions
      .filter(t => t.invoice_number.startsWith(prefix))
      .map(t => {
        const parts = t.invoice_number.split('-');
        return parseInt(parts[2], 10) || 0;
      });
    const maxSeq = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextSeq = maxSeq + 1;
    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
  },
  createTransaction(tx: Transaction): Transaction {
    const transactions = this.getTransactions();
    transactions.unshift(tx);
    setItem(STORAGE_KEYS.TRANSACTIONS, transactions);

    // If status is paid, automatically flow items to inventory
    if (tx.status === 'paid') {
      this.syncTransactionItemsToInventory(tx);
    }

    this.addAuditLog(
      tx.cashier_name,
      'cashier',
      'CREATE_TRANSACTION',
      'transactions',
      tx.invoice_number,
      `Nota ${tx.invoice_number} dibuat untuk ${tx.customer_name}. Total: Rp ${tx.total_amount}`
    );
    return tx;
  },
  updateTransactionStatus(id: string, newStatus: TransactionStatus, adminName: string): void {
    const transactions = this.getTransactions();
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    const oldStatus = tx.status;
    tx.status = newStatus;
    tx.updated_at = new Date().toISOString();
    setItem(STORAGE_KEYS.TRANSACTIONS, transactions);

    // If transitioned to paid, sync to inventory
    if (newStatus === 'paid' && oldStatus !== 'paid') {
      this.syncTransactionItemsToInventory(tx);
    }

    this.addAuditLog(
      adminName,
      'admin',
      'UPDATE_TRANSACTION_STATUS',
      'transactions',
      tx.invoice_number,
      `Status transaksi berubah dari ${oldStatus} menjadi ${newStatus}`
    );
  },
  syncTransactionItemsToInventory(tx: Transaction): void {
    const inventory = this.getInventory();
    tx.items.forEach((item, index) => {
      // Check if item already exists in inventory
      const existing = inventory.find(inv => inv.transaction_item_id === item.id);
      if (!existing) {
        const nextInvCode = `INV-${new Date().getFullYear()}-${String(inventory.length + index + 1).padStart(4, '0')}`;
        const newInvItem: InventoryItem = {
          id: `inv-${Date.now()}-${index}`,
          inventory_code: nextInvCode,
          transaction_id: tx.id,
          transaction_item_id: item.id,
          invoice_number: tx.invoice_number,
          device_title: `${item.device_name_snapshot}`,
          brand_name: item.brand_snapshot,
          variant_name: item.variant_snapshot,
          grade_name: item.grade_snapshot,
          condition_notes: item.condition_description,
          purchase_price: item.purchase_price,
          current_status: 'available',
          storage_location: 'Rak Masuk Kasir - Rak A',
          entry_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        };
        inventory.unshift(newInvItem);
      }
    });
    setItem(STORAGE_KEYS.INVENTORY, inventory);
  },

  // --- INVENTORY ---
  getInventory(): InventoryItem[] {
    return getItem(STORAGE_KEYS.INVENTORY, initialInventory);
  },
  updateInventoryStatus(id: string, newStatus: any, notes: string, adminName: string): void {
    const inventory = this.getInventory();
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    const oldStatus = item.current_status;
    item.current_status = newStatus;
    item.updated_at = new Date().toISOString();
    if (notes) {
      item.condition_notes = `${item.condition_notes} | Catatan: ${notes}`;
    }
    setItem(STORAGE_KEYS.INVENTORY, inventory);

    this.addAuditLog(
      adminName,
      'admin',
      'UPDATE_INVENTORY_STATUS',
      'inventory_items',
      item.inventory_code,
      `Status unit ${item.inventory_code} berubah dari ${oldStatus} ke ${newStatus}`
    );
  },

  // --- RESALES ---
  getResales(): Resale[] {
    return getItem(STORAGE_KEYS.RESALES, initialResales);
  },
  createResale(resale: Resale): Resale {
    const resales = this.getResales();
    resales.unshift(resale);
    setItem(STORAGE_KEYS.RESALES, resales);

    // Mark the inventory item as 'sold'
    this.updateInventoryStatus(resale.inventory_id, 'sold', `Terjual ke ${resale.buyer_name} seharga Rp ${resale.sale_price}`, resale.cashier_name);

    this.addAuditLog(
      resale.cashier_name,
      'admin',
      'CREATE_RESALE',
      'resales',
      resale.sale_invoice_number,
      `Penjualan unit ${resale.inventory_code} (${resale.device_title}) seharga Rp ${resale.sale_price}. Laba bersih: Rp ${resale.net_profit}`
    );
    return resale;
  },

  // --- EXPENSES ---
  getExpenses(): OperationalExpense[] {
    return getItem(STORAGE_KEYS.EXPENSES, initialExpenses);
  },
  addExpense(expense: OperationalExpense, adminName: string): void {
    const expenses = this.getExpenses();
    expenses.unshift(expense);
    setItem(STORAGE_KEYS.EXPENSES, expenses);
    this.addAuditLog(adminName, 'admin', 'CREATE_EXPENSE', 'operational_expenses', expense.id, `Pengeluaran ${expense.category}: Rp ${expense.amount} (${expense.description})`);
  },
  deleteExpense(id: string, adminName: string): void {
    const expenses = this.getExpenses().filter(e => e.id !== id);
    setItem(STORAGE_KEYS.EXPENSES, expenses);
    this.addAuditLog(adminName, 'admin', 'DELETE_EXPENSE', 'operational_expenses', id, `Hapus pengeluaran id ${id}`);
  },

  // --- STAGING & REFERENSI ---
  getStaging(): ReferenceStaging[] {
    return getItem(STORAGE_KEYS.STAGING, initialStaging);
  },
  addStaging(item: ReferenceStaging): void {
    const list = this.getStaging();
    list.unshift(item);
    setItem(STORAGE_KEYS.STAGING, list);
  },
  updateStagingStatus(id: string, status: any, notes: string, adminName: string): void {
    const list = this.getStaging();
    const item = list.find(s => s.id === id);
    if (!item) return;

    item.status = status;
    item.verification_notes = notes;
    item.verified_by = adminName;
    if (status === 'imported') {
      item.imported_at = new Date().toISOString();
    }
    setItem(STORAGE_KEYS.STAGING, list);

    this.addAuditLog(adminName, 'admin', 'UPDATE_STAGING_STATUS', 'reference_staging', id, `Status staging: ${status} (${notes})`);
  },

  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLog[] {
    return getItem(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
  },
  addAuditLog(userName: string, userRole: any, action: string, tableName: string, recordId: string, details: string): void {
    const logs = this.getAuditLogs();
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_name: userName || 'Sistem',
      user_role: userRole || 'admin',
      action,
      table_name: tableName,
      record_id: recordId,
      details,
      created_at: new Date().toISOString()
    };
    logs.unshift(log);
    // Keep last 100 logs
    if (logs.length > 100) logs.pop();
    setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // --- SYSTEM RESET ---
  resetToDefaultData(adminName: string): void {
    localStorage.clear();
    setItem(STORAGE_KEYS.SETTINGS, initialSiteSettings);
    setItem(STORAGE_KEYS.USERS, initialUsers);
    setItem(STORAGE_KEYS.CURRENT_USER, initialUsers[0]);
    setItem(STORAGE_KEYS.BRANDS, initialBrands);
    setItem(STORAGE_KEYS.GRADES, initialGrades);
    setItem(STORAGE_KEYS.DEVICES, initialDevices);
    setItem(STORAGE_KEYS.VARIANTS, initialVariants);
    setItem(STORAGE_KEYS.PRICES, initialPrices);
    setItem(STORAGE_KEYS.PRICE_LOGS, initialPriceLogs);
    setItem(STORAGE_KEYS.IC_CHIPS, initialIcChips);
    setItem(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
    setItem(STORAGE_KEYS.INVENTORY, initialInventory);
    setItem(STORAGE_KEYS.RESALES, initialResales);
    setItem(STORAGE_KEYS.EXPENSES, initialExpenses);
    setItem(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    setItem(STORAGE_KEYS.STAGING, initialStaging);
    this.addAuditLog(adminName, 'super_admin', 'RESET_SYSTEM', 'all', 'all', 'Reset database ke kondisi awal bawaan pabrik');
  }
};
