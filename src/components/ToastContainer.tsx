import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => onDismiss(toast.id)}
          className="pointer-events-auto flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg shadow-lg border transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-right-4"
          style={{
            backgroundColor: '#0D2528',
            borderColor: toast.type === 'warning' ? '#B45309' : '#1F8F68',
            color: '#F1F5F3',
          }}
        >
          {toast.type === 'warning' ? (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-4 h-4 text-[#2AA879] shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <div className="font-semibold text-[#F1F5F3] leading-tight">{toast.title}</div>
            {toast.message && (
              <div className="text-[11px] text-[#9BAEAA] mt-0.5 leading-snug">{toast.message}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
