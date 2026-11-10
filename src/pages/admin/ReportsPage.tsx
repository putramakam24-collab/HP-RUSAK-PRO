import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  Filter,
  PieChart as PieIcon,
  Smartphone,
  Layers,
  ArrowUpRight,
  Receipt,
  Boxes
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { StorageService } from '../../lib/storage';
import { formatRupiah, exportToExcel } from '../../lib/utils';

export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  const transactions = StorageService.getTransactions();
  const inventory = StorageService.getInventory();
  const resales = StorageService.getResales();
  const expenses = StorageService.getExpenses();

  // Metrics Calculations
  const totalBuyAmount = transactions.reduce((acc, t) => acc + (t.status !== 'cancelled' ? t.total_amount : 0), 0);
  const totalSellAmount = resales.reduce((acc, r) => acc + r.sale_price, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalGrossProfit = resales.reduce((acc, r) => acc + r.gross_profit, 0);
  const totalNetProfit = resales.reduce((acc, r) => acc + r.net_profit, 0);
  const netBusinessProfit = totalNetProfit - totalExpenses;

  // Analysis: HP Paling Sering Dibeli
  const deviceBuyCountMap = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach(t => {
      t.items.forEach(it => {
        const name = it.device_name_snapshot;
        counts[name] = (counts[name] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [transactions]);

  // Analysis: Merek Paling Banyak Masuk
  const brandDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach(t => {
      t.items.forEach(it => {
        const b = it.brand_snapshot || 'Lainnya';
        counts[b] = (counts[b] || 0) + 1;
      });
    });
    const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  }, [transactions]);

  // Average calculations
  const totalUnitsBought = transactions.reduce((acc, t) => acc + t.items.length, 0);
  const avgBuyPrice = totalUnitsBought > 0 ? totalBuyAmount / totalUnitsBought : 0;
  const avgSellPrice = resales.length > 0 ? totalSellAmount / resales.length : 0;

  // Old unsold stock
  const unsoldOldStock = inventory.filter(i => i.current_status !== 'sold' && i.current_status !== 'cancelled');

  const handleExportReport = () => {
    const summaryData = [
      { 'Indikator': 'Total Uang Pembelian Unit HP', 'Nilai': totalBuyAmount },
      { 'Indikator': 'Total Penjualan Kembali (Resale)', 'Nilai': totalSellAmount },
      { 'Indikator': 'Total Pengeluaran Operasional', 'Nilai': totalExpenses },
      { 'Indikator': 'Laba Bersih Margin Penjualan', 'Nilai': totalNetProfit },
      { 'Indikator': 'Laba Bersih Akhir Bisnis', 'Nilai': netBusinessProfit },
      { 'Indikator': 'Rata-rata Harga Beli HP Rusak', 'Nilai': avgBuyPrice },
      { 'Indikator': 'Rata-rata Harga Jual Resale', 'Nilai': avgSellPrice },
    ];
    exportToExcel(summaryData, `Laporan_Keuangan_HP_RUSAK_PRO_${period}`, 'Ringkasan');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Laporan Keuangan & Analisis Bisnis</h1>
          <p className="text-xs text-slate-400">
            Kalkulasi performa bisnis, laba bersih, rata-rata modal, dan analisis rotasi unit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex text-xs">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${period === 'daily' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Harian
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${period === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setPeriod('yearly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${period === 'yearly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Tahunan
            </button>
          </div>

          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* CORE FINANCIAL INDICATOR CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs uppercase font-bold text-blue-400 block">Total Uang Pembelian</span>
          <div className="text-2xl font-black text-white font-mono">{formatRupiah(totalBuyAmount)}</div>
          <p className="text-[11px] text-slate-400">Total modal untuk {totalUnitsBought} unit HP masuk</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs uppercase font-bold text-emerald-400 block">Total Penjualan Resale</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{formatRupiah(totalSellAmount)}</div>
          <p className="text-[11px] text-slate-400">Pemasukan kotor dari {resales.length} unit terjual</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs uppercase font-bold text-rose-400 block">Total Pengeluaran</span>
          <div className="text-2xl font-black text-rose-400 font-mono">{formatRupiah(totalExpenses)}</div>
          <p className="text-[11px] text-slate-400">Biaya sewa, part kanibal, listrik, gaji</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs uppercase font-bold text-cyan-400 block">Laba Bersih Usaha</span>
          <div className={`text-2xl font-black font-mono ${netBusinessProfit >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
            {formatRupiah(netBusinessProfit)}
          </div>
          <p className="text-[11px] text-slate-400">Margin resale dikurangi beban operasional</p>
        </div>
      </div>

      {/* ANALYTICS SECTION: CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PIE: DISTRIBUSI MEREK */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">Distribusi Merek HP Terbanyak Masuk</h3>
            <p className="text-xs text-slate-400">Persentase unit berdasarkan brand yang dijual pelanggan</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {brandDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR: HP PALING SERING DIBELI */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">Model HP Paling Banyak Masuk</h3>
            <p className="text-xs text-slate-400">5 seri smartphone teratas yang paling sering dibeli</p>
          </div>

          <div className="space-y-3 pt-2">
            {deviceBuyCountMap.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">{item.name}</span>
                  <span className="text-cyan-400 font-bold">{item.count} Unit</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, (item.count / 5) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DETAILED BUSINESS BENCHMARKS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
          Parameter Rata-Rata & Analisa Stok
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Rata-Rata Harga Beli / Unit</span>
            <div className="text-xl font-bold text-white font-mono">{formatRupiah(avgBuyPrice)}</div>
            <p className="text-[10px] text-slate-500">Standar modal masuk per HP</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Rata-Rata Harga Jual / Unit</span>
            <div className="text-xl font-bold text-emerald-400 font-mono">{formatRupiah(avgSellPrice)}</div>
            <p className="text-[10px] text-slate-500">Harga keluar saat resale</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Stok Menunggu Terjual</span>
            <div className="text-xl font-bold text-amber-400 font-mono">{unsoldOldStock.length} Unit</div>
            <p className="text-[10px] text-slate-500">Tersedia di rak penyimpanan</p>
          </div>
        </div>
      </div>
    </div>
  );
};
