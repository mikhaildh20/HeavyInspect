'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, ClipboardList, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { ConfirmModal } from '@/components/layout/ConfirmModal';

interface ChecklistCategory {
  id: number;
  letter: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

interface ChecklistParameter {
  id: number;
  categoryId: number | null;
  category: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

interface SheetManagerProps {
  categories: ChecklistCategory[];
  parameters: ChecklistParameter[];
  onAddCategory: (letter: string, name: string) => Promise<void>;
  onUpdateCategory: (id: number, data: Partial<ChecklistCategory>) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
  onAddParameter: (categoryId: number, description: string) => Promise<void>;
  onUpdateParameter: (id: number, data: Partial<ChecklistParameter>) => Promise<void>;
  onDeleteParameter: (id: number) => Promise<void>;
}

export function SheetManager({
  categories: initialCategories,
  parameters: initialParameters,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddParameter,
  onUpdateParameter,
  onDeleteParameter,
}: SheetManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [parameters, setParameters] = useState(initialParameters);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatLetter, setNewCatLetter] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editCatLetter, setEditCatLetter] = useState('');
  const [editCatName, setEditCatName] = useState('');

  const [showAddParam, setShowAddParam] = useState<number | null>(null);
  const [newParamDesc, setNewParamDesc] = useState('');

  const [editingParamId, setEditingParamId] = useState<number | null>(null);
  const [editParamDesc, setEditParamDesc] = useState('');

