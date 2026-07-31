'use client';

import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const variantStyles = {
    danger: {
      icon: <Trash2 size={24} className="text-red-400" />,
      iconBg: 'bg-red-900/50',
      confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: <AlertTriangle size={24} className="text-yellow-400" />,
      iconBg: 'bg-yellow-900/50',
      confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    },
    info: {
      icon: <AlertTriangle size={24} className="text-blue-400" />,
      iconBg: 'bg-blue-900/50',
      confirmBtn: 'bg-primary hover:bg-primary-dark text-black',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-gray-800 border border-gray-700 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${style.iconBg}`}>
              {style.icon}
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-700 transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-700 text-white font-medium text-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 ${style.confirmBtn}`}
          >
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
