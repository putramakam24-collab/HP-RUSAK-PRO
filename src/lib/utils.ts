import * as XLSX from 'xlsx';
import { Transaction, SiteSettings } from '../types';

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function cleanWhatsAppNumber(phone: string): string {
  if (!phone) return '628123456789';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function exportToExcel(data: any[], fileName: string, sheetName: string = 'Data') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export function buildWhatsAppInquiryUrl(params: {
  phone: string;
  storeName: string;
  brand: string;
  device: string;
  variant?: string;
  grade?: string;
  estimatedPrice?: number;
}): string {
  const phone = cleanWhatsAppNumber(params.phone);
  const text =
`Halo admin ${params.storeName}, saya ingin menanyakan harga HP rusak.

Merek: ${params.brand}
Tipe: ${params.device}
RAM/ROM: ${params.variant || '-'}
Grade: ${params.grade || '-'}

${params.estimatedPrice ? `Estimasi di website: ${formatRupiah(params.estimatedPrice)}\n` : ''}Mohon informasi harga terbaru.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppInvoiceUrl(tx: Transaction, settings: SiteSettings): string {
  const phone = cleanWhatsAppNumber(tx.customer_whatsapp);
  const itemsList = tx.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.device_name_snapshot} (${item.variant_snapshot}) [${item.grade_snapshot}]\n   Kondisi: ${item.condition_description}\n   Harga Beli: ${formatRupiah(item.purchase_price)}`
    )
    .join('\n');

  const text =
`*NOTA PEMBELIAN HP RUSAK*
*${settings.store_name}*
${settings.address}
WA: ${settings.phone_whatsapp}
----------------------------------------
No. Nota: ${tx.invoice_number}
Tanggal: ${formatDateTime(tx.created_at)}
Pelanggan: ${tx.customer_name} (${tx.customer_whatsapp})
Kasir: ${tx.cashier_name}
Status: ${tx.status === 'paid' ? 'LUNAS' : tx.status.toUpperCase()}
----------------------------------------
*DAFTAR UNIT:*
${itemsList}
----------------------------------------
*TOTAL PEMBELIAN: ${formatRupiah(tx.total_amount)}*
*DIBAYARKAN: ${formatRupiah(tx.paid_amount)}*
${tx.remaining_amount > 0 ? `*SISA PEMBAYARAN: ${formatRupiah(tx.remaining_amount)}*\n` : ''}Metode: ${tx.payment_method.toUpperCase()}
----------------------------------------
${settings.receipt_footer_note}
`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
