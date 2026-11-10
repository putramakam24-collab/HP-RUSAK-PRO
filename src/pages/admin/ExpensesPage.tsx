import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  User,
  Download,
  X
} from 'lucide-react';
import { OperationalExpense } from '../../types';
import { StorageService } from '../../lib/storage';
import { formatRupiah, formatDate, exportToExcel } from '../../lib/utils';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<OperationalExpense[]>(() => StorageService.getExpenses());
  const currentUser = StorageService.getCurrentUser();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Alat & Perlengkapan Servis');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(100000);

  const categories = [
    'Sewa Tempat',
    'Listrik & Air',
    'Internet',
    'Gaji Karyawan',
    'Transportasi & BBM',
    'Ongkos Kirim',
    'Alat & Perlengkapan Servis',
    'Konsumsi',
    'Biaya Lainnya'
  ];

  const filteredExpenses = expenses.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
    const matchCat = selectedCategory === 'all' || e.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const totalFiltered = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    const newExp: OperationalExpense = {
      id: `exp-${Date.now()}`,
      date,
      category,
      description: description.trim(),
      amount,
      recorded_by_name: currentUser.full_name,
      created_at: new Date().toISOString()
    };

    StorageService.addExpense(newExp, currentUser.full_name);
    setExpenses(StorageService.getExpenses());
    setIsModalOpen(false);
    setDescription('');
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Hapus pencatatan pengeluaran ini?')) {
      StorageService.deleteExpense(id, currentUser.full_name);
      setExpenses(StorageService.getExpenses());
    }
  };

  const handleExportExcel = () => {
    const rows = filteredExpenses.map(e => ({
      'Tanggal': e.date,
      'Kategori': e.category,
      'Keterangan': e.description,
      'Nominal (Rp)': e.amount,
      'Dicatat Oleh': e.recorded_by_name
    }));
    exportToExcel(rows, `Pengeluaran_Operasional_${new Date().toISOString().split('T')[0]}`, 'Pengeluaran');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Pengeluaran Operasional</h1>
          <p className="text-xs text-slate-400">
            Catat biaya workshop, pembelian alat servis, listrik, transportasi pengambilan unit, dan sewa tempat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* FILTER & TOTAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 items-center">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari keterangan pengeluaran..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl text-xs py-2 px-3 focus:outline-none"
        >
          <option value="all">Semua Kategori ({categories.length})</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="text-right sm:pr-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Biaya Filter:</span>
          <span className="text-xl font-black text-rose-400 font-mono">
            {formatRupiah(totalFiltered)}
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
              <tr>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Keterangan / Rincian</th>
                <th className="p-3.5">Nominal (Rp)</th>
                <th className="p-3.5">Petugas Pencatat</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 text-slate-300">
                    {formatDate(e.date)}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-950 border border-slate-800 text-slate-200">
                      {e.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-white font-medium">
                    {e.description}
                  </td>
                  <td className="p-3.5 font-bold font-mono text-rose-400 text-sm">
                    {formatRupiah(e.amount)}
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px]">
                    {e.recorded_by_name}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleDeleteExpense(e.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ADD EXPENSE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                Tambah Catatan Pengeluaran
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nominal Biaya (Rp) *</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={5000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-rose-400 font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Keterangan / Rincian Pengeluaran *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Beli timah gulung 0.3mm + mata solder T12 di Glodok..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
