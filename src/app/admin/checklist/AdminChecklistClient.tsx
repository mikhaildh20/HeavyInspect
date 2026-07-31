'use client';

import { useState, useEffect } from 'react';
import { SheetManager } from '@/components/admin/SheetManager';

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

export function AdminChecklistClient() {
  const [categories, setCategories] = useState<ChecklistCategory[]>([]);
  const [parameters, setParameters] = useState<ChecklistParameter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, paramRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/checklist'),
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (paramRes.ok) setParameters(await paramRes.json());
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (letter: string, name: string) => {
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ letter, name, sortOrder: categories.length, isActive: 1 }),
    });
    if (res.ok) {
      const newCat = await res.json();
      setCategories(prev => [...prev, newCat]);
    }
  };

  const handleUpdateCategory = async (id: number, data: Partial<ChecklistCategory>) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCategories(prev => prev.filter(c => c.id !== id));
      setParameters(prev => prev.filter(p => p.categoryId !== id));
    }
  };

  const handleAddParameter = async (categoryId: number, description: string) => {
    const categoryParams = parameters.filter(p => p.categoryId === categoryId);
    const res = await fetch('/api/admin/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, description, sortOrder: categoryParams.length, isActive: 1 }),
    });
    if (res.ok) {
      const newParam = await res.json();
      setParameters(prev => [...prev, newParam]);
    }
  };

  const handleUpdateParameter = async (id: number, data: Partial<ChecklistParameter>) => {
    const res = await fetch(`/api/admin/checklist/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setParameters(prev => prev.map(p => p.id === id ? updated : p));
    }
  };

  const handleDeleteParameter = async (id: number) => {
    const res = await fetch(`/api/admin/checklist/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setParameters(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Master Sheet</h2>
        <p className="text-sm text-gray-400">Kelola struktur inspection sheet</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-400 mt-4">Memuat data...</p>
        </div>
      ) : (
        <SheetManager
          categories={categories}
          parameters={parameters}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onAddParameter={handleAddParameter}
          onUpdateParameter={handleUpdateParameter}
          onDeleteParameter={handleDeleteParameter}
        />
      )}
    </div>
  );
}
