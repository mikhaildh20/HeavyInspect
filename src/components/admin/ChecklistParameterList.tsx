'use client';

import { useState } from 'react';
import { ChecklistParameterForm } from './ChecklistParameterForm';
import { Plus, Edit2, Trash2, ClipboardList } from 'lucide-react';
import { ConfirmModal } from '@/components/layout/ConfirmModal';

interface ChecklistParameter {
  id: number;
  category: string;
  description: string;
  isActive: boolean;
}

interface ChecklistParameterListProps {
  parameters: ChecklistParameter[];
}

export function ChecklistParameterList({ parameters: initialParameters }: ChecklistParameterListProps) {
  const [parameters, setParameters] = useState(initialParameters);
  const [showForm, setShowForm] = useState(false);
  const [editingParameter, setEditingParameter] = useState<ChecklistParameter | null>(null);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    loading: boolean;
    action: () => Promise<void>;
  }>({ open: false, title: '', message: '', loading: false, action: async () => {} });

  const handleEdit = (param: ChecklistParameter) => {
    setEditingParameter(param);
    setShowForm(true);
  };

  const handleDelete = (paramId: number) => {
    setConfirmState({
      open: true,
      title: 'Hapus Parameter',
      message: 'Yakin ingin menghapus parameter ini?',
      loading: false,
      action: async () => {
        setConfirmState(prev => ({ ...prev, loading: true }));
        try {
          const res = await fetch(`/api/admin/checklist/${paramId}`, { method: 'DELETE' });
          if (res.ok) {
            setParameters(parameters.filter(p => p.id !== paramId));
          }
        } catch (error) {
          console.error('Delete error:', error);
        } finally {
          setConfirmState(prev => ({ ...prev, open: false, loading: false }));
        }
      },
    });
  };

  const handleSave = (savedParam: { id?: number; category: string; description: string; isActive: boolean }) => {
    if (editingParameter && savedParam.id) {
      setParameters(parameters.map(p => p.id === savedParam.id ? { ...savedParam, id: savedParam.id } : p));
    } else if (savedParam.id) {
      setParameters([...parameters, { ...savedParam, id: savedParam.id }]);
    }
    setShowForm(false);
    setEditingParameter(null);
  };

  if (showForm) {
    return (
      <ChecklistParameterForm
        parameter={editingParameter}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditingParameter(null); }}
      />
    );
  }

  const groupedByCategory = parameters.reduce((acc, param) => {
    if (!acc[param.category]) {
      acc[param.category] = [];
    }
    acc[param.category].push(param);
    return acc;
  }, {} as Record<string, ChecklistParameter[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Parameter Checklist</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Tambah Parameter
        </button>
      </div>

      {Object.entries(groupedByCategory).map(([category, params]) => (
        <div key={category} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-900 border-b border-gray-700">
            <h3 className="font-medium text-white flex items-center gap-2">
              <ClipboardList size={16} className="text-primary" />
              {category}
            </h3>
          </div>
          <div className="divide-y divide-gray-700">
            {params.map((param) => (
              <div key={param.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-750 transition-colors">
                <div className="flex-1">
                  <p className="text-white">{param.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status: {param.isActive ? 'Aktif' : 'Nonaktif'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(param)}
                    className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(param.id)}
                    className="p-2 rounded-lg hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {parameters.length === 0 && (
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
          <ClipboardList size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Belum ada parameter checklist.</p>
        </div>
      )}

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        loading={confirmState.loading}
        variant="danger"
        onConfirm={confirmState.action}
        onCancel={() => setConfirmState(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
