import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Smartphone,
  Tag,
  ShieldCheck,
  Cpu,
  FileSpreadsheet,
  Receipt,
  Boxes,
  TrendingUp,
  DollarSign,
  BarChart3,
  Settings,
  Users,
  History,
  Database,
  ExternalLink,
  PlusCircle,
  X
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  role: UserRole;
  storeName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
  highlight?: boolean;
  minRole?: UserRole | string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC<SidebarProps> = ({
  role,
  storeName,
  isOpen,
  onClose
}) => {
  // Navigation structure categorized
  const navSections: NavSection[] = [
    {
      title: 'UTAMA',
      items: [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/admin/transactions', label: 'Transaksi Beli HP', icon: Receipt },
        { to: '/admin/transactions/create', label: 'Nota Baru (Kasir)', icon: PlusCircle, highlight: true },
      ]
    },
    {
      title: 'MASTER DATA TEKNISI',
      items: [
        { to: '/admin/devices', label: 'Merek & Tipe HP', icon: Smartphone, minRole: 'admin' },
        { to: '/admin/prices', label: 'Manajemen Harga', icon: Tag, minRole: 'admin' },
        { to: '/admin/grades', label: 'Kategori Grade', icon: ShieldCheck, minRole: 'admin' },
        { to: '/admin/ic-database', label: 'Database IC & eMMC', icon: Cpu, minRole: 'admin' },
        { to: '/admin/import', label: 'Impor Excel & Staging', icon: FileSpreadsheet, minRole: 'admin' },
      ]
    },
    {
      title: 'OPERASIONAL & STOK',
      items: [
        { to: '/admin/inventory', label: 'Inventori Stok HP', icon: Boxes },
        { to: '/admin/resales', label: 'Penjualan Kembali', icon: TrendingUp, minRole: 'admin' },
        { to: '/admin/expenses', label: 'Pengeluaran Operasional', icon: DollarSign, minRole: 'admin' },
        { to: '/admin/reports', label: 'Laporan Keuangan', icon: BarChart3, minRole: 'admin' },
      ]
    },
    {
      title: 'SISTEM & KEAMANAN',
      items: [
        { to: '/admin/settings', label: 'Pengaturan Toko', icon: Settings, minRole: 'super_admin' },
        { to: '/admin/users', label: 'Staff & Hak Akses', icon: Users, minRole: 'super_admin' },
        { to: '/admin/audit-logs', label: 'Audit Logs Aktivitas', icon: History, minRole: 'super_admin' },
        { to: '/admin/supabase-migration', label: 'Supabase SQL & RLS', icon: Database, minRole: 'super_admin' },
      ]
    }
  ];

  // Helper check permission
  const hasAccess = (minRole?: string) => {
    if (!minRole) return true;
    if (role === 'super_admin') return true;
    if (role === 'admin' && minRole !== 'super_admin') return true;
    return false;
  };

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* SIDEBAR HEADER */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/60">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-white tracking-tight leading-tight">
                {storeName}
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                Panel Kontrol
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SIDEBAR SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs">
          {navSections.map((section, idx) => {
            const accessibleItems = section.items.filter(item => hasAccess(item.minRole));
            if (accessibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {section.title}
                </div>
                {accessibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white font-bold shadow-sm'
                            : item.highlight
                            ? 'bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-800/40'
                            : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* SIDEBAR FOOTER (LINK KE WEB PUBLIK) */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition"
          >
            <span>Lihat Website Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>
    </>
  );
};
