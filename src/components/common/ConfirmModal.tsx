import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Sil',
  cancelText = 'İptal',
  isDanger = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isDanger
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                : 'bg-[var(--accent)]/15 text-[var(--accent)]'
            }`}
          >
            {isDanger ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="flex-1 pr-2">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-theme)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-page)] hover:bg-[var(--border-light)] border border-[var(--border-theme)] rounded-xl transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                : 'bg-[var(--btn-primary)] hover:opacity-90 text-[var(--btn-primary-text)] shadow-xs'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
