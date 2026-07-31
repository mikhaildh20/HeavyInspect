'use client';

import { useState, useEffect, useCallback } from 'react';
import { Camera, AlertTriangle, Trash2, CheckCircle, XCircle, WifiOff } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { PhotoCapture } from './PhotoCapture';
import { useRouter } from 'next/navigation';
import { submitP2HReport } from '@/actions/p2h';
import { useGeolocation } from '@/hooks/useGeolocation';

type ChecklistItem = {
  id: number;
  category: string;
  description: string;
};

interface P2HFormProps {
  unitId: string;
  modelName: string;
  checklist: ChecklistItem[];
  lastSmr: number;
  serialNumber?: string;
  woJono?: string;
  zone?: string;
  inspectionStart?: string;
}

const CONDITION_OPTIONS = [
  { code: 'G', label: 'Good Condition', color: 'bg-green-600 text-white' },
  { code: 'B', label: 'Bad Condition', color: 'bg-yellow-500 text-black' },
  { code: 'U', label: 'Replace', color: 'bg-red-500 text-white' },
] as const;

const PRIORITY_CONDITIONS = [
  { code: 1, label: 'Leaking' },
  { code: 2, label: 'Broken' },
  { code: 3, label: 'Missing' },
  { code: 4, label: 'Loose' },
  { code: 5, label: 'Worn' },
  { code: 6, label: 'Crack' },
  { code: 7, label: 'Others' },
];

const ACTION_CODES = [
  { code: 1, label: 'Action now' },
  { code: 2, label: 'Action at change shift' },
  { code: 3, label: 'Action on next PS' },
  { code: 4, label: 'Action on schedule backlog' },
];

