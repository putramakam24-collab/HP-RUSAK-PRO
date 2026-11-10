import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Database,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  FileDown
} from 'lucide-react';
import { StorageService } from '../../lib/storage';
import { exportToExcel, formatRupiah } from '../../lib/utils';
import { ReferenceStaging, StagingStatus } from '../../types';

interface StagedParsedRow {
  brand: string;
  deviceName: string;
  modelCode: string;
  ram: string;
  rom: string;
  gradeCode: string;
  estimatedPrice: number;
  notes: string;
  isValid: boolean;
  error?: string;
  isDuplicate?: boolean;
}

export const ImportDatabasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'templates' | 'staging' | 'export'>('upload');
  const currentUser = StorageService.getCurrentUser();

  // Upload & Parser state
  const [fileData, setFileData] = useState<StagedParsedRow[]>([]);
  const [duplicateAction, setDuplicateAction] = useState<'skip' | 'update' | 'add'>('update');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<{ total: number; success: number; skipped: number } | null>(null);

  // Staging reference state
  const [stagingList, setStagingList] = useState<ReferenceStaging[]>(() => StorageService.getStaging());

  // Handle Excel Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportSummary(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawJson = XLSX.utils.sheet_to_json<any>(ws);

        const currentPrices = StorageService.getPrices();

        const parsed: StagedParsedRow[] = rawJson.map((row) => {
          const brand = String(row['Merek'] || row['Brand'] || row['merek'] || '').trim();
          const deviceName = String(row['Tipe HP'] || row['Nama Tipe'] || row['Device'] || '').trim();
          const modelCode = String(row['Kode Model'] || row['Model'] || '').trim();
          const ram = String(row['RAM'] || row['ram'] || '-').trim();
          const rom = String(row['ROM'] || row['rom'] || '-').trim();
          const gradeCode = String(row['Grade'] || row['grade'] || 'A++').trim().toUpperCase();
          const rawPrice = row['Harga Estimasi'] || row['Harga'] || row['Price'] || 0;
          const estimatedPrice = Number(rawPrice);
          const notes = String(row['Catatan'] || '').trim();

          let isValid = true;
          let error = '';

          if (!brand) {
            isValid = false;
            error = 'Merek kosong; ';
          }
          if (!deviceName) {
            isValid = false;
            error += 'Nama Tipe HP kosong; ';
          }
          if (isNaN(estimatedPrice) || estimatedPrice < 0) {
            isValid = false;
            error += 'Harga tidak valid; ';
          }

          // Duplicate detection
          const exists = currentPrices.some(
            p =>
              p.brand_name?.toLowerCase() === brand.toLowerCase() &&
              p.device_name?.toLowerCase() === deviceName.toLowerCase() &&
              p.grade_code?.toUpperCase() === gradeCode.toUpperCase()
          );

          return {
            brand,
            deviceName,
            modelCode,
            ram,
            rom,
            gradeCode,
            estimatedPrice,
            notes,
            isValid,
            error: error || undefined,
            isDuplicate: exists
          };
        });

        setFileData(parsed);
      } catch (err: any) {
        alert('Gagal membaca file Excel/CSV: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Commit Staged parsed data to primary database
  const handleCommitUpload = () => {
    if (fileData.length === 0) return;
    setIsProcessing(true);

    let successCount = 0;
    let skipCount = 0;

    const currentBrands = StorageService.getBrands();
    const currentDevices = StorageService.getDevices();
    const currentGrades = StorageService.getGrades();
    const currentPrices = StorageService.getPrices();

    fileData.forEach((row) => {
      if (!row.isValid) {
        skipCount++;
        return;
      }

      if (row.isDuplicate && duplicateAction === 'skip') {
        skipCount++;
        return;
      }

      // 1. Ensure Brand
      let brand = currentBrands.find(b => b.name.toLowerCase() === row.brand.toLowerCase());
      if (!brand) {
        brand = {
          id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          name: row.brand,
          slug: row.brand.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          is_active: true,
          created_at: new Date().toISOString()
        };
        StorageService.saveBrand(brand, currentUser.full_name);
      }

      // 2. Ensure Device
      let dev = currentDevices.find(
        d => d.brand_id === brand?.id && d.name.toLowerCase() === row.deviceName.toLowerCase()
      );
      if (!dev) {
        dev = {
          id: `dev-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          brand_id: brand.id,
          brand_name: brand.name,
          name: row.deviceName,
          model_code: row.modelCode,
          is_active: true,
          created_at: new Date().toISOString()
        };
        StorageService.saveDevice(dev, currentUser.full_name);
      }

      // 3. Ensure Variant
      let variant = StorageService.getVariants().find(
        v => v.device_id === dev?.id && v.ram === row.ram && v.rom === row.rom
      );
      if (!variant) {
        variant = {
          id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          device_id: dev.id,
          ram: row.ram,
          rom: row.rom,
          is_active: true,
          created_at: new Date().toISOString()
        };
        StorageService.saveVariant(variant, currentUser.full_name);
      }

      // 4. Ensure Grade
      let grade = currentGrades.find(g => g.code.toUpperCase() === row.gradeCode.toUpperCase());
      if (!grade) {
        grade = currentGrades[0];
      }

      // 5. Update or Insert Price
      const existingPrice = currentPrices.find(
        p => p.variant_id === variant?.id && p.grade_id === grade?.id
      );

      if (existingPrice) {
        if (duplicateAction === 'update') {
          StorageService.updatePrice(
            existingPrice.id,
            row.estimatedPrice,
            `Impor Excel massal (${duplicateAction})`,
            currentUser.full_name
          );
          successCount++;
        } else {
          skipCount++;
        }
      } else {
        StorageService.createPrice(
          {
            id: `pr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            variant_id: variant.id,
            grade_id: grade.id,
            estimated_price: row.estimatedPrice,
            notes: row.notes,
            is_active: true,
            updated_at: new Date().toISOString(),
            updated_by: currentUser.full_name
          },
          currentUser.full_name
        );
        successCount++;
      }
    });

    setIsProcessing(false);
    setImportSummary({ total: fileData.length, success: successCount, skipped: skipCount });
    setFileData([]);
    alert(`Impor selesai! ${successCount} data berhasil dimasukkan ke database utama.`);
  };

  // Download Templates
  const downloadDevicePriceTemplate = () => {
    const templateData = [
      {
        'Merek': 'Xiaomi',
        'Tipe HP': 'Redmi Note 10 4G',
        'Kode Model': 'M2101K7AG',
        'RAM': '4GB',
        'ROM': '64GB',
        'Grade': 'A+++',
        'Harga Estimasi': 650000,
        'Catatan': 'Normal minus baterai / lecet pemakaian'
      },
      {
        'Merek': 'Xiaomi',
        'Tipe HP': 'Redmi Note 10 4G',
        'Kode Model': 'M2101K7AG',
        'RAM': '4GB',
        'ROM': '64GB',
        'Grade': 'A++',
        'Harga Estimasi': 380000,
        'Catatan': 'Mesin hidup, LCD retak/blank'
      },
      {
        'Merek': 'Poco',
        'Tipe HP': 'Poco X3 Pro',
        'Kode Model': 'M2012K11AG',
        'RAM': '8GB',
        'ROM': '256GB',
        'Grade': 'A+',
        'Harga Estimasi': 480000,
        'Catatan': 'Mati total perawan belum kena solder teknisi'
      },
      {
        'Merek': 'Samsung',
        'Tipe HP': 'Galaxy A51',
        'Kode Model': 'SM-A515F',
        'RAM': '6GB',
        'ROM': '128GB',
        'Grade': 'AB',
        'Harga Estimasi': 150000,
        'Catatan': 'Bekas servisan/kaleng terbuka'
      }
    ];
    exportToExcel(templateData, 'Template_Harga_HP_Rusak_Pro', 'Master_Harga');
  };

  const downloadIcTemplate = () => {
    const icTemplate = [
      {
        'Kode IC': 'KMQE60013M-B318',
        'Nama IC': 'Samsung eMCP BGA 221',
        'Jenis': 'eMCP / eMMC',
        'Merek': 'Samsung',
        'Kapasitas': '16GB + 16Gb',
        'Model Kompatibel': 'Redmi 4A, Redmi 5A, Oppo A37',
        'Catatan Teknisi': 'IC memori legendaris mudah diprogram via UFI'
      },
      {
        'Kode IC': 'PMI632-902-00',
        'Nama IC': 'Qualcomm Secondary Charger IC',
        'Jenis': 'Power IC / Charger IC',
        'Merek': 'Qualcomm',
        'Kapasitas': '-',
        'Model Kompatibel': 'Redmi 8, Redmi Note 8, Asus M2',
        'Catatan Teknisi': 'Sering jebol gantung 0.05A saat cas'
      }
    ];
    exportToExcel(icTemplate, 'Template_Database_IC_Pro', 'Master_IC');
  };

  // Export full database to Excel
  const handleExportFullDatabase = () => {
    const fullPrices = StorageService.getPrices();
    const exportRows = fullPrices.map(p => ({
      'Merek': p.brand_name,
      'Nama Tipe': p.device_name,
      'Kode Model': p.model_code,
      'RAM': p.ram,
      'ROM': p.rom,
      'Grade': p.grade_code,
      'Harga Beli Estimasi': p.estimated_price,
      'Catatan': p.notes || '',
      'Terakhir Update': p.updated_at
    }));
    exportToExcel(exportRows, `Database_HP_Rusak_Pro_${new Date().toISOString().split('T')[0]}`, 'Katalog_Harga');
  };

  // Staging Actions
  const handleApproveStaging = (stg: ReferenceStaging) => {
    StorageService.updateStagingStatus(stg.id, 'imported', 'Disetujui dan diimpor admin', currentUser.full_name);
    setStagingList(StorageService.getStaging());
    alert(`Data referensi ${stg.raw_payload.device || stg.raw_payload.chip_code} disetujui & diimpor.`);
  };

  const handleRejectStaging = (stg: ReferenceStaging) => {
    const reason = prompt('Masukkan alasan penolakan:');
    if (reason) {
      StorageService.updateStagingStatus(stg.id, 'rejected', reason, currentUser.full_name);
      setStagingList(StorageService.getStaging());
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Import Database Referensi & Excel</h1>
        <p className="text-xs text-slate-400">
          Modul sinkronisasi data dari spreadsheet resmi dan staging referensi berizin.
        </p>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'upload'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload & Validasi Spreadsheet</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'templates'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Template Format Excel</span>
        </button>

        <button
          onClick={() => setActiveTab('staging')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'staging'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Staging Referensi Berizin ({stagingList.filter(s => s.status === 'pending').length} Menunggu)</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'export'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileDown className="w-4 h-4 text-emerald-400" />
          <span>Export Database Lengkap</span>
        </button>
      </div>

      {/* TAB 1: UPLOAD & PREVIEW */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-3xl p-8 text-center space-y-4 transition">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Pilih Berkas Excel / CSV</h3>
              <p className="text-xs text-slate-400 mt-1">
                Mendukung format .xlsx, .xls, .csv sesuai template standar.
              </p>
            </div>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
            />
          </div>

          {/* DUPLICATE HANDLING OPTIONS */}
          {fileData.length > 0 && (
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-white block">Aturan Duplikasi Data:</span>
                <span className="text-[11px] text-slate-400">
                  Ditemukan {fileData.filter(f => f.isDuplicate).length} baris yang sudah ada di database utama.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  <input
                    type="radio"
                    name="dupAction"
                    value="update"
                    checked={duplicateAction === 'update'}
                    onChange={() => setDuplicateAction('update')}
                    className="text-blue-600"
                  />
                  <span>Update Harga Lama</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  <input
                    type="radio"
                    name="dupAction"
                    value="skip"
                    checked={duplicateAction === 'skip'}
                    onChange={() => setDuplicateAction('skip')}
                    className="text-blue-600"
                  />
                  <span>Lewati (Skip)</span>
                </label>
                <button
                  onClick={handleCommitUpload}
                  disabled={isProcessing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  <span>Commit {fileData.filter(f => f.isValid).length} Baris ke Database</span>
                </button>
              </div>
            </div>
          )}

          {/* PREVIEW TABLE */}
          {fileData.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">
                  Preview {fileData.length} Baris Data Unggahan
                </span>
                <span className="text-emerald-400 font-semibold">
                  Valid: {fileData.filter(f => f.isValid).length} | Invalid: {fileData.filter(f => !f.isValid).length}
                </span>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold sticky top-0">
                    <tr>
                      <th className="p-3">Status</th>
                      <th className="p-3">Merek</th>
                      <th className="p-3">Tipe HP</th>
                      <th className="p-3">Model</th>
                      <th className="p-3">RAM/ROM</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Harga Estimasi</th>
                      <th className="p-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {fileData.map((row, i) => (
                      <tr key={i} className={`hover:bg-slate-800/40 ${!row.isValid ? 'bg-rose-950/20' : ''}`}>
                        <td className="p-3">
                          {row.isValid ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              {row.isDuplicate && <span className="text-[10px] text-amber-400">(Duplikat)</span>}
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1 font-bold">
                              <XCircle className="w-4 h-4" /> Error
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-white">{row.brand}</td>
                        <td className="p-3">{row.deviceName}</td>
                        <td className="p-3 font-mono text-slate-400">{row.modelCode || '-'}</td>
                        <td className="p-3">{row.ram}/{row.rom}</td>
                        <td className="p-3 font-black text-cyan-400">{row.gradeCode}</td>
                        <td className="p-3 font-bold text-emerald-400 font-mono">
                          {formatRupiah(row.estimatedPrice)}
                        </td>
                        <td className="p-3 text-slate-400">
                          {row.error ? <span className="text-rose-400 font-medium">{row.error}</span> : row.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOWNLOAD TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Template Master Harga HP Rusak</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Format kolom: Merek, Tipe HP, Kode Model, RAM, ROM, Grade (A+++, A++, A+, AB, PILIHAN), Harga Estimasi, Catatan.
              </p>
            </div>
            <button
              onClick={downloadDevicePriceTemplate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Template Harga (.xlsx)</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Template Database Kode IC & Memori</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Format kolom: Kode IC, Nama IC, Jenis, Merek, Kapasitas, Model Kompatibel, Catatan Teknisi.
              </p>
            </div>
            <button
              onClick={downloadIcTemplate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Template IC (.xlsx)</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: STAGING REFERENSI BERIZIN */}
      {activeTab === 'staging' && (
        <div className="space-y-6">
          {/* NOTICE TRANSPARANSI & HUKUM */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4" />
              <span>Protokol Pengambilan Data Referensi Terverifikasi</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Target Sumber: <code className="bg-slate-950 px-2 py-0.5 rounded text-cyan-300">https://hprusakjadicuan.com/</code><br />
              Sistem beroperasi dengan prinsip kepatuhan hukum: hanya memproses berkas ekspor sah, API publik resmi, atau data staging manual yang telah disetujui. Tidak melakukan penembusan CAPTCHA atau scraping liar tanpa izin. Semua data harus diverifikasi sebelum masuk ke master database.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs">
              <span className="font-bold text-white">Tabel Staging Antrean Referensi</span>
              <span className="text-slate-400 text-[11px]">{stagingList.length} Entri Tercatat</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Sumber & Tipe</th>
                    <th className="p-3.5">Isi Ringkasan Data</th>
                    <th className="p-3.5">Metode</th>
                    <th className="p-3.5">Status Verifikasi</th>
                    <th className="p-3.5">Catatan Verifikator</th>
                    <th className="p-3.5 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {stagingList.map((stg) => (
                    <tr key={stg.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <span className="text-[10px] uppercase font-bold text-cyan-400 block">{stg.data_type}</span>
                        <span className="text-[11px] text-slate-400 truncate max-w-xs block">{stg.source_url}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">
                          {stg.raw_payload.device || stg.raw_payload.chip_code || stg.raw_payload.name || 'Data Paket'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {stg.raw_payload.grade ? `Grade ${stg.raw_payload.grade} - ${formatRupiah(stg.raw_payload.price_estimated)}` : stg.raw_payload.compatible || ''}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {stg.fetch_method}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          stg.status === 'imported'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : stg.status === 'verified'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : stg.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {stg.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {stg.verification_notes || '-'}
                      </td>
                      <td className="p-3.5 text-right">
                        {stg.status === 'pending' || stg.status === 'verified' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveStaging(stg)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold"
                            >
                              Setujui & Impor
                            </button>
                            <button
                              onClick={() => handleRejectStaging(stg)}
                              className="px-2 py-1 bg-slate-800 hover:bg-rose-900 text-rose-300 rounded text-[11px]"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPORT FULL DATABASE */}
      {activeTab === 'export' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <FileDown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Ekspor Seluruh Database Harga</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Unduh seluruh daftar merek, model HP, varian memori, grade, dan patokan harga aktif ke dalam file format Excel (.xlsx) untuk backup atau analisa offline.
            </p>
          </div>
          <button
            onClick={handleExportFullDatabase}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Sekarang (.xlsx)</span>
          </button>
        </div>
      )}
    </div>
  );
};
