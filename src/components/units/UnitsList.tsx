'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Box, Edit2, Trash2, Eye, EyeOff, Printer, ClipboardCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { UnitForm } from '@/components/admin/UnitForm';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

type Unit = {
  id: number;
  unitCode: string;
  modelName: string;
  lastSmr: number;
  serialNumber: string | null;
  woJono: string | null;
  zone: string | null;
  inspectionStart: string | null;
  isActive: number;
};

interface UnitsListProps {
  units: Unit[];
  role?: string;
}

export function UnitsList({ units: initialUnits, role }: UnitsListProps) {
  const [units, setUnits] = useState(initialUnits);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [showQR, setShowQR] = useState<number | null>(null);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning';
    loading: boolean;
    action: () => Promise<void>;
  }>({ open: false, title: '', message: '', variant: 'danger', loading: false, action: async () => {} });

  const canManage = role === 'leader' || role === 'admin';

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setShowForm(true);
  };

  const handleDelete = (unit: Unit) => {
    setConfirmState({
      open: true,
      title: 'Hapus Unit',
      message: `Yakin ingin menghapus unit "${unit.unitCode}"? Tindakan ini tidak dapat dibatalkan.`,
      variant: 'danger',
      loading: false,
      action: async () => {
        setConfirmState(prev => ({ ...prev, loading: true }));
        try {
          const res = await fetch(`/api/leader/units/${unit.id}`, { method: 'DELETE' });
          if (res.ok) {
            setUnits(units.filter(u => u.id !== unit.id));
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

  const handlePrint = (unit: Unit) => {
    const qrValue = unit.unitCode;
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(container);
      root.render(
        <QRCodeSVG value={qrValue} size={200} level="H" includeMargin />
      );

      setTimeout(() => {
        const svgHtml = container.innerHTML;
        root.unmount();
        document.body.removeChild(container);

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>QR Code - ${unit.unitCode}</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
              .card { text-align: center; padding: 40px; border: 2px solid #333; border-radius: 12px; }
              h1 { font-size: 24px; margin-bottom: 8px; }
              p { font-size: 14px; color: #666; margin-bottom: 24px; }
              .qr { margin: 20px auto; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>${unit.unitCode}</h1>
              <p>${unit.modelName}</p>
              <div class="qr">${svgHtml}</div>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }, 300);
    });
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
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Data Unit</h2>
            <p className="text-sm text-gray-400">Kelola unit heavy equipment</p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Tambah Unit
            </button>
          )}
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
                        {canManage && (
                          <>
                            <button
                              onClick={() => handleEdit(unit)}
                              className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(unit)}
                              className="p-2 rounded-lg hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        <Link
                          href={`/units/${unit.unitCode}/checklist`}
                          className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          title="Master Sheet"
                        >
                          <ClipboardCheck size={16} />
                        </Link>
                        <button
                          onClick={() => setShowQR(showQR === unit.id ? null : unit.id)}
                          className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          title="QR Code"
                        >
                          {showQR === unit.id ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handlePrint(unit)}
                          className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          title="Print QR"
                        >
                          <Printer size={16} />
                        </button>
                        <Link
                          href={`/scan?unit=${unit.unitCode}`}
                          className="p-2 rounded-lg bg-primary text-black hover:bg-primary-dark transition-colors"
                          title="Inspect"
                        >
                          <ExternalLink size={16} />
                        </Link>
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

      {showQR !== null && (() => {
        const unit = units.find(u => u.id === showQR);
        if (!unit) return null;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-sm rounded-2xl bg-gray-800 border border-gray-700 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">QR Code - {unit.unitCode}</h3>
                <button onClick={() => setShowQR(null)} className="p-1 rounded-lg hover:bg-gray-700 transition-colors">
                  <span className="text-gray-400 text-xl">&times;</span>
                </button>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-xl">
                  <QRCodeSVG value={unit.unitCode} size={180} level="H" includeMargin />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Scan to start inspection</p>
                  <p className="text-xs text-gray-500 mt-1 font-mono">{unit.unitCode}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        loading={confirmState.loading}
        confirmLabel="Hapus"
        onConfirm={confirmState.action}
        onCancel={() => setConfirmState(prev => ({ ...prev, open: false, loading: false }))}
      />
    </>
  );
}
