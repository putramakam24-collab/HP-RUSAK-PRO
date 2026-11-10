import React, { useState } from 'react';
import {
  Settings,
  Save,
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  Printer,
  CreditCard,
  Globe,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { StorageService } from '../../lib/storage';

export const StoreSettingsPage: React.FC<{ settings: SiteSettings; onUpdateSettings: (s: SiteSettings) => void }> = ({
  settings,
  onUpdateSettings
}) => {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const currentUser = StorageService.getCurrentUser();

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(form, currentUser.full_name);
    onUpdateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (confirm('Kembalikan semua data sistem ke kondisi bawaan pabrik (Default)? Seluruh transaksi lokal akan direset.')) {
      StorageService.resetToDefaultData(currentUser.full_name);
      window.location.reload();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Pengaturan Toko & Branding</h1>
          <p className="text-xs text-slate-400">
            Sesuaikan identitas toko, nomor WhatsApp konsultasi, footer nota, dan rekening bank.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold transition self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Database ke Default</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Pengaturan berhasil disimpan dan langsung diterapkan ke seluruh website!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* IDENTITAS TOKO */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Store className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-white text-sm">Profil & Identitas Toko</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nama Toko *</label>
              <input
                type="text"
                required
                value={form.store_name}
                onChange={(e) => handleChange('store_name', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tagline Toko</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">URL Logo Toko (Opsional)</label>
              <input
                type="text"
                value={form.logo_url || ''}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="https://.../logo.png"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Jam Operasional Toko</label>
              <input
                type="text"
                value={form.operating_hours}
                onChange={(e) => handleChange('operating_hours', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* KONTAK & ALAMAT */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Phone className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-white text-sm">Kontak & Lokasi Workshop</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Nomor WhatsApp Toko (Dipakai Otomatis di Tombol Web) *
              </label>
              <input
                type="text"
                required
                value={form.phone_whatsapp}
                onChange={(e) => handleChange('phone_whatsapp', e.target.value)}
                placeholder="Contoh: 6281298765432"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Gunakan format angka tanpa spasi/strip, diawali 62 atau 08.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Alamat Email Toko</label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Alamat Workshop / Toko Fisik</label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* PENGATURAN NOTA THERMAL & REKENING */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Printer className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-white text-sm">Konfigurasi Nota Cetak & Pembayaran</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ukuran Cetak Nota Bawaan</label>
              <select
                value={form.default_thermal_size}
                onChange={(e: any) => handleChange('default_thermal_size', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
              >
                <option value="58mm">Printer Thermal 58mm (Kecil)</option>
                <option value="80mm">Printer Thermal 80mm (Standar)</option>
                <option value="a4">Kertas HVS / PDF A4</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Catatan Kaki (Footer) Nota</label>
              <input
                type="text"
                value={form.receipt_footer_note}
                onChange={(e) => handleChange('receipt_footer_note', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nama Bank Pembayaran Toko</label>
              <input
                type="text"
                value={form.bank_name || ''}
                onChange={(e) => handleChange('bank_name', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nomor Rekening & Atas Nama</label>
              <input
                type="text"
                value={form.bank_account_number || ''}
                onChange={(e) => handleChange('bank_account_number', e.target.value)}
                placeholder="Contoh: 8830192844 a.n. CV TEKNIK"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Seluruh Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
