// ToastContainer.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toastService } from '../toastService';

interface Toast {
  id: string;
  type: 'error' | 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      text: 'text-red-700',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      title: 'text-green-900',
      text: 'text-green-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      text: 'text-blue-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-900',
      text: 'text-yellow-700',
    }
  } as const;

  const style = styles[toast.type] || styles.error;

  return (
    <div
      className={`${style.bg} border ${style.border} rounded-lg shadow-lg p-4 flex items-start gap-3 mb-3 max-w-md cursor-pointer`}
      onClick={onClose}
    >
      <div className="flex-1">
        <h3 className={`text-sm font-semibold ${style.title} mb-1`}>
          {toast.title}
        </h3>
        <p className={`${style.text}`}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className={`${style.icon} hover:opacity-70 transition-opacity flex-shrink-0`}
        aria-label="Close"
      >
      </button>
    </div>
  );
}

function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastService.subscribe(setToasts);
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => toastService.remove(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
}

export { ToastContainer }