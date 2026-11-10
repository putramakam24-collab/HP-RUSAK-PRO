import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Smartphone,
  Cpu,
  ShieldCheck,
  HelpCircle,
  Menu,
  X,
  Lock,
  MessageCircle,
  Search
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { cleanWhatsAppNumber } from '../../lib/utils';

interface NavbarProps {
  settings: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({ settings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Cek Harga HP', icon: Search },
    { to: '/grades', label: 'Kategori Grade', icon: ShieldCheck },
    { to: '/ic-directory', label: 'Database IC & eMMC', icon: Cpu },
    { to: '/how-to-sell', label: 'Cara Jual & FAQ', icon: HelpCircle },
  ];

  const waUrl = `https://wa.me/${cleanWhatsAppNumber(settings.phone_whatsapp)}?text=${encodeURIComponent(
    `Halo admin ${settings.store_name}, saya ingin konsultasi penjualan HP rusak.`
  )}`;

  return (
    <header className="bg-slate-950 text-white sticky top-0 z-50 border-b border-slate-800/80 shadow-lg backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* LOGO & BRANDING */}
          <Link to="/" className="flex items-center gap-3 group">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.store_name}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  {settings.store_name}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  PRO
                </span>
              </div>
              <span className="text-xs text-slate-400 font-normal hidden sm:block">
                {settings.tagline}
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 font-semibold shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Admin</span>
            </a>

            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Portal Staff</span>
            </Link>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-emerald-400 bg-slate-900 border border-slate-800 rounded-lg"
              title="Hubungi WhatsApp"
            >
              <MessageCircle className="w-5 h-5 fill-emerald-500" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600/20 text-cyan-400 border border-blue-500/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login Panel Admin & Kasir</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
