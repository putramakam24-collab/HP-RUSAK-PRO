import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mx-auto shadow-2xl">
        <Smartphone className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-white">404 — Halaman Tidak Ditemukan</h1>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md">
        Halaman yang Anda tuju mungkin telah dipindahkan atau tautan tidak valid.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg mt-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda Utama</span>
      </Link>
    </div>
  );
};
