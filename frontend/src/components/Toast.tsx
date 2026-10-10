import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const styles = {
          success: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200',
          error: 'bg-rose-950/90 border-rose-500/40 text-rose-200',
          info: 'bg-sky-950/90 border-sky-500/40 text-sky-200'
        }[t.type];

        const icon = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-400 shrink-0" />
        }[t.type];

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200 ${styles}`}
          >
            <div className="flex items-start gap-3">
              {icon}
              <div>
                <p className="text-xs font-bold leading-none m-0">{t.title}</p>
                {t.message && (
                  <p className="text-xs opacity-80 mt-1 leading-relaxed m-0">{t.message}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="p-1 rounded-md opacity-70 hover:opacity-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