  const [saving, setSaving] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    loading: boolean;
    action: () => Promise<void>;
  }>({ open: false, title: '', message: '', loading: false, action: async () => {} });

  const grouped = categories.map(cat => ({
    ...cat,
    parameters: parameters
      .filter(p => p.categoryId === cat.id)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  })).sort((a, b) => a.sortOrder - b.sortOrder);

  const toggleCategory = (catId: number) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: prev[catId] === false ? true : false }));
  };

  const refreshCategories = async () => {
    const res = await fetch('/api/admin/categories');
    if (res.ok) setCategories(await res.json());
  };

  const refreshParameters = async () => {
    const res = await fetch('/api/admin/checklist');
    if (res.ok) setParameters(await res.json());
  };

  const handleAddCategory = async () => {
    if (!newCatLetter.trim() || !newCatName.trim()) return;
    setSaving(true);
    try {
      await onAddCategory(newCatLetter.trim(), newCatName.trim());
      await refreshCategories();
      setNewCatLetter('');
      setNewCatName('');
      setShowAddCategory(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editCatLetter.trim() || !editCatName.trim()) return;
    setSaving(true);
    try {
      await onUpdateCategory(id, { letter: editCatLetter.toUpperCase(), name: editCatName.trim() });
      setCategories(prev => prev.map(c => c.id === id ? { ...c, letter: editCatLetter.toUpperCase(), name: editCatName.trim() } : c));
      setEditingCatId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const cat = categories.find(c => c.id === id);
    const paramCount = parameters.filter(p => p.categoryId === id).length;
    setConfirmState({
      open: true,
      title: 'Hapus Kategori',
      message: `Hapus kategori "${cat?.letter}. ${cat?.name}"${paramCount > 0 ? ` beserta ${paramCount} parameter?` : '?'}`,
      loading: false,
      action: async () => {
        setConfirmState(prev => ({ ...prev, loading: true }));
        try {
          await onDeleteCategory(id);
          setCategories(prev => prev.filter(c => c.id !== id));
          setParameters(prev => prev.filter(p => p.categoryId !== id));
        } finally {
          setConfirmState(prev => ({ ...prev, open: false, loading: false }));
        }
      },
    });
  };

  const handleAddParameter = async (categoryId: number) => {
    if (!newParamDesc.trim()) return;
    setSaving(true);
    try {
      await onAddParameter(categoryId, newParamDesc.trim());
      await refreshParameters();
      setNewParamDesc('');
      setShowAddParam(null);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateParameter = async (id: number) => {
    if (!editParamDesc.trim()) return;
    setSaving(true);
    try {
      await onUpdateParameter(id, { description: editParamDesc.trim() });
      setParameters(prev => prev.map(p => p.id === id ? { ...p, description: editParamDesc.trim() } : p));
      setEditingParamId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteParameter = async (id: number) => {
    setConfirmState({
      open: true,
      title: 'Hapus Parameter',
      message: 'Hapus parameter ini?',
      loading: false,
      action: async () => {
        setConfirmState(prev => ({ ...prev, loading: true }));
        try {
          await onDeleteParameter(id);
          setParameters(prev => prev.filter(p => p.id !== id));
        } finally {
          setConfirmState(prev => ({ ...prev, open: false, loading: false }));
        }
      },
    });
  };

  let globalIndex = 0;

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-white uppercase">Daily Inspection Sheet</h2>
          <p className="text-primary font-semibold">Maintenance Checklist</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Form No.</p>
            <p className="font-mono text-white">QA10 - Maintenance Sheet</p>
          </div>
          <div>
            <p className="text-gray-400">Total Parameters</p>
            <p className="text-white font-medium">{parameters.length} items</p>
          </div>
          <div>
            <p className="text-gray-400">Categories</p>
            <p className="text-white font-medium">{categories.length} sections</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <p className="font-bold text-white mb-1">Condition</p>
            <p className="text-gray-300"><span className="text-green-400 font-bold">G</span> = Good Condition</p>
            <p className="text-gray-300"><span className="text-yellow-400 font-bold">B</span> = Bad Condition</p>
            <p className="text-gray-300"><span className="text-red-400 font-bold">U</span> = Unchecked</p>
          </div>
          <div>
            <p className="font-bold text-white mb-1">Priority Condition</p>
            <p className="text-gray-300">1 = Leaking, 2 = Broken, 3 = Missing</p>
            <p className="text-gray-300">4 = Loose, 5 = Worn, 6 = Crack, 7 = Others</p>
          </div>
          <div>
            <p className="font-bold text-white mb-1">Action</p>
            <p className="text-gray-300">1 = Action now, 2 = Action at change shift</p>
            <p className="text-gray-300">3 = Action on next PS, 4 = Action on schedule</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowAddCategory(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black font-semibold rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={18} />
          Tambah Kategori
        </button>
      </div>

      {showAddCategory && (
        <div className="bg-gray-800 rounded-xl border border-primary p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Kategori Baru</h4>
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Huruf</label>
              <input
                type="text"
                maxLength={1}
                value={newCatLetter}
                onChange={(e) => setNewCatLetter(e.target.value.toUpperCase())}
                placeholder="D"
                className="w-16 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-center font-mono text-lg focus:border-primary outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Nama Kategori</label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Engine Area"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-primary outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddCategory} disabled={!newCatLetter.trim() || !newCatName.trim() || saving}
                className="px-4 py-2 bg-primary text-black rounded-lg font-medium text-sm hover:bg-primary-dark disabled:opacity-50 transition-colors">
                <Save size={16} />
              </button>
              <button onClick={() => { setShowAddCategory(false); setNewCatLetter(''); setNewCatName(''); }}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="bg-gray-900 border-b border-gray-700">
          <div className="hidden md:grid grid-cols-[40px_1fr_120px_100px] gap-1 p-2 text-xs font-medium text-gray-400">
            <span className="text-center">#</span>
            <span>Description</span>
            <span className="text-center">Condition</span>
            <span className="text-center">Actions</span>
          </div>
        </div>

        {grouped.map(cat => {
          const isExpanded = expandedCategories[cat.id] !== false;
          return (
            <div key={cat.id} className="border-b border-gray-700 last:border-b-0">
              <div className="px-4 py-3 bg-gray-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => toggleCategory(cat.id)}>
                  {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                  <ClipboardList size={16} className="text-primary" />
                  {editingCatId === cat.id ? (
                    <div className="flex items-center gap-1">
                      <input type="text" maxLength={1} value={editCatLetter} onChange={(e) => setEditCatLetter(e.target.value.toUpperCase())}
                        className="w-8 px-1 py-0.5 bg-gray-900 border border-gray-600 rounded text-sm text-primary font-mono text-center focus:border-primary outline-none" autoFocus onClick={(e) => e.stopPropagation()} />
                      <span className="text-primary font-bold">.</span>
                      <input type="text" value={editCatName} onChange={(e) => setEditCatName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(cat.id)}
                        className="px-2 py-0.5 bg-gray-900 border border-gray-600 rounded text-sm text-white focus:border-primary outline-none" onClick={(e) => e.stopPropagation()} />
                      <button onClick={(e) => { e.stopPropagation(); handleUpdateCategory(cat.id); }}
                        className="p-1 text-green-400 hover:text-green-300"><Save size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingCatId(null); }}
                        className="p-1 text-gray-400 hover:text-gray-300"><X size={14} /></button>
                    </div>
                  ) : (
                    <h3 className="font-semibold text-white">{cat.letter}. {cat.name}</h3>
                  )}
                  <span className="text-xs text-gray-500 ml-2">({cat.parameters.length})</span>
                </div>

                {editingCatId !== cat.id && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => setShowAddParam(cat.id)}
                      className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs text-gray-300 flex items-center gap-1 transition-colors">
                      <Plus size={12} /> Item
                    </button>
                    <button onClick={() => { setEditingCatId(cat.id); setEditCatLetter(cat.letter); setEditCatName(cat.name); }}
                      className="p-1.5 rounded hover:bg-gray-700 text-gray-500 hover:text-primary transition-colors" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded hover:bg-red-900/50 text-gray-500 hover:text-red-400 transition-colors" title="Hapus">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="divide-y divide-gray-700/50">
                  {cat.parameters.map(param => {
                    globalIndex++;
                    return (
                      <div key={param.id} className="px-4 py-3 hover:bg-gray-750 transition-colors">
                        <div className="md:grid md:grid-cols-[40px_1fr_120px_100px] md:gap-2 md:items-center flex items-center justify-between">
                          <span className="text-xs text-gray-500 text-center">{globalIndex}</span>

                          {editingParamId === param.id ? (
                            <div className="flex items-center gap-1">
                              <input type="text" value={editParamDesc} onChange={(e) => setEditParamDesc(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateParameter(param.id)}
                                className="flex-1 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-white focus:border-primary outline-none" autoFocus />
                              <button onClick={() => handleUpdateParameter(param.id)} disabled={saving}
                                className="p-1 text-green-400 hover:text-green-300"><Save size={14} /></button>
                              <button onClick={() => setEditingParamId(null)}
                                className="p-1 text-gray-400 hover:text-gray-300"><X size={14} /></button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-300 font-medium">{param.description}</span>
                          )}

                          <div className="flex gap-0.5 justify-center">
                            {['G', 'B', 'U'].map(c => (
                              <span key={c} className={`w-7 h-7 rounded text-xs font-bold flex items-center justify-center ${
                                c === 'G' ? 'bg-green-900/50 text-green-400' :
                                c === 'B' ? 'bg-yellow-900/50 text-yellow-400' :
                                'bg-red-900/50 text-red-400'
                              }`}>{c}</span>
                            ))}
                          </div>

                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => { setEditingParamId(param.id); setEditParamDesc(param.description); }}
                              className="p-1.5 text-gray-500 hover:text-primary transition-colors" title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDeleteParameter(param.id)}
                              className="p-1.5 text-gray-500 hover:text-red-400 transition-colors" title="Hapus">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {showAddParam === cat.id && (
                    <div className="px-4 py-3 bg-gray-900/50">
                      <div className="flex items-center gap-2">
                        <input type="text" value={newParamDesc} onChange={(e) => setNewParamDesc(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddParameter(cat.id)}
                          placeholder="Deskripsi item baru..." autoFocus
                          className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-primary outline-none" />
                        <button onClick={() => handleAddParameter(cat.id)} disabled={!newParamDesc.trim() || saving}
                          className="px-3 py-2 bg-primary text-black rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors">Tambah</button>
                        <button onClick={() => { setShowAddParam(null); setNewParamDesc(''); }}
                          className="px-3 py-2 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors">Batal</button>
                      </div>
                    </div>
                  )}

                  {cat.parameters.length === 0 && showAddParam !== cat.id && (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-gray-500">Belum ada item. Klik &quot;Item&quot; untuk menambahkan.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="p-8 text-center">
            <ClipboardList size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Belum ada kategori.</p>
            <p className="text-gray-500 text-sm mt-2">Klik &quot;Tambah Kategori&quot; untuk memulai.</p>
          </div>
        )}
      </div>

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
