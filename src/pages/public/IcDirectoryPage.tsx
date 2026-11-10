import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Search,
  CheckCircle,
  HardDrive,
  Zap,
  Radio,
  FileCode,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { SiteSettings, IcChip } from '../../types';
import { StorageService } from '../../lib/storage';
import { cleanWhatsAppNumber } from '../../lib/utils';

export const IcDirectoryPage: React.FC<{ settings: SiteSettings }> = ({ settings }) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const icChips: IcChip[] = StorageService.getIcChips();

  const types = useMemo(() => {
    const set = new Set<string>();
    icChips.forEach(c => set.add(c.type));
    return Array.from(set);
  }, [icChips]);

  const filteredChips = useMemo(() => {
    return icChips.filter((chip) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        chip.chip_code.toLowerCase().includes(q) ||
        chip.name.toLowerCase().includes(q) ||
        (chip.brand && chip.brand.toLowerCase().includes(q)) ||
        (chip.technician_notes && chip.technician_notes.toLowerCase().includes(q)) ||
        chip.compatible_models.some(m => m.toLowerCase().includes(q));

      const matchType = selectedType === 'all' || chip.type === selectedType;
      return matchSearch && matchType;
    });
  }, [icChips, search, selectedType]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 text-indigo-400 text-xs px-3.5 py-1.5 rounded-full font-bold">
          <Cpu className="w-4 h-4" />
          <span>Database Teknisi Hardware & Komponen IC</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Direktori Kode IC, eMMC & UFS
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Pustaka referensi kode IC kanibal, memori eMMC/UFS, Power IC, dan kompatibilitas model HP untuk kebutuhan perbaikan mesin dan jual beli part rusak.
        </p>

        {/* SEARCH BAR */}
        <div className="max-w-2xl mx-auto pt-2 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode IC (KMQE..., KLUDG..., PMI632), tipe HP, atau merek..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="all">Semua Jenis IC</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CHIPS GRID */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-400">
            Ditemukan {filteredChips.length} Data IC
          </span>
          <span className="text-xs text-cyan-400 font-semibold">
            Telah diverifikasi skematik resmi
          </span>
        </div>

        {filteredChips.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
            <Cpu className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-white text-base">Kode IC Tidak Ditemukan</h3>
            <p className="text-xs text-slate-400">
              Coba cari dengan kata kunci lain atau hubungi admin teknisi kami langsung.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredChips.map((chip) => {
              const waUrl = `https://wa.me/${cleanWhatsAppNumber(settings.phone_whatsapp)}?text=${encodeURIComponent(
                `Halo admin ${settings.store_name}, saya mencari kanibal / butuh info tentang kode IC: ${chip.chip_code} (${chip.name}).`
              )}`;

              return (
                <div
                  key={chip.id}
                  className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all space-y-4 hover:shadow-xl group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {chip.brand || 'Original Component'}
                        </span>
                        <h3 className="text-lg font-black font-mono text-cyan-400 group-hover:text-cyan-300 transition-colors">
                          {chip.chip_code}
                        </h3>
                        <p className="text-xs font-bold text-white mt-0.5">
                          {chip.name}
                        </p>
                      </div>

                      {chip.is_verified && (
                        <span
                          title="Data Terverifikasi"
                          className="flex items-center gap-1 bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                        Jenis: {chip.type}
                      </span>
                      {chip.capacity && chip.capacity !== '-' && (
                        <span className="bg-slate-950 border border-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono">
                          {chip.capacity}
                        </span>
                      )}
                    </div>

                    {/* TECHNICIAN NOTES */}
                    {chip.technician_notes && (
                      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Catatan Teknisi:
                        </span>
                        {chip.technician_notes}
                      </div>
                    )}

                    {/* COMPATIBLE MODELS */}
                    {chip.compatible_models.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Model Kompatibel / Dipakai Di:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {chip.compatible_models.map((mod, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded"
                            >
                              {mod}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTION */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Tersedia di mesin kanibal
                    </span>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Tanya IC Ini</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
