import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Server,
  Key,
  ExternalLink,
  Code2,
  Terminal,
  AlertCircle
} from 'lucide-react';
import { FULL_SUPABASE_MIGRATION_SQL, isSupabaseConfigured } from '../../lib/supabase';

export const SupabaseMigrationPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const isConnected = isSupabaseConfigured();

  const handleCopy = () => {
    navigator.clipboard.writeText(FULL_SUPABASE_MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([FULL_SUPABASE_MIGRATION_SQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '20261110_hp_rusak_pro_init.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Supabase PostgreSQL & Migration SQL</h1>
          <p className="text-xs text-slate-400">
            Skrip skema 18 tabel, pemicu atomik (triggers), Row Level Security (RLS), dan bootstrap role.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSql}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Download .sql</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Script SQL'}</span>
          </button>
        </div>
      </div>

      {/* STATUS CONNECTION CARD */}
      <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isConnected
          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
            isConnected ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-cyan-400'
          }`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Status Koneksi Database:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                isConnected ? 'bg-emerald-600 text-white' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
              }`}>
                {isConnected ? 'Terhubung ke Supabase Live' : 'Penyimpanan Lokal Aktif (Stand-alone Ready)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isConnected
                ? 'Aplikasi telah terhubung ke proyek cloud Supabase Anda.'
                : 'Aplikasi berjalan lancar tanpa error menggunakan reactive persistence engine. Masukkan keys di .env untuk menghubungkan ke Supabase.'}
            </p>
          </div>
        </div>
      </div>

      {/* PANDUAN CEPAT 3 LANGKAH SETUP SUPABASE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Panduan Menjalankan Migration di Proyek Supabase Anda</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center text-[11px]">1</span>
            <div className="font-bold text-white">Buka Supabase SQL Editor</div>
            <p className="text-slate-400 leading-relaxed">
              Masuk ke dashboard Supabase Anda, pilih menu <strong>SQL Editor</strong> di bilah navigasi kiri, lalu buat <strong>New Query</strong>.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center text-[11px]">2</span>
            <div className="font-bold text-white">Tempel & Jalankan Script</div>
            <p className="text-slate-400 leading-relaxed">
              Klik tombol <strong>Salin Script SQL</strong> di pojok kanan atas halaman ini, tempelkan ke SQL Editor Supabase, lalu klik <strong>RUN</strong>.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center text-[11px]">3</span>
            <div className="font-bold text-white">Konfigurasi .env</div>
            <p className="text-slate-400 leading-relaxed">
              Salin <strong>Project URL</strong> dan <strong>anon key</strong> dari Project Settings &gt; API ke dalam file <code className="text-cyan-300">.env</code>.
            </p>
          </div>
        </div>
      </div>

      {/* SQL CODE VIEWER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden space-y-0">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2 font-mono font-bold text-cyan-400">
            <Code2 className="w-4 h-4" />
            <span>20261110_hp_rusak_pro_init.sql</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1 bg-slate-900 rounded-lg border border-slate-800"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin Semua'}</span>
          </button>
        </div>

        <div className="p-4 max-h-[500px] overflow-y-auto bg-slate-950 font-mono text-[11px] text-slate-300 leading-relaxed">
          <pre>{FULL_SUPABASE_MIGRATION_SQL}</pre>
        </div>
      </div>
    </div>
  );
};
