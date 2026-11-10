import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Smartphone,
  ShieldCheck,
  User,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { StorageService } from '../../lib/storage';
import { SiteSettings, UserProfile } from '../../types';

export const AdminLoginPage: React.FC<{ settings: SiteSettings }> = ({ settings }) => {
  const navigate = useNavigate();
  const users = StorageService.getUsers();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (matched && matched.is_active) {
      StorageService.setCurrentUser(matched);
      StorageService.addAuditLog(matched.full_name, matched.role, 'LOGIN', 'auth', matched.id, 'Berhasil login ke sistem');
      navigate('/admin');
    } else {
      setErrorMsg('Email atau password tidak sesuai, atau akun dinonaktifkan.');
    }
  };

  const handleQuickLogin = (user: UserProfile) => {
    StorageService.setCurrentUser(user);
    StorageService.addAuditLog(user.full_name, user.role, 'LOGIN_QUICK', 'auth', user.id, `Login cepat sebagai ${user.role}`);
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 mx-auto shadow-xl flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Masuk ke Portal {settings.store_name}
        </h2>
        <p className="text-xs text-slate-400">
          Sistem Terpadu Pembelian, Kasir Thermal, & Inventori HP Rusak
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 py-8 px-6 sm:px-8 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alamat Email Staff
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@hprusakpro.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk Sekarang</span>
            </button>
          </form>

          {/* QUICK DEMO LOGIN BUTTONS */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pintasan Akses Cepat (Uji Role):</span>
            </div>

            <div className="space-y-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800/80 rounded-xl text-left transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {u.full_name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {u.role === 'super_admin' ? 'Super Admin (Akses Penuh)' : u.role === 'admin' ? 'Admin Teknisi (Katalog & Laporan)' : 'Kasir Toko (Input Transaksi & Cetak)'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs font-semibold text-slate-400 hover:text-cyan-400 transition"
          >
            ← Kembali ke Website Publik
          </Link>
        </div>
      </div>
    </div>
  );
};
