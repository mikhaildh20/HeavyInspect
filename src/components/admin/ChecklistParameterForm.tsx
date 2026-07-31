'use client';

import { useState } from 'react';
import { Save, X } from 'lucide-react';

interface ChecklistParameter {
  id?: number;
  category: string;
  description: string;
  isActive: number;
}

interface ChecklistParameterFormProps {
  parameter: ChecklistParameter | null;
  onSave: (parameter: ChecklistParameter) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'Engine',
  'Hydraulic',
  'Undercarriage',
  'Electric',
  'Safety',
  'Body',
  'Fluid',
];

export function ChecklistParameterForm({ parameter, onSave, onCancel }: ChecklistParameterFormProps) {
  const [formData, setFormData] = useState({
    category: parameter?.category || CATEGORIES[0],
    description: parameter?.description || '',
    isActive: parameter?.isActive ?? 1,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = parameter?.id ? `/api/admin/checklist/${parameter.id}` : '/api/admin/checklist';
      const method = parameter?.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const savedParam = await res.json();
        onSave(savedParam);
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
        {parameter ? 'Edit Parameter' : 'Tambah Parameter Baru'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Kategori</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Deskripsi</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
            rows={3}
            placeholder="Contoh: Periksa level oli mesin"
            required
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
