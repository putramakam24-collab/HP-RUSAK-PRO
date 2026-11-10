import React, { useState } from 'react';
import {
  Tag,
  Search,
  Edit2,
  History,
  Check,
  X,
  Plus,
  ArrowRight,
  Clock,
  User,
  Filter
} from 'lucide-react';
import { Price, PriceLog, Grade, Brand } from '../../types';
import { StorageService } from '../../lib/storage';
import { formatRupiah, formatDateTime } from '../../lib/utils';

export const PriceManagementPage: React.FC = () => {
  const [prices, setPrices] = useState<Price[]>(() => StorageService.getPrices());
  const [priceLogs, setPriceLogs] = useState<PriceLog[]>(() => StorageService.getPriceLogs());
  const brands: Brand[] = StorageService.getBrands();
  const grades: Grade[] = StorageService.getGrades();
  const currentUser = StorageService.getCurrentUser();

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');

  // Edit Single Price Modal
  const [editingPrice, setEditingPrice] = useState<Price | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<number>(0);
  const [changeReason, setChangeReason] = useState('');

  // History Log Modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Filter prices
  const filteredPrices = prices.filter(p => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (p.device_name && p.device_name.toLowerCase().includes(q)) ||
      (p.brand_name && p.brand_name.toLowerCase().includes(q)) ||
      (p.grade_code && p.grade_code.toLowerCase().includes(q));

    const matchBrand = selectedBrand === 'all' || (p.brand_name && p.brand_name.toLowerCase() === selectedBrand.toLowerCase());
    const matchGrade = selectedGrade === 'all' || (p.grade_code && p.grade_code.toLowerCase() === selectedGrade.toLowerCase());

    return matchSearch && matchBrand && matchGrade;
  });

  const handleOpenEdit = (p: Price) => {
    setEditingPrice(p);
    setNewPriceValue(p.estimated_price);
    setChangeReason('Penyesuaian estimasi pasar berkala');
  };

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrice) return;
    if (newPriceValue < 0) {
      alert('Harga tidak boleh kurang dari 0');
      return;
    }
    if (!changeReason.trim()) {
      alert('Alasan perubahan harga wajib diisi untuk riwayat audit');
      return;
    }

    StorageService.updatePrice(editingPrice.id, newPriceValue, changeReason.trim(), currentUser.full_name);
    setPrices(StorageService.getPrices());
    setPriceLogs(StorageService.getPriceLogs());
    setEditingPrice(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Manajemen Patokan Harga Beli</h1>
          <p className="text-xs text-slate-400">
            Atur estimasi harga online berdasarkan tipe, varian memori, dan grade komponen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>Riwayat Perubahan Harga ({priceLogs.length})</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tipe atau merek..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl text-xs py-2 px-3 focus:outline-none"
        >
          <option value="all">Semua Merek ({brands.length})</option>
          {brands.map(b => (
            <option key={b.id} value={b.name}>{b.name}</option>
          ))}
        </select>

        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl text-xs py-2 px-3 focus:outline-none"
        >
          <option value="all">Semua Grade ({grades.length})</option>
          {grades.map(g => (
            <option key={g.id} value={g.code}>Grade {g.code}</option>
          ))}
        </select>
      </div>

      {/* PRICES TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
              <tr>
                <th className="p-3.5">Merek & Tipe HP</th>
                <th className="p-3.5">Varian Memori</th>
                <th className="p-3.5">Grade</th>
                <th className="p-3.5">Harga Estimasi (Rp)</th>
                <th className="p-3.5">Terakhir Diperbarui</th>
                <th className="p-3.5">Petugas</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPrices.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 block">{p.brand_name}</span>
                    <span className="font-bold text-white text-sm">{p.device_name}</span>
                    {p.model_code && <span className="text-[10px] text-slate-500 font-mono">({p.model_code})</span>}
                  </td>
                  <td className="p-3.5 font-medium text-slate-300">
                    RAM {p.ram} / ROM {p.rom}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase bg-slate-950 border border-slate-800 text-cyan-300">
                      {p.grade_code}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-base text-emerald-400 font-mono">
                    {formatRupiah(p.estimated_price)}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {formatDateTime(p.updated_at)}
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px]">
                    {p.updated_by || 'Sistem'}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                      Ubah Harga
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT PRICE MODAL */}
      {editingPrice && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Ubah Patokan Harga</span>
                <h3 className="font-bold text-white text-base">
                  {editingPrice.device_name} ({editingPrice.ram}/{editingPrice.rom})
                </h3>
              </div>
              <button
                onClick={() => setEditingPrice(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrice} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Harga Lama:</span>
                <span className="text-slate-200 font-bold font-mono text-sm">
                  {formatRupiah(editingPrice.estimated_price)}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Harga Estimasi Baru (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={10000}
                  value={newPriceValue}
                  onChange={(e) => setNewPriceValue(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold text-base focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Alasan Perubahan (Wajib untuk Audit Log) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="Contoh: Kenaikan permintaan pasar sparepart kanibal, penyesuaian harga LCD baru, dsb."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPrice(null)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
                >
                  Simpan & Catat Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRICE CHANGE HISTORY MODAL */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Riwayat Perubahan Harga Resmi</h3>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {priceLogs.length === 0 ? (
                <p className="text-center py-8 text-slate-500">Belum ada riwayat perubahan harga tercatat.</p>
              ) : (
                priceLogs.map((log) => (
                  <div key={log.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">
                        {log.device_title} <span className="text-cyan-400">[{log.grade_code}]</span>
                      </span>
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(log.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 line-through">{formatRupiah(log.old_price)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="font-bold text-emerald-400">{formatRupiah(log.new_price)}</span>
                    </div>

                    <p className="text-slate-300 italic text-[11px]">
                      "{log.reason}"
                    </p>

                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Diubah oleh: {log.changed_by_name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
