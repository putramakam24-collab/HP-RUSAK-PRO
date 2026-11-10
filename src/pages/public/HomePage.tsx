import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Cpu,
  Flame,
  Smartphone,
  Info,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Wrench,
  Banknote
} from 'lucide-react';
import { SiteSettings, Price, Brand, Grade } from '../../types';
import { StorageService } from '../../lib/storage';
import { formatRupiah, buildWhatsAppInquiryUrl, cleanWhatsAppNumber } from '../../lib/utils';

interface HomePageProps {
  settings: SiteSettings;
}

export const HomePage: React.FC<HomePageProps> = ({ settings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const brands: Brand[] = useMemo(() => StorageService.getBrands().filter(b => b.is_active), []);
  const grades: Grade[] = useMemo(() => StorageService.getGrades().filter(g => g.is_active), []);
  const prices: Price[] = useMemo(() => StorageService.getPrices().filter(p => p.is_active), []);

  // Filtered prices for instant search
  const filteredPrices = useMemo(() => {
    return prices.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (p.device_name && p.device_name.toLowerCase().includes(q)) ||
        (p.brand_name && p.brand_name.toLowerCase().includes(q)) ||
        (p.model_code && p.model_code.toLowerCase().includes(q)) ||
        (p.ram && p.ram.toLowerCase().includes(q)) ||
        (p.rom && p.rom.toLowerCase().includes(q)) ||
        (p.grade_code && p.grade_code.toLowerCase().includes(q));

      const matchBrand =
        selectedBrand === 'all' ||
        (p.brand_name && p.brand_name.toLowerCase() === selectedBrand.toLowerCase());

      const matchGrade =
        selectedGrade === 'all' ||
        (p.grade_code && p.grade_code.toLowerCase() === selectedGrade.toLowerCase());

      return matchQuery && matchBrand && matchGrade;
    });
  }, [prices, searchQuery, selectedBrand, selectedGrade]);

  const faqs = [
    {
      q: 'Kondisi HP apa saja yang diterima oleh HP RUSAK PRO?',
      a: 'Kami menerima berbagai kondisi HP rusak: Mati total (belum pernah diservis/perawan maupun bekas blower), LCD retak/pecah/blank, bootloop/gantung logo, kena air (korosi), IC rusak (eMMC, UFS, Power IC, CPU), mesin patah, baterai kembung, hingga HP batangan tanpa charger.'
    },
    {
      q: 'Bagaimana cara menentukan harga pasti HP saya?',
      a: 'Harga di website adalah estimasi berdasarkan standar pasar kanibal dan part sparepart. Harga final akan dipastikan setelah tim teknisi memeriksa kondisi fisik PCB, apakah kaleng pelindung IC masih utuh, serta mengecek komponen LCD dan kamera.'
    },
    {
      q: 'Apakah bisa menjual HP rusak jika posisi saya di luar kota?',
      a: 'Bisa sekali! Kami melayani pembelian unit dari seluruh Indonesia via ekspedisi (J&T, JNE, SiCepat). Cukup konsultasi estimasi via WhatsApp, packing aman unit Anda, dan kirimkan ke workshop kami. Setelah tiba dan diuji, dana langsung ditransfer ke rekening atau e-wallet Anda.'
    },
    {
      q: 'Berapa lama proses pengecekan dan pencairan dana?',
      a: 'Untuk transaksi datang langsung ke toko (Roxy Mas), pengecekan teknisi membutuhkan waktu 15–30 menit. Jika sepakat, nota resmi diterbitkan dan uang langsung dicairkan detik itu juga (Cash / Transfer BCA).'
    },
    {
      q: 'Apakah counter servis atau teknisi bisa menjual unit borongan/part?',
      a: 'Sangat bisa. Kami memiliki kemitraan khusus untuk rekan teknisi, bengkel servis, dan counter HP yang memiliki timbunan bangkai HP rusak / motherboard kanibalan borongan dengan harga khusus.'
    }
  ];

  const conditionCategories = [
    { title: 'Mati Total', desc: 'Tidak ada tanda kehidupan, belum pernah disolder teknisi lain.', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { title: 'LCD Pecah / Blank', desc: 'Mesin masih getar/dering atau dicas masuk, namun layar retak seribu/tompel.', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { title: 'Bootloop / Hang Logo', desc: 'Stuck di logo merek, gagal update, atau partisi memori eMMC/UFS corrupt.', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { title: 'Kena Air / Korosi', desc: 'Tercebur air tawar atau laut, karat pada fleksibel dan pin konektor.', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { title: 'IC Rusak / Reball', desc: 'Poco X3 Pro mati CPU, Power IC jebol, atau kasus swap memori.', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { title: 'Mesin Konslet', desc: 'Short VDD MAIN / VREG, panas berlebih, konsumsi arus gantung power supply.', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { title: 'Baterai & Port Cas', desc: 'Baterai kembung parah, tidak bisa cas, konektor Type-C rontok.', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Sinyal & Baseband', desc: 'IMEI null, radio off, no service, atau IC WTR/SDR bermasalah.', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  ];

  return (
    <div className="space-y-16 pb-16 bg-slate-950 text-slate-100 min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80 pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* TAG BADGE */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-900/60 to-cyan-900/60 border border-cyan-700/50 text-cyan-300 text-xs px-4 py-1.5 rounded-full font-bold shadow-lg">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Pusat Pembelian HP Rusak & Kanibal Motherboard No. 1</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            HP Rusak? <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">Tetap Ada Harganya!</span>
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Jangan buang HP mati total, layar retak, atau motherboard kanibal Anda. Cek estimasi harga online secara transparan dan cairkan uangnya sekarang juga.
          </p>

          {/* SEARCH BOX IN HERO */}
          <div className="max-w-3xl mx-auto pt-4">
            <div className="relative flex items-center bg-slate-900/90 rounded-2xl border-2 border-cyan-500/40 p-2 shadow-2xl focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-500/20 transition-all">
              <div className="pl-3 pr-2 text-slate-400">
                <Search className="w-6 h-6 text-cyan-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tipe HP rusak... (Contoh: Poco X3 Pro, Redmi Note 10, Galaxy A51, iPhone XR)"
                className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base font-medium py-2 px-1 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Reset
                </button>
              )}
            </div>

            {/* QUICK BRAND PILLS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-slate-400 font-semibold">Merek Populer:</span>
              {['Samsung', 'Xiaomi', 'Redmi', 'Poco', 'Oppo', 'Vivo', 'Realme', 'iPhone'].map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    setSelectedBrand(selectedBrand === b ? 'all' : b);
                    setSearchQuery('');
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedBrand.toLowerCase() === b.toLowerCase()
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICE SEARCH RESULTS CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <Smartphone className="w-6 h-6 text-cyan-400" />
              <span>Katalog Estimasi Harga Beli HP Rusak</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Menampilkan {filteredPrices.length} data estimasi aktif dari database resmi.
            </p>
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Brand */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-800 rounded-lg text-xs py-2 px-3 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="all">Semua Merek ({brands.length})</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>

            {/* Filter Grade */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-800 rounded-lg text-xs py-2 px-3 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="all">Semua Grade ({grades.length})</option>
              {grades.map((g) => (
                <option key={g.id} value={g.code}>{g.code} — {g.name.split('(')[1]?.replace(')', '') || g.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* RESULTS GRID */}
        {filteredPrices.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Tipe Belum Tercatat Otomatis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tipe HP atau varian yang Anda cari belum memiliki harga otomatis di katalog. Jangan khawatir, tim teknisi kami tetap bisa menaksir harga secara manual melalui WhatsApp.
            </p>
            <a
              href={`https://wa.me/${cleanWhatsAppNumber(settings.phone_whatsapp)}?text=${encodeURIComponent(
                `Halo admin ${settings.store_name}, saya ingin menanyakan estimasi harga HP rusak tipe: ${searchQuery || selectedBrand}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi Admin untuk Cek Harga</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrices.map((item) => {
              const waInquiryUrl = buildWhatsAppInquiryUrl({
                phone: settings.phone_whatsapp,
                storeName: settings.store_name,
                brand: item.brand_name || '',
                device: item.device_name || '',
                variant: `${item.ram}/${item.rom}`,
                grade: `${item.grade_code} (${item.grade_name})`,
                estimatedPrice: item.estimated_price,
              });

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-cyan-950/20 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 block">
                          {item.brand_name}
                        </span>
                        <h3 className="font-bold text-white text-base leading-tight group-hover:text-cyan-300 transition-colors">
                          {item.device_name}
                        </h3>
                        {item.model_code && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            Model: {item.model_code}
                          </span>
                        )}
                      </div>

                      {/* GRADE BADGE */}
                      <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-slate-800 text-cyan-300 border border-slate-700">
                        {item.grade_code}
                      </span>
                    </div>

                    {/* SPECS & NOTES */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300 font-semibold">
                          RAM {item.ram} / ROM {item.rom}
                        </span>
                        <span className="text-slate-400 text-[11px] truncate">
                          {item.grade_name}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-[11px] text-slate-400 italic line-clamp-2">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* PRICE & ACTION */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Estimasi Beli</span>
                      <span className="text-lg font-black text-emerald-400">
                        {formatRupiah(item.estimated_price)}
                      </span>
                    </div>

                    <a
                      href={waInquiryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs group-hover:shadow-emerald-900/30"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>Jual Ini</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4 LANGKAH MUDAH JUAL HP RUSAK */}
      <section className="bg-slate-900/50 py-16 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Cara Menjual HP Rusak di {settings.store_name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Proses cepat, transparan, tanpa ribet. Dana langsung cair hari ini juga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Cek Estimasi Harga',
                desc: 'Cari merek, tipe, dan kondisi perkiraan HP Anda pada kolom pencarian di website kami.',
                icon: Search,
                color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
              },
              {
                step: '02',
                title: 'Konsultasi WhatsApp',
                desc: 'Klik tombol konsultasi WhatsApp. Kirimkan foto kondisi fisik dan deskripsi singkat kendala unit.',
                icon: MessageCircle,
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              },
              {
                step: '03',
                title: 'Datang / Kirim Ekspedisi',
                desc: 'Bawa unit ke workshop kami di Roxy Mas atau kirimkan via J&T/JNE/SiCepat dari luar kota.',
                icon: PackageCheck,
                color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
              },
              {
                step: '04',
                title: 'Tes Fisik & Uang Cair',
                desc: 'Teknisi menguji keaslian PCB & IC. Kami terbitkan nota resmi dan uang langsung ditransfer.',
                icon: Banknote,
                color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
              },
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${st.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-700">{st.step}</span>
                  </div>
                  <h3 className="font-bold text-white text-base">{st.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* KATEGORI KERUSAKAN HP YANG DITERIMA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <Wrench className="w-4 h-4" />
            <span>Spesialis Komponen Hardware</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Kategori Kerusakan HP yang Kami Terima
          </h2>
          <p className="text-xs text-slate-400">
            Kami menghargai setiap komponen fungsional yang tersisa pada HP Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {conditionCategories.map((c, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl space-y-2 hover:border-slate-700 transition">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border inline-block ${c.color}`}>
                {c.title}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="text-xs text-slate-400">
            Hal-hal yang perlu Anda ketahui sebelum menjual HP rusak.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-4.5 flex items-center justify-between text-sm font-bold text-white hover:text-cyan-400 transition"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 shrink-0 text-cyan-400" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-500" />}
              </button>
              {openFaq === idx && (
                <div className="px-4.5 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Punya HP Rusak Menganggur di Laci?
            </h2>
            <p className="text-slate-300 text-sm max-w-xl mx-auto">
              Ubah barang mati jadi uang tunai dalam hitungan menit. Hubungi admin kami untuk konsultasi gratis sekarang!
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={`https://wa.me/${cleanWhatsAppNumber(settings.phone_whatsapp)}?text=${encodeURIComponent(
                `Halo admin ${settings.store_name}, saya mau jual HP rusak saya.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Chat WhatsApp Admin Sekarang</span>
            </a>
            <Link
              to="/grades"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm px-6 py-3.5 rounded-xl transition"
            >
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Pelajari Standarisasi Grade</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
