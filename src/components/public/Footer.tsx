import React from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  MapPin,
  Clock,
  Phone,
  Mail,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { cleanWhatsAppNumber } from '../../lib/utils';

export const Footer: React.FC<{ settings: SiteSettings }> = ({ settings }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      {/* UPPER FOOTER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* COL 1: BRANDING */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                {settings.store_name}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {settings.tagline}. Pusat pembelian dan penerimaan handphone rusak, kanibalan motherboard, serta database komponen teknisi terlengkap di Indonesia.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 p-2.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Terbuka untuk kiriman ekspedisi seluruh Indonesia</span>
            </div>
          </div>

          {/* COL 2: NAVIGASI CEPAT */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-4">
              Navigasi Layanan
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  Cek Harga HP Rusak
                </Link>
              </li>
              <li>
                <Link to="/grades" className="hover:text-cyan-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  Standarisasi Grade (A+++ s/d AB)
                </Link>
              </li>
              <li>
                <Link to="/ic-directory" className="hover:text-cyan-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  Direktori IC, eMMC & UFS
                </Link>
              </li>
              <li>
                <Link to="/how-to-sell" className="hover:text-cyan-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  Panduan Menjual & FAQ
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-cyan-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  Login Kasir & Administrator
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 3: KONTAK & JAM OPERASIONAL */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-4">
              Kontak & Operasional
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{settings.operating_hours}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <a
                  href={`https://wa.me/${cleanWhatsAppNumber(settings.phone_whatsapp)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition font-mono"
                >
                  +{cleanWhatsAppNumber(settings.phone_whatsapp)}
                </a>
              </li>
              {settings.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white transition">
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* COL 4: DISCLAIMER TRANSPARANSI */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Transparansi Harga</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Nominal yang ditampilkan di portal ini merupakan estimasi awal berdasarkan data pasar teknisi. Nilai final ditentukan setelah unit diperiksa fisik oleh tim teknisi kami (kebersihan PCB, riwayat blower, kelengkapan part).
            </p>
          </div>
        </div>
      </div>

      {/* LOWER FOOTER */}
      <div className="bg-black/60 border-t border-slate-900 py-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
          <p>© {new Date().getFullYear()} {settings.store_name}. Hak Cipta Dilindungi.</p>
          <p className="text-[11px]">Sistem Manajemen Pembelian & Inventori HP Rusak Profesional</p>
        </div>
      </div>
    </footer>
  );
};
