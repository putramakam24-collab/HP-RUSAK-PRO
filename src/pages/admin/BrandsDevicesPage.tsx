import React, { useState } from 'react';
import {
  Smartphone,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  XCircle,
  Layers,
  Save,
  X
} from 'lucide-react';
import { Brand, Device, Variant } from '../../types';
import { StorageService } from '../../lib/storage';

export const BrandsDevicesPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>(() => StorageService.getBrands());
  const [devices, setDevices] = useState<Device[]>(() => StorageService.getDevices());
  const [variants, setVariants] = useState<Variant[]>(() => StorageService.getVariants());
  const currentUser = StorageService.getCurrentUser();

  const [search, setSearch] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('all');

  // Modal State for Device
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [devBrandId, setDevBrandId] = useState('');
  const [devName, setDevName] = useState('');
  const [devModelCode, setDevModelCode] = useState('');
  const [devYear, setDevYear] = useState<number>(2022);
  const [devVariantsInput, setDevVariantsInput] = useState('4GB/64GB, 6GB/128GB');

  // Modal State for Brand
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState('');

  // Filtered devices
  const filteredDevices = devices.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      (d.model_code && d.model_code.toLowerCase().includes(q)) ||
      (d.brand_name && d.brand_name.toLowerCase().includes(q));

    const matchBrand = selectedBrandFilter === 'all' || d.brand_id === selectedBrandFilter;
    return matchSearch && matchBrand;
  });

  const handleOpenDeviceModal = (dev?: Device) => {
    if (dev) {
      setEditingDevice(dev);
      setDevBrandId(dev.brand_id);
      setDevName(dev.name);
      setDevModelCode(dev.model_code || '');
      setDevYear(dev.release_year || 2022);
      const devVars = variants.filter(v => v.device_id === dev.id);
      setDevVariantsInput(devVars.map(v => `${v.ram}/${v.rom}`).join(', '));
    } else {
      setEditingDevice(null);
      setDevBrandId(brands[0]?.id || '');
      setDevName('');
      setDevModelCode('');
      setDevYear(2023);
      setDevVariantsInput('4GB/64GB, 6GB/128GB');
    }
    setIsDeviceModalOpen(true);
  };

  const handleSaveDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devName || !devBrandId) return;

    const brand = brands.find(b => b.id === devBrandId);
    const newDevice: Device = {
      id: editingDevice ? editingDevice.id : `dev-${Date.now()}`,
      brand_id: devBrandId,
      brand_name: brand?.name || 'Unknown',
      name: devName,
      model_code: devModelCode,
      release_year: devYear,
      is_active: true,
      created_at: editingDevice ? editingDevice.created_at : new Date().toISOString()
    };

    StorageService.saveDevice(newDevice, currentUser.full_name);

    // Save variants
    if (devVariantsInput) {
      const parts = devVariantsInput.split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach(p => {
        const [ram, rom] = p.split('/');
        if (ram && rom) {
          const newVariant: Variant = {
            id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            device_id: newDevice.id,
            ram: ram.trim(),
            rom: rom.trim(),
            is_active: true,
            created_at: new Date().toISOString()
          };
          StorageService.saveVariant(newVariant, currentUser.full_name);
        }
      });
    }

    setDevices(StorageService.getDevices());
    setVariants(StorageService.getVariants());
    setIsDeviceModalOpen(false);
  };

  const handleDeleteDevice = (id: string) => {
    if (confirm('Hapus tipe HP ini beserta variannya?')) {
      StorageService.deleteDevice(id, currentUser.full_name);
      setDevices(StorageService.getDevices());
    }
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    const newBrand: Brand = {
      id: editingBrand ? editingBrand.id : `b-${Date.now()}`,
      name: brandName.trim(),
      slug: brandName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      is_active: true,
      created_at: editingBrand ? editingBrand.created_at : new Date().toISOString()
    };

    StorageService.saveBrand(newBrand, currentUser.full_name);
    setBrands(StorageService.getBrands());
    setIsBrandModalOpen(false);
    setBrandName('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Manajemen Merek & Tipe HP</h1>
          <p className="text-xs text-slate-400">
            Kelola direktori model smartphone, kode model, dan variasi RAM/ROM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingBrand(null);
              setBrandName('');
              setIsBrandModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            + Merek Baru
          </button>
          <button
            onClick={() => handleOpenDeviceModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tipe HP</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tipe HP atau kode model..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={selectedBrandFilter}
          onChange={(e) => setSelectedBrandFilter(e.target.value)}
          className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl text-xs py-2 px-3 focus:outline-none font-medium"
        >
          <option value="all">Semua Merek ({brands.length})</option>
          {brands.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* DEVICES TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
              <tr>
                <th className="p-3.5">Merek</th>
                <th className="p-3.5">Nama Tipe HP</th>
                <th className="p-3.5">Kode Model</th>
                <th className="p-3.5">Tahun</th>
                <th className="p-3.5">Varian Memori</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredDevices.map((d) => {
                const devVars = variants.filter(v => v.device_id === d.id);
                return (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-cyan-400 uppercase tracking-wider">
                      {d.brand_name}
                    </td>
                    <td className="p-3.5 font-bold text-white text-sm">
                      {d.name}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      {d.model_code || '-'}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {d.release_year || '-'}
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {devVars.map(v => (
                          <span key={v.id} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                            {v.ram}/{v.rom}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDeviceModal(d)}
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDevice(d.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DEVICE */}
      {isDeviceModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingDevice ? 'Edit Tipe HP' : 'Tambah Tipe HP Baru'}
              </h3>
              <button
                onClick={() => setIsDeviceModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDevice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Merek</label>
                <select
                  value={devBrandId}
                  onChange={(e) => setDevBrandId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Tipe HP *</label>
                <input
                  type="text"
                  required
                  value={devName}
                  onChange={(e) => setDevName(e.target.value)}
                  placeholder="Contoh: Poco X3 Pro, Galaxy A51"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kode Model</label>
                  <input
                    type="text"
                    value={devModelCode}
                    onChange={(e) => setDevModelCode(e.target.value)}
                    placeholder="M2012K11AG"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tahun Rilis</label>
                  <input
                    type="number"
                    value={devYear}
                    onChange={(e) => setDevYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Varian RAM/ROM (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={devVariantsInput}
                  onChange={(e) => setDevVariantsInput(e.target.value)}
                  placeholder="4GB/64GB, 6GB/128GB, 8GB/256GB"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDeviceModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
                >
                  Simpan Tipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BRAND */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Tambah Merek Baru</h3>
              <button
                onClick={() => setIsBrandModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Merek *</label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Contoh: Infinix, Nothing Phone"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Simpan Merek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
