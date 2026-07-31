'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, ClipboardCheck, Save, Loader2, X } from 'lucide-react';
import { ConfirmModal } from '@/components/layout/ConfirmModal';

type AssignedItem = {
  id: number;
  unitId: number;
  parameterId: number;
  sortOrder: number;
  isActive: boolean;
  category: string;
  description: string;
};

type Parameter = {
  id: number;
  category: string;
  description: string;
  isActive: boolean;
};

interface UnitChecklistManagerProps {
  unitId: number;
  unitCode: string;
  assignedItems: AssignedItem[];
  allParameters: Parameter[];
}

export function UnitChecklistManager({
  unitId,
  unitCode,
  assignedItems: initialAssigned,
  allParameters,
}: UnitChecklistManagerProps) {
  const [assigned, setAssigned] = useState<AssignedItem[]>(initialAssigned);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedParamId, setSelectedParamId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    loading: boolean;
    action: () => Promise<void>;
  }>({ open: false, title: '', message: '', loading: false, action: async () => {} });

  const assignedParamIds = new Set(assigned.map((a) => a.parameterId));

  const unassigned = allParameters.filter((p) => !assignedParamIds.has(p.id));

  const groupedAssigned = assigned.reduce<Record<string, AssignedItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleAdd = async () => {
    if (!selectedParamId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/units/${unitId}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId,
          parameterId: selectedParamId,
          sortOrder: assigned.length,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setToast({ message: data.error || 'Gagal menambahkan', type: 'error' });
        setTimeout(() => setToast(null), 3000);
        return;
      }
      const param = allParameters.find((p) => p.id === selectedParamId);
      if (param) {
        setAssigned([
          ...assigned,
          {
            id: Date.now(),
            unitId,
            parameterId: selectedParamId,
            sortOrder: assigned.length,
            isActive: true,
            category: param.category,
            description: param.description,
          },
        ]);
      }
      setShowAddModal(false);
      setSelectedParamId(null);
    } catch {
      setToast({ message: 'Gagal terhubung ke server', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (itemId: number) => {
    setConfirmState({
      open: true,
      title: 'Hapus Parameter',
      message: 'Hapus parameter dari master sheet ini?',
      loading: false,
      action: async () => {
        setConfirmState(prev => ({ ...prev, loading: true }));
        try {
          const res = await fetch(`/api/units/${unitId}/checklist`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: itemId }),
          });
          if (res.ok) {
            setAssigned(assigned.filter((a) => a.id !== itemId));
          }
        } catch {
          setToast({ message: 'Gagal terhubung ke server', type: 'error' });
          setTimeout(() => setToast(null), 3000);
        } finally {
          setConfirmState(prev => ({ ...prev, open: false, loading: false }));
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-primary">Master Sheet</span> menentukan parameter checklist mana yang muncul saat inspeksi unit ini. 
          Jika belum ada parameter, form inspeksi akan menggunakan semua parameter aktif.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">
            {assigned.length} parameter{assigned.length !== 1 ? 's' : ''} assigned
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black font-semibold rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={18} />
          Tambah Parameter
        </button>
      </div>

      {assigned.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
          <ClipboardCheck size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Belum ada parameter untuk unit ini.</p>
          <p className="text-gray-500 text-sm mt-2">
            Klik &quot;Tambah Parameter&quot; untuk menambahkan item checklist.
          </p>
        </div>
      ) : (
        Object.entries(groupedAssigned).map(([category, items]) => (
          <div key={category} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-900 border-b border-gray-700 flex items-center gap-2">
              <ClipboardCheck size={16} className="text-primary" />
              <h3 className="font-medium text-white">{category}</h3>
              <span className="text-xs text-gray-500 ml-auto">{items.length} items</span>
            </div>
            <div className="divide-y divide-gray-700">
              {items.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-750 transition-colors">
                  <div className="flex items-center gap-3">
                    <GripVertical size={16} className="text-gray-600" />
                    <span className="text-white">{item.description}</span>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={saving}
                    className="p-2 rounded-lg hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-gray-800 border border-gray-700 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tambah Parameter</h3>
              <button
                onClick={() => { setShowAddModal(false); setSelectedParamId(null); }}
                className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span className="text-gray-400 text-xl">&times;</span>
              </button>
            </div>

            {unassigned.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">
                Semua parameter sudah ditambahkan ke unit ini.
              </p>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">Pilih Parameter</label>
                <select
                  value={selectedParamId ?? ''}
                  onChange={(e) => setSelectedParamId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Pilih --</option>
                  {Object.entries(
                    unassigned.reduce<Record<string, Parameter[]>>((acc, p) => {
                      if (!acc[p.category]) acc[p.category] = [];
                      acc[p.category].push(p);
                      return acc;
                    }, {})
                  ).map(([cat, params]) => (
                    <optgroup key={cat} label={cat}>
                      {params.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.description}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                <button
                  onClick={handleAdd}
                  disabled={!selectedParamId || saving}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-black hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Menambahkan...' : 'Tambahkan'}
                </button>
              </div>
            )}
          </div>
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

      {toast && (
        <div className={`fixed bottom-4 right-4 z-[200] px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-green-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