export function P2HForm({ unitId, modelName, checklist, lastSmr, serialNumber: defaultSn = '', woJono: defaultWoJo = '', zone: defaultZone = '', inspectionStart = '' }: P2HFormProps) {
  const router = useRouter();
  const [smr, setSmr] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [woJono, setWoJoNo] = useState('');
  const [zone, setZone] = useState('');
  const [inspectionTime, setInspectionTime] = useState('');
  const [results, setResults] = useState<Record<number, { condition: string; note: string; priority: number | null; photo: string | null }>>({});
  const [fluids, setFluids] = useState<{ type: string; quantity: string }[]>([{ type: '', quantity: '' }]);
  const [signature, setSignature] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [modal, setModal] = useState<{ type: 'success' | 'error' | 'offline'; message: string } | null>(null);
  const { latitude, longitude, accuracy, error: gpsError, loading: gpsLoading, timestamp: gpsTimestamp, captureLocation } = useGeolocation();

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const draft = localStorage.getItem(`p2h_draft_${unitId}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setSmr(parsed.smr || '');
        setSerialNumber(parsed.serialNumber || defaultSn);
        setWoJoNo(parsed.woJono || defaultWoJo);
        setZone(parsed.zone || defaultZone);
        setInspectionTime(parsed.inspectionTime || '');
        setResults(parsed.results || {});
        setFluids(parsed.fluids || [{ type: '', quantity: '' }]);
        return;
      } catch {
        console.error('Failed to parse draft');
      }
    }
    if (defaultSn) setSerialNumber(defaultSn);
    if (defaultWoJo) setWoJoNo(defaultWoJo);
    if (defaultZone) setZone(defaultZone);
  }, [unitId, defaultSn, defaultWoJo, defaultZone]);

  useEffect(() => {
    captureLocation();
  }, [captureLocation]);

  useEffect(() => {
    const draft = { smr, serialNumber, woJono, zone, inspectionTime, results, fluids };
    localStorage.setItem(`p2h_draft_${unitId}`, JSON.stringify(draft));
  }, [smr, serialNumber, woJono, zone, inspectionTime, results, fluids, unitId]);

  useEffect(() => {
    if (!inspectionTime && !isOffline) {
      const now = new Date();
      setInspectionTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    }
  }, [inspectionTime, isOffline]);

  const updateResult = useCallback((paramId: number, field: string, value: string | number | null) => {
    setResults(prev => ({
      ...prev,
      [paramId]: {
        condition: prev[paramId]?.condition || '',
        note: prev[paramId]?.note || '',
        priority: prev[paramId]?.priority ?? null,
        photo: prev[paramId]?.photo || null,
        [field]: value,
      },
    }));
  }, []);

  const handlePhotoCapture = useCallback((paramId: number, photoBase64: string) => {
    updateResult(paramId, 'photo', photoBase64);
  }, [updateResult]);

  const handlePhotoDelete = useCallback((paramId: number) => {
    updateResult(paramId, 'photo', null);
  }, [updateResult]);

  const isSubmitDisabled = () => {
    const smrNum = smr === '' ? NaN : Number(smr);
    if (isNaN(smrNum) || smrNum < 0 || !signature) return true;
    for (const item of checklist) {
      const state = results[item.id];
      if (!state || !state.condition) return true;
      if ((state.condition === 'B') && !state.photo) return true;
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled()) return;

    if (isOffline) {
      setModal({ type: 'offline', message: 'Data disimpan lokal karena offline. Sistem akan sinkronisasi saat koneksi pulih.' });
      return;
    }

    if (!signature) return;

    const checklistData: Record<string, { status: string; photo?: string | null }> = {};
    for (const item of checklist) {
      const state = results[item.id];
      checklistData[String(item.id)] = {
        status: state?.condition || 'U',
        photo: state?.photo || null,
      };
    }

    const res = await submitP2HReport({
      unitCode: unitId,
      smr,
      checklist: checklistData,
      signature,
      gpsLatitude: latitude,
      gpsLongitude: longitude,
      gpsAccuracy: accuracy,
      gpsTimestamp: gpsTimestamp ? new Date(gpsTimestamp).toISOString() : null,
    });

    if (res.error) {
      setModal({ type: 'error', message: res.error });
      return;
    }

    localStorage.removeItem(`p2h_draft_${unitId}`);
    setModal({ type: 'success', message: 'Laporan P2H Berhasil Disubmit!' });
  };

  const hour = String(new Date().getHours()).padStart(2, '0');
  const formNo = `${modelName.replace(/\s+/g, '')}/${new Date().getFullYear()}/QA${hour}`;
  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const groupedChecklist = checklist.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6 pb-8 max-w-4xl mx-auto">
      {isOffline && (
        <div className="bg-yellow-600 text-white p-3 rounded-lg text-sm flex items-center gap-2 font-medium sticky top-16 z-10">
          <AlertTriangle size={18} />
          Mode Offline: Data Tersimpan Lokal
        </div>
      )}

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-white uppercase">Daily Inspection Sheet</h2>
          <p className="text-primary font-semibold">{modelName}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Form No.</p>
            <p className="font-mono text-white">{formNo}</p>
          </div>
          <div>
            <p className="text-gray-400">QA 10 - Maintenance Sheet</p>
          </div>
          <div>
            <p className="text-gray-400">Date</p>
            <p className="text-white">{today}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Unit Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Code Unit</label>
            <input type="text" value={unitId} disabled className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">S/N Unit</label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Serial Number"
              disabled={!!defaultSn}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">HM (Hour Meter)</label>
            <input
              type="number"
              step="0.1"
              min={lastSmr}
              value={smr}
              onChange={(e) => setSmr(e.target.value)}
              placeholder={lastSmr > 0 ? `Min: ${lastSmr}` : '0'}
              className="w-full bg-gray-900 border-2 border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
            />
            {lastSmr > 0 && (
              <p className="text-xs text-gray-500 mt-1">HM sebelumnya: {lastSmr.toLocaleString()}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">WO/JO No. & Zone</label>
            <input
              type="text"
              value={woJono}
              onChange={(e) => setWoJoNo(e.target.value)}
              placeholder="WO/JO Number"
              disabled={!!defaultWoJo}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white disabled:opacity-60 disabled:cursor-not-allowed mb-2"
            />
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="e.g. Zone 2: Lower Rear Area"
              disabled={!!defaultZone}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Inspection Time Start</label>
            <input
              type="time"
              value={inspectionTime}
              onChange={(e) => setInspectionTime(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <p className="font-bold text-white mb-1">Condition</p>
            <p className="text-gray-300"><span className="text-green-400 font-bold">G</span> = Good Condition</p>
            <p className="text-gray-300"><span className="text-yellow-400 font-bold">B</span> = Bad Condition</p>
            <p className="text-gray-300"><span className="text-red-400 font-bold">U</span> = Replace</p>
          </div>
          <div>
            <p className="font-bold text-white mb-1">Priority Condition</p>
            {PRIORITY_CONDITIONS.map(p => (
              <p key={p.code} className="text-gray-300">{p.code} = {p.label}</p>
            ))}
          </div>
          <div>
            <p className="font-bold text-white mb-1">Action</p>
            {ACTION_CODES.map(a => (
              <p key={a.code} className="text-gray-300">{a.code} = {a.label}</p>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-2">Inspection Checklist</h3>

        <div className="space-y-4">
          {Object.entries(groupedChecklist).map(([category, items]) => (
            <div key={category} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-4 py-3 bg-gray-900 border-b border-gray-700">
                <h4 className="font-semibold text-white">{category}</h4>
              </div>

              <div className="hidden md:grid grid-cols-[auto_1fr_80px_1fr_80px_100px] gap-2 p-3 bg-gray-900/50 text-xs font-medium text-gray-400 border-b border-gray-700">
                <span className="w-8">#</span>
                <span>Description</span>
                <span className="text-center">Condition</span>
                <span>Note</span>
                <span className="text-center">Priority</span>
                <span className="text-center">Foto</span>
              </div>

              {items.map((item, idx) => {
                const state = results[item.id];
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
                            onClick={() => {
                              if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(20);
                              updateResult(item.id, 'condition', opt.code);
                            }}
                            className={`flex-1 py-2 rounded text-xs font-bold transition-all ${
                              state?.condition === opt.code
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
                        placeholder="Note..."
                        value={state?.note || ''}
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
                              state?.priority === a.code
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
                        {state?.condition === 'B' ? (
                          state?.photo ? (
                            <div className="relative inline-block">
                              <img src={state.photo} alt="" className="w-10 h-10 object-cover rounded border border-green-500" />
                              <button
                                type="button"
                                onClick={() => handlePhotoDelete(item.id)}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center"
                              >
                                <Trash2 size={10} className="text-white" />
                              </button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-red-500 rounded p-1">
                              <PhotoCapture onCapture={(photo) => handlePhotoCapture(item.id, photo)} compact />
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
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <h4 className="font-semibold text-white mb-3">Additional Fluids (Oil, Coolant, Grease)</h4>
        <div className="hidden md:grid grid-cols-[40px_1fr_120px_40px] gap-2 text-xs font-medium text-gray-400 mb-2">
          <span>No</span>
          <span>Fluid Type</span>
          <span>Quantity (Liter)</span>
          <span></span>
        </div>
        {fluids.map((fluid, idx) => (
          <div key={idx} className="grid grid-cols-[40px_1fr_120px_70px] gap-2 mb-2 items-center">
            <span className="text-gray-400 text-sm">{idx + 1}</span>
            <select
              value={fluid.type}
              onChange={(e) => {
                const updated = [...fluids];
                updated[idx].type = e.target.value;
                setFluids(updated);
              }}
              className="p-2 bg-gray-900 border border-gray-600 rounded text-sm text-white focus:border-primary outline-none"
            >
              <option value="">Pilih jenis</option>
              <option value="Oil">Oil</option>
              <option value="Coolant">Coolant</option>
              <option value="Grease">Grease</option>
            </select>
            <input
              type="number"
              placeholder="0"
              value={fluid.quantity}
              onChange={(e) => {
                const updated = [...fluids];
                updated[idx].quantity = e.target.value;
                setFluids(updated);
              }}
              className="p-2 bg-gray-900 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-primary outline-none"
            />
            <div className="flex gap-1">
              {idx === fluids.length - 1 && (
                <button
                  type="button"
                  onClick={() => setFluids([...fluids, { type: '', quantity: '' }])}
                  className="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm flex items-center justify-center"
                >
                  +
                </button>
              )}
              {fluids.length > 1 && (
                <button
                  type="button"
                  onClick={() => setFluids(fluids.filter((_, i) => i !== idx))}
                  className="w-7 h-7 bg-red-900/50 hover:bg-red-800 rounded text-red-400 text-sm flex items-center justify-center"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <label className="block text-lg font-bold text-white mb-4">Tanda Tangan Mekanik</label>
        <SignaturePad onSign={setSignature} />
      </div>

      <button
        type="submit"
        disabled={isSubmitDisabled()}
        className={`w-full py-3 rounded-xl font-bold text-lg transition-colors ${
          isSubmitDisabled()
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-primary text-black shadow-lg shadow-primary/20 hover:bg-primary-dark'
        }`}
      >
        {isOffline ? 'Simpan Lokal (Offline)' : 'Submit Laporan'}
      </button>
    </form>

    {modal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="mx-4 w-full max-w-sm rounded-2xl bg-gray-800 border border-gray-700 p-6 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full mb-4 ${
              modal.type === 'success' ? 'bg-green-500/10' : modal.type === 'offline' ? 'bg-yellow-500/10' : 'bg-red-500/10'
            }`}>
              {modal.type === 'success' && <CheckCircle className="h-7 w-7 text-green-500" />}
              {modal.type === 'offline' && <WifiOff className="h-7 w-7 text-yellow-500" />}
              {modal.type === 'error' && <XCircle className="h-7 w-7 text-red-500" />}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {modal.type === 'success' ? 'Berhasil!' : modal.type === 'offline' ? 'Offline Mode' : 'Gagal!'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">{modal.message}</p>
            <button
              onClick={() => {
                setModal(null);
                if (modal.type === 'success') router.push('/dashboard');
              }}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors ${
                modal.type === 'success'
                  ? 'bg-green-600 hover:bg-green-700'
                  : modal.type === 'offline'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {modal.type === 'success' ? 'Kembali ke Dashboard' : 'Tutup'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
