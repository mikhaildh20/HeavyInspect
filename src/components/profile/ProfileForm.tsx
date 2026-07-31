'use client';

import { useState, useRef } from 'react';
import { User, Lock, Camera, Save, Check, AlertCircle } from 'lucide-react';

interface ProfileFormProps {
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
    avatarUrl: string;
  };
}

const roleLabels: Record<string, string> = {
  operator: 'Mahasiswa',
  leader: 'Instruktur',
  supervisor: 'Dosen',
  admin: 'Admin',
};

export function ProfileForm({ user }: ProfileFormProps) {
  const [fullName, setFullName] = useState(user.fullName);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran gambar maksimal 500KB' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'File harus berupa gambar' });
      return;
    }

    setUploadingAvatar(true);
    setMessage(null);

    try {
      const reader = new FileReader();
      const dataUri = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Gagal membaca file'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: dataUri }),
      });

      if (res.ok) {
        setAvatarUrl(dataUri);
        setMessage({ type: 'success', text: 'Foto profil berhasil diupdate' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Gagal upload foto' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal upload foto' });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: '' }),
      });
      if (res.ok) {
        setAvatarUrl('');
        setMessage({ type: 'success', text: 'Foto profil dihapus' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal menghapus foto' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profil berhasil diupdate' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Gagal update profil' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal terhubung ke server' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password berhasil diubah' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Gagal mengubah password' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal terhubung ke server' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-lg p-3 flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
        }`}>
          {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.fullName}
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-600"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center">
                <User size={32} className="text-gray-400" />
              </div>
            )}
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-black hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">{user.fullName}</h2>
            <p className="text-sm text-gray-400">@{user.username}</p>
            <p className="text-xs text-primary mt-1">{roleLabels[user.role] || user.role}</p>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={uploadingAvatar}
                className="text-xs text-red-400 hover:text-red-300 mt-1 transition-colors"
              >
                Hapus Foto
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input
              type="text"
              value={user.username}
              disabled
              className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Lock size={18} />
          Ubah Password
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password Saat Ini</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <Lock size={18} />
            {saving ? 'Mengubah...' : 'Ubah Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
