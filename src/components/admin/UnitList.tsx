'use client';

import { useState } from 'react';
import { UnitForm } from './UnitForm';
import { Plus, Edit2, Trash2, Box } from 'lucide-react';
import { ConfirmModal } from '@/components/layout/ConfirmModal';

interface Unit {
  id: number;
  unitCode: string;
  modelName: string;
  lastSmr: number;
  serialNumber: string | null;
  woJono: string | null;
  zone: string | null;
  inspectionStart: string | null;
  isActive: boolean;
}

interface UnitListProps {
  units: Unit[];
}

export function UnitList({ units: initialUnits }: UnitListProps) {
  const [units, setUnits] = useState(initialUnits);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    loading: boolean;
    action: () => Promise<void>;
  }>({ open: false, title: '', message: '', loading: false, action: async () => {} });

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setShowForm(true);
  };

  const handleDelete = (unitId: number) => {
    setConfirmState({
      open: true,
      title: 'Hapus Unit',
      message: 'Yakin ingin menghapus unit ini?',
      loading: false,
      action: async () => {
        setConfirmState(prev => ({ ...prev, loading: true }));
        try {
          const res = await fetch(`/api/admin/units/${unitId}`, { method: 'DELETE' });
          if (res.ok) {
            setUnits(units.filter(u => u.id !== unitId));
          }
        } catch (error) {
          console.error('Delete error:', error);
        } finally {
          setConfirmState(prev => ({ ...prev, open: false, loading: false }));
        }
      },
    });
  };

  const handleSave = (savedUnit: Unit) => {
    if (editingUnit && savedUnit.id) {
      setUnits(units.map(u => u.id === savedUnit.id ? { ...savedUnit, id: savedUnit.id } : u));
    } else if (savedUnit.id) {
      setUnits([...units, { ...savedUnit, id: savedUnit.id }]);
    }
    setShowForm(false);
    setEditingUnit(null);
  };

  if (showForm) {
    return (
      <UnitForm
        unit={editingUnit}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditingUnit(null); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Data Unit</h2>
          <p className="text-sm text-gray-400">Kelola unit heavy equipment</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Tambah Unit
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Kode Unit</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Model</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">SMR Terakhir</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {units.map((unit) => (
                <tr key={unit.id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Box size={16} className="text-primary" />
                      <span className="text-white font-medium">{unit.unitCode}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{unit.modelName}</td>
                  <td className="px-4 py-3 text-gray-400">{unit.lastSmr.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      unit.isActive 
                        ? 'bg-green-900/50 text-green-400 border border-green-700' 
                        : 'bg-gray-700 text-gray-400 border border-gray-600'
                    }`}>
                      {unit.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(unit)}
                        className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(unit.id)}
                        className="p-2 rounded-lg hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {units.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Belum ada data unit.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
