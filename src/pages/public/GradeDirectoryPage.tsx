import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { StorageService } from '../../lib/storage';
import { formatRupiah, cleanWhatsAppNumber } from '../../lib/utils';

export const GradeDirectoryPage: React.FC<{ settings: SiteSettings }> = ({ settings }) => {
  const grades = StorageService.getGrades();
  const prices = StorageService.getPrices();
  const [activeGradeId, setActiveGradeId] = useState(grades[0]?.id || '');

  const activeGrade = grades.find(g => g.id === activeGradeId) || grades[0];

  // Samples of prices for this active grade
  const samplePrices = prices
    .filter(p => p.grade_id === activeGrade?.id)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-blue-950 border border-blue-800 text-cyan-400 text-xs px-3.5 py-1.5 rounded-full font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Standarisasi Kualitas Komponen</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Direktori Grade Komponen HP Rusak
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Di {settings.store_name}, setiap unit dinilai berdasarkan kondisi aktual motherboard, kaleng pelindung IC, dan komponen cadangan yang masih bisa dimanfaatkan.
        </p>
      </div>

      {/* GRADE TABS */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {grades.map((grade) => {
            const isActive = grade.id === activeGradeId;
            return (
              <button
                key={grade.id}
                onClick={() => setActiveGradeId(grade.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 border border-blue-500 scale-105'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>Grade {grade.code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE GRADE DETAIL CARD */}
      {activeGrade && (
        <div className="max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-cyan-400">
                  Grade {activeGrade.code}
                </span>
                <span className="text-xs uppercase tracking-wider font-semibold bg-cyan-950 border border-cyan-800 text-cyan-300 px-2.5 py-0.5 rounded-md">
                  Tingkat {activeGrade.sort_order}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">
                {activeGrade.name}
              </h2>
            </div>

            <a
              href={`https://wa.me/${cleanWhatsAppNumber(settings.phone_whatsapp)}?text=${encodeURIComponent(
                `Halo admin ${settings.store_name}, saya mau tanya harga untuk HP dengan Grade ${activeGrade.code}.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition self-start md:self-auto"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Konsultasi Grade {activeGrade.code}</span>
            </a>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            {activeGrade.description}
          </p>

          {/* CRITERIA BREAKDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wide">
                <Cpu className="w-4 h-4" />
                <span>Kondisi Motherboard & IC</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeGrade.criteria_ic_pcb || 'Kaleng penutup IC utuh, belum pernah diservis parah.'}
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wide">
                <Sparkles className="w-4 h-4" />
                <span>Kondisi Layar & Sentuh</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeGrade.criteria_lcd || 'Menyesuaikan kondisi fisik luar.'}
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4" />
                <span>Fisik Frame & Casing</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeGrade.criteria_casing || 'Lengkap dengan tombol-tombol dan fleksibel.'}
              </p>
            </div>
          </div>

          {/* SAMPLE PRICING TABLE FOR THIS GRADE */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="font-bold text-base text-white">
              Contoh Estimasi Harga Beli di Grade {activeGrade.code}
            </h3>

            {samplePrices.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada patokan harga spesifik untuk grade ini.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {samplePrices.map((sp) => (
                  <div
                    key={sp.id}
                    className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase block">{sp.brand_name}</span>
                      <span className="font-bold text-sm text-white">{sp.device_name}</span>
                      <span className="text-xs text-slate-400 block">{sp.ram} / {sp.rom}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Estimasi</span>
                      <span className="text-sm font-black text-emerald-400">{formatRupiah(sp.estimated_price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
