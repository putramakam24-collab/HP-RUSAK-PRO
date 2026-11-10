import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Clock,
  User,
  ShieldAlert,
  Database
} from 'lucide-react';
import { StorageService } from '../../lib/storage';
import { formatDateTime } from '../../lib/utils';
import { AuditLog } from '../../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(l => {
    const q = search.toLowerCase();
    return (
      !q ||
      l.user_name.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.table_name.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.record_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Audit Logs & Jejak Aktivitas</h1>
        <p className="text-xs text-slate-400">
          Catatan kronologis perubahan harga, transaksi, penerbitan nota, dan aktivitas staff di sistem.
        </p>
      </div>

      <div className="relative bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <Search className="w-4 h-4 text-slate-400 absolute left-7 top-7" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari aksi (CREATE_TRANSACTION, UPDATE_PRICE), nama user, atau no. nota..."
          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
              <tr>
                <th className="p-3.5">Waktu Kejadian</th>
                <th className="p-3.5">Pengguna & Role</th>
                <th className="p-3.5">Aksi Sistem</th>
                <th className="p-3.5">Tabel Target</th>
                <th className="p-3.5">ID Rekaman</th>
                <th className="p-3.5">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="p-3.5 font-sans">
                    <span className="font-bold text-white block">{log.user_name}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{log.user_role}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-950 border border-slate-800 text-cyan-400">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">
                    {log.table_name}
                  </td>
                  <td className="p-3.5 text-slate-400 font-bold">
                    {log.record_id || '-'}
                  </td>
                  <td className="p-3.5 font-sans text-slate-300 text-xs max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
