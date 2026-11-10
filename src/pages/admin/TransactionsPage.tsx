import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  PlusCircle,
  Search,
  Filter,
  Printer,
  Calendar,
  User,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Transaction, TransactionStatus, SiteSettings } from '../../types';
import { StorageService } from '../../lib/storage';
import { formatRupiah, formatDateTime, buildWhatsAppInvoiceUrl } from '../../lib/utils';

export const TransactionsPage: React.FC<{ settings: SiteSettings }> = ({ settings }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => StorageService.getTransactions());
  const currentUser = StorageService.getCurrentUser();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTx = transactions.filter(t => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.invoice_number.toLowerCase().includes(q) ||
      t.customer_name.toLowerCase().includes(q) ||
      t.customer_whatsapp.includes(q) ||
      t.items.some(i => i.device_name_snapshot.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: TransactionStatus) => {
    StorageService.updateTransactionStatus(id, newStatus, currentUser.full_name);
    setTransactions(StorageService.getTransactions());
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Transaksi Pembelian HP Rusak</h1>
          <p className="text-xs text-slate-400">
            Daftar nota kasir pembelian unit dari pelanggan & counter rekanan.
          </p>
        </div>

        <Link
          to="/admin/transactions/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nota Pembelian Baru</span>
        </Link>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari No. Nota (HRP-2026-...), nama pelanggan, atau tipe HP..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl text-xs py-2 px-3 focus:outline-none"
        >
          <option value="all">Semua Status</option>
          <option value="paid">LUNAS (Paid)</option>
          <option value="draft">Draft</option>
          <option value="pending_check">Menunggu Cek Fisik</option>
          <option value="approved">Disetujui</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </div>

      {/* TRANSACTION LIST TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
              <tr>
                <th className="p-3.5">No. Nota & Waktu</th>
                <th className="p-3.5">Pelanggan</th>
                <th className="p-3.5">Daftar Unit HP</th>
                <th className="p-3.5">Total & Metode</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Kasir</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ada data transaksi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => {
                  const waInvoiceUrl = buildWhatsAppInvoiceUrl(tx, settings);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-cyan-400 text-sm block">
                          {tx.invoice_number}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDateTime(tx.created_at)}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-white">{tx.customer_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {tx.customer_whatsapp}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-1">
                          {tx.items.map((it, idx) => (
                            <div key={idx} className="text-[11px]">
                              <span className="font-semibold text-slate-200">
                                {it.device_name_snapshot}
                              </span>{' '}
                              <span className="text-cyan-400">[{it.grade_snapshot}]</span>
                              <div className="text-[10px] text-slate-400 truncate max-w-xs">
                                {it.condition_description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-mono font-bold text-sm text-emerald-400">
                          {formatRupiah(tx.total_amount)}
                        </div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">
                          {tx.payment_method} {tx.paid_amount < tx.total_amount ? `(DP ${formatRupiah(tx.paid_amount)})` : ''}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <select
                          value={tx.status}
                          onChange={(e) => handleUpdateStatus(tx.id, e.target.value as TransactionStatus)}
                          className={`text-[10px] font-bold uppercase rounded-lg px-2 py-1 border cursor-pointer ${
                            tx.status === 'paid'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : tx.status === 'cancelled'
                              ? 'bg-rose-950 text-rose-400 border-rose-800'
                              : 'bg-amber-950 text-amber-400 border-amber-800'
                          }`}
                        >
                          <option value="draft">Draft</option>
                          <option value="pending_check">Menunggu Cek</option>
                          <option value="approved">Disetujui</option>
                          <option value="paid">Lunas (Paid)</option>
                          <option value="cancelled">Batal</option>
                        </select>
                      </td>

                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {tx.cashier_name}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={waInvoiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-emerald-400 hover:text-white hover:bg-emerald-950 rounded-lg transition"
                            title="Kirim Nota ke WA Pelanggan"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          <Link
                            to={`/admin/transactions/${tx.id}/print`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
