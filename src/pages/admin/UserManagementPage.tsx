import React, { useState } from 'react';
import {
  Users,
  Plus,
  ShieldCheck,
  UserCheck,
  UserX,
  Edit2,
  Lock,
  Mail,
  User,
  X
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { StorageService } from '../../lib/storage';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(() => StorageService.getUsers());
  const currentUser = StorageService.getCurrentUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('cashier');
  const [isActive, setIsActive] = useState(true);

  const handleOpenModal = (u?: UserProfile) => {
    if (u) {
      setEditingUser(u);
      setFullName(u.full_name);
      setEmail(u.email);
      setRole(u.role);
      setIsActive(u.is_active);
    } else {
      setEditingUser(null);
      setFullName('');
      setEmail('');
      setRole('cashier');
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    if (editingUser) {
      StorageService.updateUser(
        editingUser.id,
        { full_name: fullName.trim(), email: email.trim(), role, is_active: isActive },
        currentUser.full_name
      );
    } else {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        full_name: fullName.trim(),
        email: email.trim(),
        role,
        is_active: isActive,
        created_at: new Date().toISOString()
      };
      StorageService.addUser(newUser, currentUser.full_name);
    }

    setUsers(StorageService.getUsers());
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Manajemen Staff & Hak Akses</h1>
          <p className="text-xs text-slate-400">
            Kelola pengguna panel kontrol: Super Admin, Admin Teknisi, dan Kasir Toko.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Staff Baru</span>
        </button>
      </div>

      {/* ROLE PERMISSION SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">1. Super Admin</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Akses total tanpa batasan: kelola pengguna staff, ubah pengaturan identitas toko, kelola integrasi database Supabase, dan audit log.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">2. Admin Teknisi</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Kelola katalog merek, ubah patokan harga HP rusak, manajemen grade, database IC, modul impor/export Excel, dan laporan laba rugi.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">3. Kasir Toko</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Membuat nota transaksi pembelian, cetak nota thermal 58mm/80mm, kirim nota via WhatsApp pelanggan, dan melihat ketersediaan stok inventori.
          </p>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
              <tr>
                <th className="p-3.5">Nama Staff</th>
                <th className="p-3.5">Alamat Email</th>
                <th className="p-3.5">Peran (Role)</th>
                <th className="p-3.5">Status Akun</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-bold text-white text-sm">
                    {u.full_name}
                  </td>
                  <td className="p-3.5 text-slate-300 font-mono">
                    {u.email}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${
                      u.role === 'super_admin'
                        ? 'bg-purple-950 text-purple-400 border-purple-800'
                        : u.role === 'admin'
                        ? 'bg-blue-950 text-blue-400 border-blue-800'
                        : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {u.is_active ? (
                      <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" /> Aktif
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold text-[11px] flex items-center gap-1">
                        <UserX className="w-3.5 h-3.5" /> Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleOpenModal(u)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Ubah Data
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT / CREATE USER */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingUser ? 'Edit Data Staff' : 'Tambah Staff Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Doni Kurniawan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alamat Email Login *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doni@hprusakpro.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Peran (Hak Akses) *</label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="cashier">Kasir (Input Transaksi & Cetak Nota)</option>
                  <option value="admin">Admin Teknisi (Katalog Harga, IC, Laporan)</option>
                  <option value="super_admin">Super Admin (Akses Penuh)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkUserActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600"
                />
                <label htmlFor="chkUserActive" className="text-slate-300 font-medium cursor-pointer">
                  Akun aktif dapat login ke sistem
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
                  Simpan Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
