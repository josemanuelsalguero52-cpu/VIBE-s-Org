import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextData | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Floating Toast Container */}
      <aside aria-label="Notificaciones" className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 pointer-events-none max-w-sm w-full px-4">
        <AnimatePresence>
          {toasts.map(toast => {
            const icons = {
              success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
              error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
              warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
              info: <Info className="w-4 h-4 text-[#3B6FF0] shrink-0" />
            };

            const borders = {
              success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
              error: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
              warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
              info: 'border-[#3B6FF0]/30 bg-[#3B6FF0]/10 text-slate-200'
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md shadow-xl ${borders[toast.type]}`}
              >
                <div className="flex items-center space-x-2.5">
                  {icons[toast.type]}
                  <p className="text-xs font-medium leading-tight">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
