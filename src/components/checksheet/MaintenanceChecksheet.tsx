'use client';

import { useState } from 'react';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import { PhotoCapture } from '@/components/p2h/PhotoCapture';

type ChecklistItem = {
  id: number;
  category: string;
  description: string;
};

type ResultValue = 'G' | 'B' | 'U';

interface MaintenanceChecksheetProps {
  unitCode: string;
  modelName: string;
  reportId: number;
  checklist: ChecklistItem[];
}

const CONDITION_OPTIONS = [
  { code: 'G', label: 'Baik', color: 'bg-green-600 text-white' },
  { code: 'B', label: 'Buruk', color: 'bg-yellow-500 text-black' },
  { code: 'U', label: 'Belum Dicek', color: 'bg-red-500 text-white' },
] as const;

const PRIORITY_CONDITIONS = [
  { code: 1, label: 'Bocor' },
  { code: 2, label: 'Rusak' },
  { code: 3, label: 'Hilang' },
  { code: 4, label: 'Longgar' },
  { code: 5, label: 'Aus' },
  { code: 6, label: 'Retak' },
  { code: 7, label: 'Lainnya' },
];

const ACTION_CODES = [
  { code: 1, label: 'Tindakan sekarang' },
  { code: 2, label: 'Tindakan saat ganti shift' },
  { code: 3, label: 'Tindakan pada PS berikutnya' },
  { code: 4, label: 'Tindakan pada jadwal backlog' },
];

