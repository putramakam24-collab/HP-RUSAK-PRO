import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Save,
  Check
} from 'lucide-react';
import { IcChip } from '../../types';
import { StorageService } from '../../lib/storage';

export const IcManagementPage: React.FC = () => {
  const [chips, setChips] = useState<IcChip[]>(() => StorageService.getIcChips());
  const currentUser = StorageService.getCurrentUser();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChip, setEditingChip] = useState<IcChip | null>(null);

  const [chipCode, setChipCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('eMCP / eMMC');
  const [brand, setBrand] = useState('Samsung');
  const [capacity, setCapacity] = useState('64GB');
  const [isEmmcUfs, setIsEmmcUfs] = useState(true);
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [compatibleInput, setCompatibleInput] = useState('');
  const [isVerified, setIsVerified] = useState(true);

  const filteredChips = chips.filter(c => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.chip_code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.brand && c.brand.toLowerCase().includes(q)) ||
      c.compatible_models.some(m => m.toLowerCase().includes(q));

    const matchType = selectedType === 'all' || c.type === selectedType;
    return matchSearch && matchType;
  });

  const handleOpenModal = (chip?: IcChip) => {
    if (chip) {
      setEditingChip(chip);
      setChipCode(chip.chip_code);
      setName(chip.name);
      setType(chip.type);
      setBrand(chip.brand || '');
      setCapacity(chip.capacity || '');
      setIsEmmcUfs(chip.is_emmc_ufs);
      setTechnicianNotes(chip.technician_notes);
      setCompatibleInput(chip.compatible_models.join(', '));
      setIsVerified(chip.is_verified);
    } else {
      setEditingChip(null);
      setChipCode('');
      setName('');
      setType('eMCP / eMMC');
      setBrand('Samsung');
      setCapacity('64GB');
      setIsEmmcUfs(true);
      setTechnicianNotes('');
      setCompatibleInput('');
      setIsVerified(true);
    }
    setIsModalOpen(true);
  };

  const handleSaveChip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chipCode.trim() || !name.trim()) return;

    const compatArray = compatibleInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const newChip: IcChip = {
      id: editingChip ? editingChip.id : `ic-${Date.now()}`,
      chip_code: chipCode.trim().toUpperCase(),
      name: name.trim(),
      type,
      brand: brand.trim(),
      capacity: capacity.trim(),
      is_emmc_ufs: isEmmcUfs,
      technician_notes: technicianNotes.trim(),
      compatible_models: compatArray,
      is_verified: isVerified,
      created_at: editingChip ? editingChip.created_at : new Date().toISOString()
    };

    StorageService.saveIcChip(newChip, currentUser.full_name);
    setChips(StorageService.getIcChips());
    setIsModalOpen(false);
  };

  const handleDeleteChip = (id: string) => {
    if (confirm('Hapus data IC ini dari database?')) {
      StorageService.deleteIcChip(id, currentUser.full_name);
      setChips(StorageService.getIcChips());
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Database IC, eMMC & UFS</h1>
          <p className="text-xs text-slate-400">
            Katalog kode IC motherboard, chipset power, dan kompatibilitas kanibal part teknisi.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kode IC</span>
        </button>
      </div>

      {/* FILTER */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode IC (KMQE..., PM8150...), nama, tipe HP kompatibel..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl text-xs py-2 px-3 focus:outline-none"
        >
          <option value="all">Semua Tipe IC</option>
          <option value="eMCP / eMMC">eMCP / eMMC</option>
          <option value="UFS 2.1 / 3.1">UFS 2.1 / 3.1</option>
          <option value="Power IC / Charger IC">Power IC / Charger IC</option>
          <option value="CPU / Processor">CPU / Processor</option>
          <option value="RF / Sinyal">RF / Sinyal</option>
        </select>
      </div>

      {/* IC CHIPS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
              <tr>
                <th className="p-3.5">Kode IC</th>
                <th className="p-3.5">Nama & Jenis</th>
                <th className="p-3.5">Merek</th>
                <th className="p-3.5">Kapasitas</th>
                <th className="p-3.5">Model Kompatibel</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredChips.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono font-black text-cyan-400 text-sm">
                    {c.chip_code}
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-white block">{c.name}</span>
                    <span className="text-[10px] text-slate-400">{c.type}</span>
                  </td>
                  <td className="p-3.5 text-slate-300">
                    {c.brand || '-'}
                  </td>
                  <td className="p-3.5 font-mono text-cyan-300 font-semibold">
                    {c.capacity || '-'}
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {c.compatible_models.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5">
                    {c.is_verified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Unverified</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(c)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteChip(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT / CREATE IC */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingChip ? 'Edit Kode IC' : 'Tambah Kode IC Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChip} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kode IC Part *</label>
                  <input
                    type="text"
                    required
                    value={chipCode}
                    onChange={(e) => setChipCode(e.target.value)}
                    placeholder="Contoh: KMQE60013M-B318"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Merek Komponen</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Samsung / Qualcomm / SK Hynix"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama / Fungsi IC *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Qualcomm Secondary PMIC Fast Charge"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jenis / Kategori</label>
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="eMCP / UFS / Power IC / CPU"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kapasitas (Jika Memori)</label>
                  <input
                    type="text"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Contoh: 128GB / 256GB"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Model HP Kompatibel (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={compatibleInput}
                  onChange={(e) => setCompatibleInput(e.target.value)}
                  placeholder="Redmi Note 10 Pro, Poco X3 NFC, Realme 6"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan Teknisi / Tips Pemasangan</label>
                <textarea
                  rows={3}
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  placeholder="Suhu blower yang disarankan, kompatibilitas CID, kendala umum..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkVerified"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600"
                />
                <label htmlFor="chkVerified" className="text-slate-300 font-medium cursor-pointer">
                  Tandai sebagai data terverifikasi (Verified)
                </label>
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
                  Simpan IC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
