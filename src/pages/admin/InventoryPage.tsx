import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Search,
  Filter,
  TrendingUp,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Wrench,
  X
} from 'lucide-react';
import { InventoryItem, InventoryStatus } from '../../types';
import { StorageService } from '../../lib/storage';
import { formatRupiah, formatDate } from '../../lib/utils';

export const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(() => StorageService.getInventory());
  const currentUser = StorageService.getCurrentUser();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newStatus, setNewStatus] = useState<InventoryStatus>('available');
  const [statusNotes, setStatusNotes] = useState('');

  const statusLabelMap: Record<InventoryStatus, { label: string; badge: string }> = {
    available: { label: 'Tersedia', badge: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
    in_check: { label: 'Pengecekan', badge: 'bg-blue-950 text-blue-400 border-blue-800' },
    repairing: { label: 'Proses Perbaikan', badge: 'bg-purple-950 text-purple-400 border-purple-800' },
    ready_for_sale: { label: 'Siap Dijual', badge: 'bg-cyan-950 text-cyan-400 border-cyan-800' },
    sold: { label: 'Terjual (Resale)', badge: 'bg-slate-900 text-slate-500 border-slate-800' },
    scrapped: { label: 'Kanibal/Bangkai', badge: 'bg-rose-950 text-rose-400 border-rose-800' },
    cancelled: { label: 'Dibatalkan', badge: 'bg-amber-950 text-amber-400 border-amber-800' },
  };

  const filteredInv = inventory.filter(i => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      i.inventory_code.toLowerCase().includes(q) ||
      i.device_title.toLowerCase().includes(q) ||
      i.invoice_number.toLowerCase().includes(q) ||
      i.storage_location.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || i.current_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenStatusModal = (item: InventoryItem) => {
    setEditingItem(item);
    setNewStatus(item.current_status);
    setStatusNotes('');
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    StorageService.updateInventoryStatus(editingItem.id, newStatus, statusNotes, currentUser.full_name);
    setInventory(StorageService.getInventory());
    setEditingItem(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Inventori Stok HP Rusak & Kanibal</h1>
          <p className="text-xs text-slate-400">
            Daftar unit fisik yang dibeli dari pelanggan, lokasi penyimpanan rak, dan status kesiapan resale.
          </p>
        </div>

        <Link
          to="/admin/resales"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition self-start sm:self-auto"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Jual Unit Stok (Resale)</span>
        </Link>
      </div>

      {/* FILTER */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Kode Stok (INV-...), tipe HP, atau lokasi rak..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl text-xs py-2 px-3 focus:outline-none"
        >
          <option value="all">Semua Status Stok</option>
          <option value="available">Tersedia (Available)</option>
          <option value="in_check">Dalam Pengecekan</option>
          <option value="repairing">Sedang Diperbaiki</option>
          <option value="ready_for_sale">Siap Dijual (Ready)</option>
          <option value="sold">Terjual</option>
          <option value="scrapped">Kanibalan Part</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
              <tr>
                <th className="p-3.5">Kode Stok & Tanggal</th>
                <th className="p-3.5">Unit Handphone</th>
                <th className="p-3.5">Grade</th>
                <th className="p-3.5">Harga Beli Modal</th>
                <th className="p-3.5">Lokasi Rak</th>
                <th className="p-3.5">Status Unit</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInv.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-cyan-400 text-sm block">
                      {item.inventory_code}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Masuk: {formatDate(item.entry_date)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Ref: {item.invoice_number}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="font-bold text-white text-sm">{item.device_title}</div>
                    <div className="text-[11px] text-slate-400 italic">
                      {item.condition_notes}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase bg-slate-950 border border-slate-800 text-cyan-300">
                      {item.grade_name}
                    </span>
                  </td>

                  <td className="p-3.5 font-bold font-mono text-emerald-400 text-sm">
                    {formatRupiah(item.purchase_price)}
                  </td>

                  <td className="p-3.5 text-slate-300">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.storage_location || 'Rak Utama'}</span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${statusLabelMap[item.current_status]?.badge}`}>
                      {statusLabelMap[item.current_status]?.label}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleOpenStatusModal(item)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Ubah Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL UPDATE INVENTORY STATUS */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">
                  {editingItem.inventory_code}
                </span>
                <h3 className="font-bold text-white text-base">
                  {editingItem.device_title}
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status Baru *</label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="available">Tersedia (Available)</option>
                  <option value="in_check">Dalam Pengecekan</option>
                  <option value="repairing">Sedang Diperbaiki (Servis)</option>
                  <option value="ready_for_sale">Siap Dijual (Ready for Sale)</option>
                  <option value="scrapped">Kanibalan Part / Bangkai</option>
                  <option value="sold">Terjual</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan Perpindahan Status</label>
                <textarea
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Contoh: Sudah dites swap LCD normal, dipindah ke rak siap jual B2..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
                >
                  Simpan Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
