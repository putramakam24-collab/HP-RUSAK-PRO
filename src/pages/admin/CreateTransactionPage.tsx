import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Save,
  Printer,
  Receipt,
  User,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Brand, Device, Variant, Grade, Price, Transaction, TransactionItem } from '../../types';
import { StorageService } from '../../lib/storage';
import { formatRupiah } from '../../lib/utils';

interface ItemFormRow {
  brand_id: string;
  brand_name: string;
  device_id: string;
  device_name: string;
  variant_id: string;
  variant_name: string;
  grade_id: string;
  grade_name: string;
  condition_description: string;
  accessories: string;
  imei_or_sn: string;
  purchase_price: number;
}

export const CreateTransactionPage: React.FC = () => {
  const navigate = useNavigate();
  const brands: Brand[] = StorageService.getBrands();
  const devices: Device[] = StorageService.getDevices();
  const variants: Variant[] = StorageService.getVariants();
  const grades: Grade[] = StorageService.getGrades();
  const prices: Price[] = StorageService.getPrices();
  const currentUser = StorageService.getCurrentUser();

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'partial'>('cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [status, setStatus] = useState<'draft' | 'pending_check' | 'approved' | 'paid'>('paid');
  const [notes, setNotes] = useState('');

  // Initial Item row
  const [items, setItems] = useState<ItemFormRow[]>([
    {
      brand_id: brands[0]?.id || '',
      brand_name: brands[0]?.name || '',
      device_id: '',
      device_name: '',
      variant_id: '',
      variant_name: '',
      grade_id: grades[0]?.id || '',
      grade_name: grades[0]?.code || '',
      condition_description: 'Mati total perawan, belum pernah diservis',
      accessories: 'Batangan (Unit Only)',
      imei_or_sn: '',
      purchase_price: 350000,
    }
  ]);

  useEffect(() => {
    // Generate invoice sequence
    const generated = StorageService.generateNextInvoiceNumber();
    setInvoiceNumber(generated);
  }, []);

  // Set default device for first row
  useEffect(() => {
    if (items[0] && !items[0].device_id && devices.length > 0) {
      const firstDev = devices[0];
      const devVars = variants.filter(v => v.device_id === firstDev.id);
      const firstVar = devVars[0];
      const firstGrade = grades[0];

      // Find price suggestion
      const matchedPrice = prices.find(
        p => p.variant_id === firstVar?.id && p.grade_id === firstGrade?.id
      );

      setItems([
        {
          brand_id: firstDev.brand_id,
          brand_name: firstDev.brand_name || '',
          device_id: firstDev.id,
          device_name: firstDev.name,
          variant_id: firstVar ? firstVar.id : '',
          variant_name: firstVar ? `${firstVar.ram}/${firstVar.rom}` : '-',
          grade_id: firstGrade ? firstGrade.id : '',
          grade_name: firstGrade ? firstGrade.code : 'A++',
          condition_description: 'Mati total perawan, belum pernah disolder',
          accessories: 'Batangan (Unit Only)',
          imei_or_sn: '',
          purchase_price: matchedPrice ? matchedPrice.estimated_price : 350000,
        }
      ]);
    }
  }, [devices, variants, grades, prices]);

  const handleBrandChange = (index: number, brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    const availableDevices = devices.filter(d => d.brand_id === brandId);
    const dev = availableDevices[0];
    const devVars = dev ? variants.filter(v => v.device_id === dev.id) : [];
    const v = devVars[0];
    const g = grades.find(x => x.id === items[index].grade_id) || grades[0];

    const matchedPrice = prices.find(p => p.variant_id === v?.id && p.grade_id === g?.id);

    const updated = [...items];
    updated[index] = {
      ...updated[index],
      brand_id: brandId,
      brand_name: brand?.name || '',
      device_id: dev ? dev.id : '',
      device_name: dev ? dev.name : '',
      variant_id: v ? v.id : '',
      variant_name: v ? `${v.ram}/${v.rom}` : '',
      purchase_price: matchedPrice ? matchedPrice.estimated_price : updated[index].purchase_price,
    };
    setItems(updated);
  };

  const handleDeviceChange = (index: number, deviceId: string) => {
    const dev = devices.find(d => d.id === deviceId);
    const devVars = dev ? variants.filter(v => v.device_id === dev.id) : [];
    const v = devVars[0];
    const g = grades.find(x => x.id === items[index].grade_id) || grades[0];

    const matchedPrice = prices.find(p => p.variant_id === v?.id && p.grade_id === g?.id);

    const updated = [...items];
    updated[index] = {
      ...updated[index],
      device_id: deviceId,
      device_name: dev ? dev.name : '',
      variant_id: v ? v.id : '',
      variant_name: v ? `${v.ram}/${v.rom}` : '',
      purchase_price: matchedPrice ? matchedPrice.estimated_price : updated[index].purchase_price,
    };
    setItems(updated);
  };

  const handleVariantChange = (index: number, variantId: string) => {
    const v = variants.find(x => x.id === variantId);
    const g = grades.find(x => x.id === items[index].grade_id) || grades[0];
    const matchedPrice = prices.find(p => p.variant_id === variantId && p.grade_id === g?.id);

    const updated = [...items];
    updated[index] = {
      ...updated[index],
      variant_id: variantId,
      variant_name: v ? `${v.ram}/${v.rom}` : '',
      purchase_price: matchedPrice ? matchedPrice.estimated_price : updated[index].purchase_price,
    };
    setItems(updated);
  };

  const handleGradeChange = (index: number, gradeId: string) => {
    const g = grades.find(x => x.id === gradeId);
    const matchedPrice = prices.find(p => p.variant_id === items[index].variant_id && p.grade_id === gradeId);

    const updated = [...items];
    updated[index] = {
      ...updated[index],
      grade_id: gradeId,
      grade_name: g ? g.code : '',
      purchase_price: matchedPrice ? matchedPrice.estimated_price : updated[index].purchase_price,
    };
    setItems(updated);
  };

  const updateItemField = (index: number, field: keyof ItemFormRow, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItemRow = () => {
    const firstDev = devices[0];
    const devVars = firstDev ? variants.filter(v => v.device_id === firstDev.id) : [];
    const firstVar = devVars[0];
    const firstGrade = grades[0];

    setItems([
      ...items,
      {
        brand_id: firstDev ? firstDev.brand_id : '',
        brand_name: firstDev ? firstDev.brand_name || '' : '',
        device_id: firstDev ? firstDev.id : '',
        device_name: firstDev ? firstDev.name : '',
        variant_id: firstVar ? firstVar.id : '',
        variant_name: firstVar ? `${firstVar.ram}/${firstVar.rom}` : '',
        grade_id: firstGrade ? firstGrade.id : '',
        grade_name: firstGrade ? firstGrade.code : '',
        condition_description: 'Mati total perawan',
        accessories: 'Unit Only',
        imei_or_sn: '',
        purchase_price: 250000,
      }
    ]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const grandTotal = items.reduce((sum, it) => sum + (Number(it.purchase_price) || 0), 0);

  // Auto sync paid amount if paid
  useEffect(() => {
    if (status === 'paid' && paidAmount === 0) {
      setPaidAmount(grandTotal);
    }
  }, [status, grandTotal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerWhatsapp.trim()) {
      alert('Nama pelanggan dan No. WhatsApp wajib diisi.');
      return;
    }
    if (items.some(i => !i.device_name || i.purchase_price < 0)) {
      alert('Pastikan setiap unit telah dipilih tipe HP dan nominal harga beli.');
      return;
    }

    const txId = `tx-${Date.now()}`;
    const txItems: TransactionItem[] = items.map((it, idx) => ({
      id: `txi-${Date.now()}-${idx}`,
      transaction_id: txId,
      device_id: it.device_id,
      variant_id: it.variant_id,
      grade_id: it.grade_id,
      device_name_snapshot: it.device_name,
      brand_snapshot: it.brand_name,
      variant_snapshot: it.variant_name,
      grade_snapshot: it.grade_name,
      condition_description: it.condition_description,
      accessories: it.accessories,
      imei_or_sn: it.imei_or_sn,
      purchase_price: Number(it.purchase_price)
    }));

    const finalPaid = paidAmount > 0 ? paidAmount : (status === 'paid' ? grandTotal : 0);
    const finalRemaining = Math.max(0, grandTotal - finalPaid);

    const newTx: Transaction = {
      id: txId,
      invoice_number: invoiceNumber,
      customer_name: customerName.trim(),
      customer_whatsapp: customerWhatsapp.trim(),
      customer_address: customerAddress.trim() || undefined,
      total_amount: grandTotal,
      paid_amount: finalPaid,
      remaining_amount: finalRemaining,
      status: status,
      payment_method: paymentMethod,
      notes: notes.trim() || undefined,
      cashier_id: currentUser.id,
      cashier_name: currentUser.full_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: txItems
    };

    StorageService.createTransaction(newTx);
    alert(`Transaksi berhasil disimpan dengan No. Nota: ${newTx.invoice_number}`);
    navigate(`/admin/transactions/${newTx.id}/print`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
            KASIR POS PEMBELIAN
          </span>
          <h1 className="text-2xl font-black text-white">Buat Nota Pembelian HP Rusak</h1>
          <p className="text-xs text-slate-400">
            Pencatatan pembelian fisik dari pelanggan atau counter rekanan.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">No. Nota Otomatis:</span>
          <span className="font-mono font-black text-cyan-400 text-sm">{invoiceNumber}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* DATA PELANGGAN */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Identitas Pelanggan / Penjual</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nama Pelanggan *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Budi Santoso / Counter Jaya"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">No. WhatsApp *</label>
              <input
                type="text"
                required
                value={customerWhatsapp}
                onChange={(e) => setCustomerWhatsapp(e.target.value)}
                placeholder="Contoh: 081298765432"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Alamat / Asal Kota (Opsional)</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Contoh: Roxy Mas / Cengkareng / Surabaya"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* ITEMS MULTI-UNIT */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-white text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Daftar Unit HP yang Dibeli ({items.length} Item)</span>
            </h2>

            <button
              type="button"
              onClick={addItemRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 border border-blue-500/40 rounded-xl text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Unit HP Lain</span>
            </button>
          </div>

          <div className="space-y-4">
            {items.map((it, idx) => {
              const availableDevices = devices.filter(d => d.brand_id === it.brand_id);
              const devVars = variants.filter(v => v.device_id === it.device_id);

              return (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">
                      Unit #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title="Hapus Unit Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Merek</label>
                      <select
                        value={it.brand_id}
                        onChange={(e) => handleBrandChange(idx, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                      >
                        {brands.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Tipe HP *</label>
                      <select
                        value={it.device_id}
                        onChange={(e) => handleDeviceChange(idx, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-semibold"
                      >
                        <option value="">-- Pilih Tipe --</option>
                        {availableDevices.map(d => (
                          <option key={d.id} value={d.id}>{d.name} {d.model_code ? `(${d.model_code})` : ''}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Varian RAM/ROM</label>
                      <select
                        value={it.variant_id}
                        onChange={(e) => handleVariantChange(idx, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                      >
                        <option value="">-- RAM/ROM --</option>
                        {devVars.map(v => (
                          <option key={v.id} value={v.id}>{v.ram} / {v.rom}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Grade Penilaian</label>
                      <select
                        value={it.grade_id}
                        onChange={(e) => handleGradeChange(idx, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-cyan-300 font-bold"
                      >
                        {grades.map(g => (
                          <option key={g.id} value={g.id}>Grade {g.code}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Kondisi & Kerusakan Fisik</label>
                      <input
                        type="text"
                        value={it.condition_description}
                        onChange={(e) => updateItemField(idx, 'condition_description', e.target.value)}
                        placeholder="Contoh: LCD tompel, mesin normal sinyal aktif"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Kelengkapan</label>
                      <input
                        type="text"
                        value={it.accessories}
                        onChange={(e) => updateItemField(idx, 'accessories', e.target.value)}
                        placeholder="Batangan / Lengkap Box / Tanpa Baterai"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Harga Beli Disepakati (Rp) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        step={5000}
                        value={it.purchase_price}
                        onChange={(e) => updateItemField(idx, 'purchase_price', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-emerald-400 font-mono font-bold text-sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PEMBAYARAN & STATUS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Total Pembelian</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">
                {formatRupiah(grandTotal)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Status Transaksi</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="bg-slate-950 text-white border border-slate-800 rounded-xl p-2 font-bold"
                >
                  <option value="paid">LUNAS (Langsung Masuk Stok)</option>
                  <option value="pending_check">Menunggu Cek Fisik</option>
                  <option value="draft">Draft (Belum Bayar)</option>
                  <option value="approved">Disetujui</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Metode Bayar</label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="bg-slate-950 text-white border border-slate-800 rounded-xl p-2 font-semibold"
                >
                  <option value="cash">Tunai (Cash)</option>
                  <option value="transfer">Transfer Bank (BCA)</option>
                  <option value="partial">Bayar Sebagian / DP</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Nominal Dibayarkan (Rp)</label>
                <input
                  type="number"
                  value={paidAmount || grandTotal}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-medium mb-1">Catatan Tambahan Nota</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Unit dicek LCD normal, IC perawan kaleng rapat"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
            />
          </div>
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/transactions')}
            className="px-5 py-2.5 border border-slate-700 hover:bg-slate-900 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Nota & Cetak</span>
          </button>
        </div>
      </form>
    </div>
  );
};
