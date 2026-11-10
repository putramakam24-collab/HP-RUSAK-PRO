import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Cpu,
  Sparkles
} from 'lucide-react';
import { Grade } from '../../types';
import { StorageService } from '../../lib/storage';

export const GradeManagementPage: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>(() => StorageService.getGrades());
  const currentUser = StorageService.getCurrentUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteriaIcPcb, setCriteriaIcPcb] = useState('');
  const [criteriaLcd, setCriteriaLcd] = useState('');
  const [criteriaCasing, setCriteriaCasing] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);

  const handleOpenModal = (grade?: Grade) => {
    if (grade) {
      setEditingGrade(grade);
      setCode(grade.code);
      setName(grade.name);
      setDescription(grade.description);
      setCriteriaIcPcb(grade.criteria_ic_pcb || '');
      setCriteriaLcd(grade.criteria_lcd || '');
      setCriteriaCasing(grade.criteria_casing || '');
      setSortOrder(grade.sort_order);
    } else {
      setEditingGrade(null);
      setCode('');
      setName('');
      setDescription('');
      setCriteriaIcPcb('');
      setCriteriaLcd('');
      setCriteriaCasing('');
      setSortOrder(grades.length + 1);
    }
    setIsModalOpen(true);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    const newGrade: Grade = {
      id: editingGrade ? editingGrade.id : `g-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      criteria_ic_pcb: criteriaIcPcb.trim(),
      criteria_lcd: criteriaLcd.trim(),
      criteria_casing: criteriaCasing.trim(),
      sort_order: sortOrder,
      is_active: true,
      created_at: editingGrade ? editingGrade.created_at : new Date().toISOString()
    };

    StorageService.saveGrade(newGrade, currentUser.full_name);
    setGrades(StorageService.getGrades());
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Manajemen Kategori Grade</h1>
          <p className="text-xs text-slate-400">
            Kustomisasi grade komponen HP rusak (A+++, A++, A+, AB, Pilihan) sesuai kriteria toko.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Grade Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {grades.map((grade) => (
          <div
            key={grade.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-cyan-400">
                  Grade {grade.code}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  Urutan: #{grade.sort_order}
                </span>
              </div>

              <h3 className="font-bold text-white text-sm">
                {grade.name}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {grade.description}
              </p>

              <div className="space-y-2 pt-1 text-[11px]">
                {grade.criteria_ic_pcb && (
                  <div className="text-slate-400">
                    <strong className="text-slate-200">IC/PCB:</strong> {grade.criteria_ic_pcb}
                  </div>
                )}
                {grade.criteria_lcd && (
                  <div className="text-slate-400">
                    <strong className="text-slate-200">LCD:</strong> {grade.criteria_lcd}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => handleOpenModal(grade)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Ubah Kriteria</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDIT / CREATE GRADE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingGrade ? `Ubah Grade ${editingGrade.code}` : 'Tambah Grade Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kode Grade *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Contoh: A+++, B+, PILIHAN"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Urutan Prioritas</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap Grade *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Grade A++ (Mesin Hidup LCD Pecah)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deskripsi Kondisi Unit</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan kondisi fisik & kelayakan part..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kriteria Motherboard & IC</label>
                <input
                  type="text"
                  value={criteriaIcPcb}
                  onChange={(e) => setCriteriaIcPcb(e.target.value)}
                  placeholder="Kaleng penutup IC utuh, belum kena blower teknisi..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kriteria Layar LCD</label>
                <input
                  type="text"
                  value={criteriaLcd}
                  onChange={(e) => setCriteriaLcd(e.target.value)}
                  placeholder="LCD pecah/blank atau original normal..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
                >
                  Simpan Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
