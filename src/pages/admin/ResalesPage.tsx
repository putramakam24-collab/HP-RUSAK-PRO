import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  DollarSign,
  User,
  ArrowRight,
  Boxes,
  CheckCircle,
  X,
  Calendar
} from 'lucide-react';
import { Resale, InventoryItem } from '../../types';
import { StorageService } from '../../lib/storage';
import { formatRupiah, formatDate } from '../../lib/utils';

export const ResalesPage: React.FC = () => {
  const [resales, setResales] = useState<Resale[]>(() => StorageService.getResales());
  const [inventory, setInventory] = useState<InventoryItem[]>(() => StorageService.getInventory());
  const currentUser = StorageService.getCurrentUser();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [salePrice, setSalePrice] = useState<number>(0);
  const [additionalCosts, setAdditionalCosts] = useState<number>(0);
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [notes, setNotes] = useState('');

  // Available inventory items for resale (not sold)
  const availableInventory = inventory.filter(i => i.current_status !== 'sold' && i.current_status !== 'cancelled');
  const selectedInv = inventory.find(i => i.id === selectedInventoryId);

  const purchasePrice = selectedInv ? selectedInv.purchase_price : 0;
  const grossProfit = salePrice - purchasePrice;
  const netProfit = grossProfit - additionalCosts;

  const handleOpenModal = () => {
    if (availableInventory.length === 0) {
      alert('Tidak ada unit stok yang tersedia untuk dijual.');
      return;
    }
    const first = availableInventory[0];
    setSelectedInventoryId(first.id);
    setSalePrice(first.purchase_price + 150000); // Default suggested sale price
    setAdditionalCosts(0);
    setBuyerName('');
    setBuyerContact('');
    setPaymentMethod('transfer');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSaveResale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInv) {
      alert('Pilih unit inventori yang akan dijual.');
      return;
    }
    if (!buyerName.trim()) {
      alert('Nama pembeli wajib diisi.');
      return;
    }
    if (salePrice <= 0) {
      alert('Harga jual harus lebih besar dari 0.');
      return;
    }

    const currentYear = new Date().getFullYear();
    const nextSeq = resales.length + 1;
    const saleInvoiceNumber = `HRP-OUT-${currentYear}-${String(nextSeq).padStart(6, '0')}`;

    const newResale: Resale = {
      id: `res-${Date.now()}`,
      sale_invoice_number: saleInvoiceNumber,
      inventory_id: selectedInv.id,
      inventory_code: selectedInv.inventory_code,
      device_title: selectedInv.device_title,
      buyer_name: buyerName.trim(),
      buyer_contact: buyerContact.trim() || undefined,
      purchase_price: selectedInv.purchase_price,
      sale_price: salePrice,
      additional_costs: additionalCosts,
      gross_profit: grossProfit,
      net_profit: netProfit,
      payment_method: paymentMethod,
      sale_date: new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
      cashier_name: currentUser.full_name
    };

    StorageService.createResale(newResale);
    setResales(StorageService.getResales());
    setInventory(StorageService.getInventory());
    setIsModalOpen(false);
    alert(`Penjualan berhasil dicatat! Laba Bersih: ${formatRupiah(netProfit)}`);
  };

  const filteredResales = resales.filter(r => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.sale_invoice_number.toLowerCase().includes(q) ||
      r.buyer_name.toLowerCase().includes(q) ||
      r.device_title.toLowerCase().includes(q) ||
      r.inventory_code.toLowerCase().includes(q)
    );
  });

  const totalRevenue = resales.reduce((acc, r) => acc + r.sale_price, 0);
  const totalNetProfit = resales.reduce((acc, r) => acc + r.net_profit, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Modul Penjualan Kembali (Resale)</h1>
          <p className="text-xs text-slate-400">
            Pencatatan penjualan unit handphone yang telah dibeli atau diperbaiki ke pembeli/teknisi rekanan.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Jual Unit Baru (Resale)</span>
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Transaksi Resale</span>
          <div className="text-2xl font-black text-white">{resales.length} Transaksi</div>
          <span className="text-[10px] text-cyan-400">Unit Terjual</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Nilai Penjualan</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {formatRupiah(totalRevenue)}
          </div>
          <span className="text-[10px] text-slate-500">Pemasukan Kotor</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Laba Bersih</span>
          <div className={`text-2xl font-black font-mono ${totalNetProfit >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
            {formatRupiah(totalNetProfit)}
          </div>
          <span className="text-[10px] text-slate-500">Setelah dikurangi modal beli & biaya</span>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <Search className="w-4 h-4 text-slate-400 absolute left-7 top-7" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nota resale (HRP-OUT-...), nama pembeli, atau tipe HP..."
          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
              <tr>
                <th className="p-3.5">No. Nota & Tanggal</th>
                <th className="p-3.5">Unit Inventori</th>
                <th className="p-3.5">Pembeli</th>
                <th className="p-3.5">Harga Beli</th>
                <th className="p-3.5">Harga Jual</th>
                <th className="p-3.5">Biaya Tambahan</th>
                <th className="p-3.5">Laba Bersih</th>
                <th className="p-3.5">Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredResales.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-cyan-400 text-sm block">
                      {r.sale_invoice_number}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {formatDate(r.sale_date)}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="font-bold text-white text-sm">{r.device_title}</div>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Ref Stok: {r.inventory_code}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="font-bold text-slate-200">{r.buyer_name}</div>
                    {r.buyer_contact && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {r.buyer_contact}
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 font-mono text-slate-400">
                    {formatRupiah(r.purchase_price)}
                  </td>

                  <td className="p-3.5 font-bold font-mono text-emerald-400">
                    {formatRupiah(r.sale_price)}
                  </td>

                  <td className="p-3.5 font-mono text-rose-400">
                    {r.additional_costs > 0 ? formatRupiah(r.additional_costs) : '-'}
                  </td>

                  <td className="p-3.5 font-black font-mono text-sm text-cyan-400">
                    {formatRupiah(r.net_profit)}
                  </td>

                  <td className="p-3.5 text-slate-400 text-[11px]">
                    {r.cashier_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREATE RESALE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                Catat Penjualan Unit Stok (Resale)
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResale} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Pilih Unit Inventori *
                </label>
                <select
                  value={selectedInventoryId}
                  onChange={(e) => {
                    setSelectedInventoryId(e.target.value);
                    const inv = inventory.find(i => i.id === e.target.value);
                    if (inv) {
                      setSalePrice(inv.purchase_price + 150000);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                >
                  {availableInventory.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.inventory_code} — {inv.device_title} (Modal: {formatRupiah(inv.purchase_price)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Harga Jual (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={10000}
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-400 font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Biaya Tambahan (Ongkir/Part)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={additionalCosts}
                    onChange={(e) => setAdditionalCosts(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-rose-400 font-mono font-bold"
                  />
                </div>
              </div>

              {/* PROFIT PREVIEW BOX */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Harga Beli Modal:</span>
                  <span className="font-mono">{formatRupiah(purchasePrice)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Laba Kotor (Jual - Beli):</span>
                  <span className="font-mono text-white font-semibold">{formatRupiah(grossProfit)}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-800 font-bold">
                  <span className="text-cyan-400">Estimasi Laba Bersih:</span>
                  <span className="font-mono text-cyan-400 text-sm">{formatRupiah(netProfit)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Pembeli *</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Contoh: Teknisi Yudi / Counter Roxy"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">No. Kontak Pembeli</label>
                  <input
                    type="text"
                    value={buyerContact}
                    onChange={(e) => setBuyerContact(e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  Simpan & Terbitkan Resale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
