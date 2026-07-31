'use client';

import { useState, useRef } from 'react';
import { UserForm } from './UserForm';
import { Plus, Edit2, Trash2, HardHat, BookOpen, Shield, Users, KeyRound, Copy, Check, Upload, Download } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import * as XLSX from 'xlsx';

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

interface UserListProps {
  users: User[];
}

export function UserList({ users: initialUsers }: UserListProps) {
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resettingId, setResettingId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ created: { username: string; fullName: string; role: string; generatedPassword: string }[]; errors: { row: number; message: string }[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'operator': return <HardHat size={16} className="text-blue-400" />;
      case 'leader': return <BookOpen size={16} className="text-yellow-400" />;
      case 'supervisor': return <Shield size={16} className="text-green-400" />;
      default: return <Users size={16} className="text-gray-400" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'operator': return 'Mahasiswa';
      case 'leader': return 'Instruktur';
      case 'supervisor': return 'Dosen';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (userId: number) => {
    setConfirmState({
      open: true,
      title: 'Hapus User',
      message: 'Yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.',
      variant: 'danger',
      loading: false,
      action: async () => {
        setConfirmState(prev => ({ ...prev, loading: true }));
        try {
          const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
          if (res.ok) {
            setUsers(users.filter(u => u.id !== userId));
          }
        } catch (error) {
          console.error('Delete error:', error);
        } finally {
          setConfirmState(prev => ({ ...prev, open: false, loading: false }));
        }
      },
    });
  };

  const handleSave = (savedUser: { id?: number; username: string; fullName: string; role: string; generatedPassword?: string }) => {
    if (editingUser && savedUser.id) {
      setUsers(users.map(u => u.id === savedUser.id ? { ...savedUser, id: savedUser.id } : u));
    } else if (savedUser.id) {
      setUsers([...users, { ...savedUser, id: savedUser.id }]);
    }
    if (savedUser.generatedPassword) {
      setGeneratedPassword(savedUser.generatedPassword);
    }
    setShowForm(false);
    setEditingUser(null);
  };

  const handleResetPassword = (userId: number) => {
    setConfirmState({
      open: true,
      title: 'Reset Password',
      message: 'Reset password user ini? Password baru akan ditampilkan.',
      variant: 'warning',
      loading: false,
      action: async () => {
        setConfirmState(prev => ({ ...prev, loading: true }));
        setResettingId(userId);
        try {
          const res = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resetPassword: true }),
          });
          if (res.ok) {
            const data = await res.json();
            setGeneratedPassword(data.generatedPassword);
          }
        } catch (error) {
          console.error('Reset error:', error);
        } finally {
          setResettingId(null);
          setConfirmState(prev => ({ ...prev, open: false, loading: false }));
        }
      },
    });
  };

  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResults(null);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
      const mapped = rows.map(r => {
        const normalized: Record<string, string> = {};
        for (const [k, v] of Object.entries(r)) {
          normalized[k.trim().toLowerCase().replace(/\s+/g, '')] = String(v ?? '');
        }
        return {
          username: normalized.username || normalized['user name'] || '',
          fullName: normalized.fullname || normalized['full name'] || normalized.nama || '',
          role: normalized.role || '',
        };
      }).filter(r => r.username || r.fullName);
      if (mapped.length === 0) {
        setImportErrors('Tidak ada data valid ditemukan. Pastikan file memiliki kolom: username, fullName, role');
        setImporting(false);
        return;
      }
      const res = await fetch('/api/admin/users/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: mapped }),
      });
      const result = await res.json();
      if (!res.ok) {
        setImportErrors(result.error || 'Import gagal');
      } else {
        setImportResults(result);
        if (result.created?.length > 0) {
          const newUsers = result.created.map((u: { username: string; fullName: string; role: string }, i: number) => ({
            id: Date.now() + i,
            username: u.username,
            fullName: u.fullName,
            role: u.role,
          }));
          setUsers(prev => [...prev, ...newUsers]);
        }
      }
    } catch {
      setImportErrors('Gagal membaca file Excel');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [importErrors, setImportErrors] = useState<string | null>(null);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning';
    loading: boolean;
    action: () => Promise<void>;
  }>({ open: false, title: '', message: '', variant: 'danger', loading: false, action: async () => {} });

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['Username', 'Full Name', 'Role'],
      ['operator1', 'Contoh Operator', 'operator'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'template_import_users.xlsx');
  };

  if (showForm) {
    return (
      <UserForm
        user={editingUser}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditingUser(null); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Data Pengguna</h2>
          <p className="text-sm text-gray-400">Kelola akun pengguna</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleExcelImport}
            className="hidden"
          />
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            <Download size={18} />
            Template
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <Upload size={18} />
            {importing ? 'Importing...' : 'Import Excel'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Tambah User
          </button>
        </div>
      </div>

      {generatedPassword && (
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-400 font-medium">Password Baru:</p>
              <p className="text-lg font-mono text-white mt-1">{generatedPassword}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyPassword}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 rounded-lg text-sm text-white hover:bg-gray-600 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Tersalin' : 'Salin'}
              </button>
              <button
                onClick={() => setGeneratedPassword(null)}
                className="px-3 py-1.5 bg-gray-700 rounded-lg text-sm text-white hover:bg-gray-600 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
          <p className="text-xs text-yellow-400 mt-2">Catat password ini! User harus mengubah password saat login pertama kali.</p>
        </div>
      )}

      {importErrors && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-400">{importErrors}</p>
            <button onClick={() => setImportErrors(null)} className="text-gray-400 hover:text-white text-sm">Tutup</button>
          </div>
        </div>
      )}

      {importResults && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium">Hasil Import</h4>
            <button onClick={() => setImportResults(null)} className="text-gray-400 hover:text-white text-sm">Tutup</button>
          </div>
          {importResults.created.length > 0 && (
            <div>
              <p className="text-sm text-green-400 mb-2">{importResults.created.length} user berhasil dibuat:</p>
              <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
                {importResults.created.map((u, i) => (
                  <div key={i} className="flex justify-between items-center py-1 border-b border-gray-700 last:border-0 text-sm">
                    <span className="text-white">{u.fullName} ({u.username})</span>
                    <span className="font-mono text-yellow-400">{u.generatedPassword}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-yellow-400 mt-1">Catat semua password di atas! User harus mengubah password saat login pertama kali.</p>
            </div>
          )}
          {importResults.errors.length > 0 && (
            <div>
              <p className="text-sm text-red-400 mb-1">{importResults.errors.length} baris gagal:</p>
              {importResults.errors.map((e, i) => (
                <p key={i} className="text-xs text-red-400/80">Baris {e.row}: {e.message}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Nama</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Username</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Role</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{user.fullName}</td>
                  <td className="px-4 py-3 text-gray-400">{user.username}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span className="text-sm">{getRoleLabel(user.role)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        disabled={resettingId === user.id}
                        className="p-2 rounded-lg hover:bg-yellow-900/50 text-gray-400 hover:text-yellow-400 transition-colors disabled:opacity-50"
                        title="Reset Password"
                      >
                        <KeyRound size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-lg hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Belum ada data pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        loading={confirmState.loading}
        confirmLabel={confirmState.variant === 'warning' ? 'Reset' : 'Hapus'}
        onConfirm={confirmState.action}
        onCancel={() => setConfirmState(prev => ({ ...prev, open: false, loading: false }))}
      />
    </div>
  );
}
