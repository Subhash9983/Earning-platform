import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-24 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border min-w-[300px] bg-white ${
                toast.type === 'success' ? 'border-green-100 text-green-800' : 
                toast.type === 'error' ? 'border-red-100 text-red-800' : 'border-blue-100 text-blue-800'
              }`}
            >
              <div className={`p-2 rounded-xl ${
                toast.type === 'success' ? 'bg-green-100 text-green-600' : 
                toast.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {toast.type === 'success' && <CheckCircle2 size={20} />}
                {toast.type === 'error' && <AlertCircle size={20} />}
                {toast.type === 'info' && <Info size={20} />}
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-bold leading-tight">{toast.message}</p>
              </div>

              <button 
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
