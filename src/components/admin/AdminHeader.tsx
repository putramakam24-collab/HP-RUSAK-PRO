import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  User,
  LogOut,
  ShieldCheck,
  Database,
  Calendar
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { StorageService } from '../../lib/storage';
import { isSupabaseConfigured } from '../../lib/supabase';

interface HeaderProps {
  currentUser: UserProfile;
  onToggleSidebar: () => void;
  onUserChanged: (user: UserProfile) => void;
}

export const AdminHeader: React.FC<HeaderProps> = ({
  currentUser,
  onToggleSidebar,
  onUserChanged
}) => {
  const navigate = useNavigate();
  const allUsers = StorageService.getUsers();
  const isSupabaseLive = isSupabaseConfigured();

  const handleSwitchUser = (userId: string) => {
    const selected = allUsers.find(u => u.id === userId);
    if (selected) {
      StorageService.setCurrentUser(selected);
      onUserChanged(selected);
    }
  };

  const handleLogout = () => {
    navigate('/admin/login');
  };

  const roleLabelMap: Record<UserRole, { label: string; badge: string }> = {
    super_admin: { label: 'Super Admin', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    admin: { label: 'Admin Teknisi', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    cashier: { label: 'Kasir', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* LEFT: HAMBURGER & TITLE */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {new Intl.DateTimeFormat('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }).format(new Date())}
            </span>
          </div>

          {/* DATABASE STATUS BADGE */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-slate-950">
            <Database className={`w-3 h-3 ${isSupabaseLive ? 'text-emerald-400' : 'text-cyan-400'}`} />
            <span className={isSupabaseLive ? 'text-emerald-400' : 'text-slate-300'}>
              {isSupabaseLive ? 'Supabase Connected' : 'Engine: Local Storage Active'}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: USER PROFILE & ROLE SWITCHER */}
      <div className="flex items-center gap-3">
        {/* FAST ROLE SWITCHER (For Testing RLS and Roles) */}
        <div className="hidden md:flex items-center gap-1.5 text-xs bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 text-[11px]">Mode Role:</span>
          <select
            value={currentUser.id}
            onChange={(e) => handleSwitchUser(e.target.value)}
            className="bg-transparent text-white font-semibold text-xs border-none focus:ring-0 cursor-pointer pr-1"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                {u.full_name} ({roleLabelMap[u.role].label})
              </option>
            ))}
          </select>
        </div>

        {/* USER PROFILE INFO */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-tight">
              {currentUser.full_name}
            </span>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border w-fit mt-0.5 ${
                roleLabelMap[currentUser.role].badge
              }`}
            >
              {roleLabelMap[currentUser.role].label}
            </span>
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            title="Keluar"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
