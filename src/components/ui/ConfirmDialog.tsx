'use client';

interface ConfirmDialogProps {
  open:      boolean;
  title:     string;
  message:   string;
  onConfirm: () => void;
  onCancel:  () => void;
  loading?:  boolean;
  danger?:   boolean;
}

export function ConfirmDialog({
  open, title, message, onConfirm, onCancel, loading, danger,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400 mt-2">{message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
              danger
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {loading ? 'En cours...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}