export function MaintenanceChecksheet({
  unitCode,
  modelName,
  reportId,
  checklist,
}: MaintenanceChecksheetProps) {
  const [results, setResults] = useState<Record<number, { condition: ResultValue | ''; note: string; priority: number | null; photoUrl?: string }>>({});
  const [fluidAdditions, setFluidAdditions] = useState<{ type: string; quantity: number }[]>([
    { type: '', quantity: 0 },
  ]);

  const grouped = checklist.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const updateResult = (paramId: number, field: string, value: string | number | null) => {
    setResults((prev) => ({
      ...prev,
      [paramId]: {
        condition: prev[paramId]?.condition || '',
        note: prev[paramId]?.note || '',
        priority: prev[paramId]?.priority ?? null,
        photoUrl: prev[paramId]?.photoUrl,
        [field]: value,
      },
    }));
  };

  const stats = {
    total: checklist.length,
    g: Object.values(results).filter((r) => r.condition === 'G').length,
    b: Object.values(results).filter((r) => r.condition === 'B').length,
    unchecked: checklist.length - Object.values(results).filter((r) => r.condition).length,
  };

  const handleSubmit = () => {
    const form = new FormData();
    form.append('reportId', reportId.toString());
    form.append('results', JSON.stringify(results));
    form.append('fluids', JSON.stringify(fluidAdditions.filter((f) => f.type)));

    fetch('/api/p2h/submit-checksheet', {
      method: 'POST',
      body: form,
    }).then((res) => {
      if (res.ok) window.location.href = '/dashboard';
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <p className="font-bold text-white mb-1">Kondisi</p>
            <p className="text-gray-300"><span className="text-green-400 font-bold">G</span> = Kondisi Baik</p>
            <p className="text-gray-300"><span className="text-yellow-400 font-bold">B</span> = Kondisi Buruk</p>
            <p className="text-gray-300"><span className="text-red-400 font-bold">U</span> = Belum Dicek</p>
          </div>
          <div>
            <p className="font-bold text-white mb-1">Prioritas Kondisi</p>
            {PRIORITY_CONDITIONS.map(p => (
              <p key={p.code} className="text-gray-300">{p.code} = {p.label}</p>
            ))}
          </div>
          <div>
            <p className="font-bold text-white mb-1">Tindakan</p>
            {ACTION_CODES.map(a => (
              <p key={a.code} className="text-gray-300">{a.code} = {a.label}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-green-400 font-bold">{stats.g} Baik</span>
          <span className="text-yellow-400 font-bold">{stats.b} Buruk</span>
          <span className="text-gray-400">{stats.unchecked} belum dicek</span>
          <span className="text-gray-500 ml-auto">{stats.total} item</span>
        </div>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-900 border-b border-gray-700">
            <h3 className="font-semibold text-white">{category}</h3>
          </div>

          <div className="hidden md:grid grid-cols-[auto_1fr_80px_1fr_80px_100px] gap-2 p-3 bg-gray-900/50 text-xs font-medium text-gray-400 border-b border-gray-700">
            <span className="w-8">#</span>
            <span>Deskripsi</span>
            <span className="text-center">Kondisi</span>
            <span>Note</span>
            <span className="text-center">Prioritas</span>
            <span className="text-center">Foto</span>
          </div>

          {items.map((item, idx) => {
            const result = results[item.id];
            return (
              <div key={item.id} className="border-t border-gray-700/50 p-3">
                <div className="md:grid md:grid-cols-[auto_1fr_80px_1fr_80px_100px] md:gap-2 md:items-center space-y-3 md:space-y-0">
                  <span className="text-xs text-gray-500 w-8 hidden md:block">{idx + 1}</span>
                  <span className="text-sm text-gray-300 font-medium">{item.description}</span>

                  <div className="flex gap-1">
                    {CONDITION_OPTIONS.map(opt => (
                      <button
                        key={opt.code}
                        type="button"
                        onClick={() => updateResult(item.id, 'condition', opt.code)}
                        className={`flex-1 py-2 rounded text-xs font-bold transition-all ${
                          result?.condition === opt.code
                            ? opt.color
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {opt.code}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Catatan..."
                    value={result?.note || ''}
                    onChange={(e) => updateResult(item.id, 'note', e.target.value)}
                    className="p-2 bg-gray-900 border border-gray-600 rounded text-xs text-white placeholder-gray-500 focus:border-primary outline-none"
                  />

                  <div className="flex gap-1">
                    {ACTION_CODES.map(a => (
                      <button
                        key={a.code}
                        type="button"
                        onClick={() => updateResult(item.id, 'priority', a.code)}
                        className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                          result?.priority === a.code
                            ? 'bg-primary text-black'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                        title={a.label}
                      >
                        {a.code}
                      </button>
                    ))}
                  </div>

                  <div>
                    {result?.condition === 'B' ? (
                      result?.photoUrl ? (
                        <div className="relative inline-block">
                          <img src={result.photoUrl} alt="" className="w-10 h-10 object-cover rounded border border-green-500" />
                          <button
                            type="button"
                            onClick={() => updateResult(item.id, 'photoUrl', null)}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center"
                          >
                            <Trash2 size={10} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-red-500 rounded p-1">
                          <PhotoCapture
                            onCapture={(url) => updateResult(item.id, 'photoUrl', url)}
                            compact
                          />
                        </div>
                      )
                    ) : (
                      <span className="text-gray-600 text-xs">-</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <h3 className="font-semibold text-white mb-3">Penambahan Fluida (Oli, Coolant, Grease)</h3>
        {fluidAdditions.map((fluid, idx) => (
          <div key={idx} className="grid grid-cols-[40px_1fr_120px_40px] gap-2 mb-2 items-center">
            <span className="text-gray-400 text-sm">{idx + 1}</span>
            <input
              type="text"
              placeholder="Contoh: Oli, Coolant, Grease"
              value={fluid.type}
              onChange={(e) => {
                const updated = [...fluidAdditions];
                updated[idx].type = e.target.value;
                setFluidAdditions(updated);
              }}
              className="p-2 bg-gray-900 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-primary outline-none"
            />
            <input
              type="number"
              placeholder="0"
              value={fluid.quantity || ''}
              onChange={(e) => {
                const updated = [...fluidAdditions];
                updated[idx].quantity = parseFloat(e.target.value) || 0;
                setFluidAdditions(updated);
              }}
              className="p-2 bg-gray-900 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-primary outline-none"
            />
            {idx === fluidAdditions.length - 1 && fluid.type && (
              <button
                type="button"
                onClick={() => setFluidAdditions([...fluidAdditions, { type: '', quantity: 0 }])}
                className="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm flex items-center justify-center"
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
