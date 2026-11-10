import React from 'react';
import {
  HelpCircle,
  Truck,
  Store,
  CreditCard,
  Package,
  ShieldCheck,
  MessageCircle,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { cleanWhatsAppNumber } from '../../lib/utils';

export const HowToSellPage: React.FC<{ settings: SiteSettings }> = ({ settings }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-16">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-blue-950 border border-blue-800 text-cyan-400 text-xs px-3.5 py-1.5 rounded-full font-bold">
          <HelpCircle className="w-4 h-4" />
          <span>Panduan Lengkap & Standar Operasional</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Cara Menjual HP Rusak ke {settings.store_name}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Kami menyediakan 2 opsi mudah: datang langsung ke workshop kami atau kirim melalui ekspedisi terpercaya dari seluruh pelosok Indonesia.
        </p>
      </div>

      {/* DUA METODE TRANSAKSI */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* METODE 1: DATANG KE TOKO */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
                Opsi 1 — Cepat 20 Menit
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Datang Langsung ke Workshop
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Cocok bagi Anda yang berdomisili di Jabodetabek. Datang kapan saja pada jam kerja tanpa perlu membuat janji khusus.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center shrink-0">1</span>
                <p className="text-slate-300">Bawa unit HP rusak Anda ke meja kasir/penerimaan kami.</p>
              </div>
              <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center shrink-0">2</span>
                <p className="text-slate-300">Teknisi memeriksa kondisi fisik PCB, jalur daya, dan komponen IC di hadapan Anda (transparan).</p>
              </div>
              <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center shrink-0">3</span>
                <p className="text-slate-300">Jika sepakat dengan taksiran, kasir menerbitkan nota thermal resmi dan dana dicairkan tunai/transfer saat itu juga.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center gap-3 text-xs text-slate-400">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{settings.address}</span>
          </div>
        </div>

        {/* METODE 2: KIRIM EKSPEDISI */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                Opsi 2 — Seluruh Indonesia
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Kirim via Ekspedisi (J&T / JNE / SiCepat)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Melayani pengiriman dari Aceh hingga Papua. Ratusan unit telah berhasil ditransaksikan via paket ekspedisi.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
                <p className="text-slate-300">Chat WhatsApp admin kami untuk mendapatkan estimasi awal dan alamat lengkap workshop penerimaan.</p>
              </div>
              <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</span>
                <p className="text-slate-300">Packing unit dengan bubble wrap tebal. Selipkan secarik kertas berisi No. WhatsApp & No. Rekening Anda di dalam paket.</p>
              </div>
              <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
                <p className="text-slate-300">Saat paket tiba, tim kami merekam video unboxing & uji mesin. Uang langsung ditransfer detik itu juga setelah konfirmasi.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <a
              href={`https://wa.me/${cleanWhatsAppNumber(settings.phone_whatsapp)}?text=${encodeURIComponent(
                `Halo admin ${settings.store_name}, saya mau kirim HP rusak via ekspedisi. Mohon petunjuk format alamatnya.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-full gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 rounded-xl transition"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Minta Format Alamat Kirim Paket</span>
            </a>
          </div>
        </div>
      </div>

      {/* TIPS PACKING AMAN */}
      <div className="max-w-4xl mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 text-cyan-400 font-bold text-base">
          <Package className="w-5 h-5" />
          <span>Panduan Packing Aman untuk Kiriman Luar Kota</span>
        </div>
        <ul className="text-xs sm:text-sm text-slate-300 space-y-2.5 list-disc pl-5 leading-relaxed">
          <li>Gunakan minimal 3–4 lapis bubble wrap atau kardus bekas untuk melindungi motherboard agar tidak patah saat handling kurir.</li>
          <li>Jika HP memiliki baterai kembung parah, beri catatan di luar paket agar kurir tidak menolak pengiriman jalur darat.</li>
          <li>Jangan lupa menyertakan kartu nama/kertas kecil bertuliskan nama pengirim, nomor WhatsApp, dan nomor rekening BCA/Mandiri/BRI/Dana.</li>
        </ul>
      </div>
    </div>
  );
};
