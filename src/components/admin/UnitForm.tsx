'use client';

import { useState } from 'react';
import { Save, X } from 'lucide-react';

interface Unit {
  id: number;
  unitCode: string;
  modelName: string;
  lastSmr: number;
  serialNumber: string | null;
  woJono: string | null;
  zone: string | null;
  inspectionStart: string | null;
  isActive: number;
}

interface UnitFormProps {
  unit: Unit | null;
  onSave: (unit: Unit) => void;
  onCancel: () => void;
}

export function UnitForm({ unit, onSave, onCancel }: UnitFormProps) {
  const [formData, setFormData] = useState({
    unitCode: unit?.unitCode || '',
    modelName: unit?.modelName || 'Komatsu PC 200-8',
    lastSmr: unit?.lastSmr || 0,
    serialNumber: unit?.serialNumber || '',
    woJono: unit?.woJono || '',
    zone: unit?.zone || '',
    inspectionStart: unit?.inspectionStart || '',
    isActive: unit?.isActive ?? 1,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = unit?.id ? `/api/admin/units/${unit.id}` : '/api/admin/units';
      const method = unit?.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const savedUnit = await res.json();
        onSave(savedUnit);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h2 className="text-xl font-bold text-white mb-6">
        {unit ? 'Edit Unit' : 'Tambah Unit Baru'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Kode Unit</label>
          <input
            type="text"
            value={formData.unitCode}
            onChange={(e) => setFormData({ ...formData, unitCode: e.target.value })}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
            placeholder="Contoh: PC200-8-001"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Model</label>
          <input
            type="text"
            value={formData.modelName}
            onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">HM Terakhir</label>
            <input
              type="number"
              value={formData.lastSmr}
              onChange={(e) => setFormData({ ...formData, lastSmr: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
              step="0.1"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
            <select
              value={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value={1}>Aktif</option>
              <option value={0}>Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nomor Rangka (S/N)</label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
              placeholder="S/N unit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">WO / JO No.</label>
            <input
              type="text"
              value={formData.woJono}
              onChange={(e) => setFormData({ ...formData, woJono: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
              placeholder="WO/JO number"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Zona</label>
            <input
              type="text"
              value={formData.zone}
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
              placeholder="Zona / lokasi unit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Inspection Start (HM)</label>
            <input
              type="number"
              value={formData.inspectionStart}
              onChange={(e) => setFormData({ ...formData, inspectionStart: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
              step="0.1"
              min="0"
              placeholder="HM awal inspeksi"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Save size={18} />
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            <X size={18} />
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
