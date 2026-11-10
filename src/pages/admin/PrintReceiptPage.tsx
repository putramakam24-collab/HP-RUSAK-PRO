import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Printer,
  ArrowLeft,
  MessageCircle,
  FileText,
  Smartphone,
  CheckCircle,
  Share2
} from 'lucide-react';
import { SiteSettings, Transaction } from '../../types';
import { StorageService } from '../../lib/storage';
import { formatRupiah, formatDateTime, buildWhatsAppInvoiceUrl } from '../../lib/utils';

export const PrintReceiptPage: React.FC<{ settings: SiteSettings }> = ({ settings }) => {
  const { id } = useParams<{ id: string }>();
  const transactions = StorageService.getTransactions();
  const tx = transactions.find(t => t.id === id) || transactions[0];

  const [receiptSize, setReceiptSize] = useState<'58mm' | '80mm' | 'a4'>(
    settings.default_thermal_size || '58mm'
  );

  if (!tx) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Transaksi tidak ditemukan.</p>
        <Link to="/admin/transactions" className="text-cyan-400 text-xs underline mt-2 block">
          Kembali ke Daftar Transaksi
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const waUrl = buildWhatsAppInvoiceUrl(tx, settings);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ACTION BAR (HIDDEN WHEN PRINTING) */}
      <div className="print:hidden max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/transactions"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>Cetak Nota:</span>
              <span className="font-mono text-cyan-400">{tx.invoice_number}</span>
            </h1>
            <p className="text-xs text-slate-400">
              Pilih format cetak thermal kasir atau ukuran A4 resmi toko.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* FORMAT TOGGLE */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex text-xs font-semibold">
            <button
              onClick={() => setReceiptSize('58mm')}
              className={`px-3 py-1.5 rounded-lg transition ${
                receiptSize === '58mm' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Thermal 58mm
            </button>
            <button
              onClick={() => setReceiptSize('80mm')}
              className={`px-3 py-1.5 rounded-lg transition ${
                receiptSize === '80mm' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Thermal 80mm
            </button>
            <button
              onClick={() => setReceiptSize('a4')}
              className={`px-3 py-1.5 rounded-lg transition ${
                receiptSize === 'a4' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Standar A4
            </button>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Kirim WA</span>
          </a>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black rounded-xl transition shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sekarang</span>
          </button>
        </div>
      </div>

      {/* RECEIPT PREVIEW CONTAINER */}
      <div className="flex justify-center print:p-0 print:m-0">
        {receiptSize === '58mm' && (
          <div
            id="printableReceipt"
            className="w-[58mm] bg-white text-black p-3 font-mono text-[10px] leading-tight shadow-2xl rounded-sm print:shadow-none print:w-[58mm] print:p-1"
          >
            <div className="text-center space-y-1 pb-2 border-b border-dashed border-gray-400">
              <div className="font-bold text-xs uppercase">{settings.store_name}</div>
              <div className="text-[9px] text-gray-700">{settings.tagline}</div>
              <div className="text-[8px] text-gray-600">{settings.address}</div>
              <div className="text-[8px]">WA: {settings.phone_whatsapp}</div>
            </div>

            <div className="py-2 border-b border-dashed border-gray-400 space-y-0.5 text-[9px]">
              <div className="flex justify-between">
                <span>No. Nota:</span>
                <span className="font-bold">{tx.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{formatDateTime(tx.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-bold truncate max-w-[28mm]">{tx.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{tx.cashier_name}</span>
              </div>
            </div>

            {/* ITEMS */}
            <div className="py-2 border-b border-dashed border-gray-400 space-y-2">
              <div className="font-bold text-[9px] uppercase">Rincian Unit Masuk:</div>
              {tx.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-[9px]">
                    {idx + 1}. {item.device_name_snapshot}
                  </div>
                  <div className="flex justify-between text-[8px] text-gray-700">
                    <span>{item.variant_snapshot} [{item.grade_snapshot}]</span>
                    <span className="font-bold text-black">{formatRupiah(item.purchase_price)}</span>
                  </div>
                  <div className="text-[8px] text-gray-600 italic">
                    Kondisi: {item.condition_description}
                  </div>
                </div>
              ))}
            </div>

            {/* TOTALS */}
            <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[9px]">
              <div className="flex justify-between font-bold text-xs">
                <span>TOTAL:</span>
                <span>{formatRupiah(tx.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>DIBAYAR:</span>
                <span>{formatRupiah(tx.paid_amount)}</span>
              </div>
              {tx.remaining_amount > 0 && (
                <div className="flex justify-between font-bold text-red-600">
                  <span>SISA:</span>
                  <span>{formatRupiah(tx.remaining_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>METODE:</span>
                <span className="uppercase">{tx.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span>STATUS:</span>
                <span className="font-bold uppercase">{tx.status}</span>
              </div>
            </div>

            {/* FOOTER NOTE */}
            <div className="pt-2 text-center text-[8px] text-gray-600 space-y-1">
              <p>{settings.receipt_footer_note}</p>
              <p className="font-bold">*** SIMPAN NOTA INI SEBAGAI BUKTI RESMI ***</p>
            </div>
          </div>
        )}

        {receiptSize === '80mm' && (
          <div
            id="printableReceipt"
            className="w-[80mm] bg-white text-black p-4 font-mono text-xs leading-tight shadow-2xl rounded-sm print:shadow-none print:w-[80mm] print:p-2"
          >
            <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-gray-400">
              <div className="font-bold text-sm uppercase">{settings.store_name}</div>
              <div className="text-[10px] text-gray-700">{settings.tagline}</div>
              <div className="text-[10px] text-gray-600">{settings.address}</div>
              <div className="text-[10px]">WhatsApp: {settings.phone_whatsapp}</div>
            </div>

            <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Nomor Nota:</span>
                <span className="font-bold">{tx.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu Transaksi:</span>
                <span>{formatDateTime(tx.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Nama Pelanggan:</span>
                <span className="font-bold">{tx.customer_name} ({tx.customer_whatsapp})</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir Bertugas:</span>
                <span>{tx.cashier_name}</span>
              </div>
            </div>

            {/* ITEMS */}
            <div className="py-3 border-b border-dashed border-gray-400 space-y-2.5">
              <div className="font-bold uppercase text-[11px]">Daftar Handphone Dibeli:</div>
              {tx.items.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-bold text-xs flex justify-between">
                    <span>{idx + 1}. {item.device_name_snapshot} ({item.variant_snapshot})</span>
                    <span>{formatRupiah(item.purchase_price)}</span>
                  </div>
                  <div className="text-[10px] text-gray-600">
                    Grade: <strong className="text-black">{item.grade_snapshot}</strong> | Kelengkapan: {item.accessories || 'Batangan'}
                  </div>
                  <div className="text-[10px] text-gray-600 italic">
                    Kerusakan: {item.condition_description}
                  </div>
                </div>
              ))}
            </div>

            {/* TOTALS */}
            <div className="py-2.5 border-b-2 border-dashed border-gray-400 space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL PEMBELIAN:</span>
                <span>{formatRupiah(tx.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>JUMLAH DIBAYARKAN:</span>
                <span className="font-bold">{formatRupiah(tx.paid_amount)}</span>
              </div>
              {tx.remaining_amount > 0 && (
                <div className="flex justify-between font-bold text-red-600">
                  <span>SISA PEMBAYARAN:</span>
                  <span>{formatRupiah(tx.remaining_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px]">
                <span>METODE PEMBAYARAN:</span>
                <span className="uppercase font-bold">{tx.payment_method}</span>
              </div>
            </div>

            <div className="pt-3 text-center text-[9px] text-gray-600 space-y-1">
              <p>{settings.receipt_footer_note}</p>
              <p className="font-bold">TERIMA KASIH ATAS KUNJUNGAN & KEPERCAYAAN ANDA</p>
            </div>
          </div>
        )}

        {receiptSize === 'a4' && (
          <div
            id="printableReceipt"
            className="w-full max-w-3xl bg-white text-black p-10 font-sans shadow-2xl rounded-xl print:shadow-none print:p-4 print:max-w-none"
          >
            {/* INVOICE HEADER A4 */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  {settings.store_name}
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-medium">{settings.tagline}</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">{settings.address}</p>
                <p className="text-xs text-slate-500">WhatsApp: {settings.phone_whatsapp}</p>
              </div>

              <div className="text-right space-y-1">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block">
                  BUKTI PEMBELIAN RESMI
                </span>
                <span className="text-xl font-mono font-black text-slate-900 block">
                  {tx.invoice_number}
                </span>
                <span className="text-xs text-slate-600 block">
                  Tanggal: {formatDateTime(tx.created_at)}
                </span>
                <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase mt-1 ${
                  tx.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {tx.status === 'paid' ? 'LUNAS (PAID)' : tx.status}
                </span>
              </div>
            </div>

            {/* CUSTOMER INFO */}
            <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase block mb-1">Diterima Dari Pelanggan:</span>
                <div className="font-bold text-sm text-slate-900">{tx.customer_name}</div>
                <div className="text-slate-600">WhatsApp: {tx.customer_whatsapp}</div>
                {tx.customer_address && <div className="text-slate-600">Alamat: {tx.customer_address}</div>}
              </div>

              <div className="text-right">
                <span className="text-slate-400 font-bold uppercase block mb-1">Petugas Kasir:</span>
                <div className="font-bold text-sm text-slate-900">{tx.cashier_name}</div>
                <div className="text-slate-600">Metode Bayar: {tx.payment_method.toUpperCase()}</div>
              </div>
            </div>

            {/* TABLE ITEMS */}
            <div className="py-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-slate-700 uppercase font-bold">
                    <th className="py-2.5">No</th>
                    <th className="py-2.5">Tipe HP & Varian</th>
                    <th className="py-2.5">Grade</th>
                    <th className="py-2.5">Kondisi & Kelengkapan</th>
                    <th className="py-2.5 text-right">Harga Beli</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tx.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-semibold">{idx + 1}</td>
                      <td className="py-3">
                        <div className="font-bold text-slate-900">{item.device_name_snapshot}</div>
                        <div className="text-[11px] text-slate-500">RAM {item.variant_snapshot}</div>
                      </td>
                      <td className="py-3 font-bold text-slate-800">{item.grade_snapshot}</td>
                      <td className="py-3 text-slate-600">
                        <div>{item.condition_description}</div>
                        <div className="text-[10px] text-slate-400">Kelengkapan: {item.accessories || 'Batangan'}</div>
                      </td>
                      <td className="py-3 text-right font-bold text-sm text-slate-900 font-mono">
                        {formatRupiah(item.purchase_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTALS A4 */}
            <div className="border-t-2 border-slate-800 pt-4 flex justify-between items-start text-xs">
              <div className="max-w-md text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">Ketentuan Pembelian:</p>
                <p>{settings.receipt_footer_note}</p>
              </div>

              <div className="w-64 space-y-2 text-right">
                <div className="flex justify-between font-bold text-base border-b pb-2">
                  <span>Grand Total:</span>
                  <span className="font-mono">{formatRupiah(tx.total_amount)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Dibayarkan:</span>
                  <span className="font-mono">{formatRupiah(tx.paid_amount)}</span>
                </div>
                {tx.remaining_amount > 0 && (
                  <div className="flex justify-between font-bold text-rose-600">
                    <span>Sisa:</span>
                    <span className="font-mono">{formatRupiah(tx.remaining_amount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* SIGNATURES */}
            <div className="grid grid-cols-2 gap-12 pt-16 text-center text-xs text-slate-700">
              <div>
                <p>Pelanggan / Penjual</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{tx.customer_name}</p>
              </div>
              <div>
                <p>Kasir Penerima</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{tx.cashier_name}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
