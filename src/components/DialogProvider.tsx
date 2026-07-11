'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, Check, X } from 'lucide-react';

interface DialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'alert' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface DialogContextType {
  confirm: (title: string, message: string, confirmText?: string, cancelText?: string) => Promise<boolean>;
  alert: (title: string, message: string, buttonText?: string) => Promise<void>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogOptions | null>(null);

  const confirm = (title: string, message: string, confirmText = 'Confirm', cancelText = 'Cancel'): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        title,
        message,
        confirmText,
        cancelText,
        type: 'confirm',
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        }
      });
    });
  };

  const alert = (title: string, message: string, buttonText = 'OK'): Promise<void> => {
    return new Promise((resolve) => {
      setDialog({
        title,
        message,
        confirmText: buttonText,
        type: 'alert',
        onConfirm: () => {
          setDialog(null);
          resolve();
        },
        onCancel: () => {
          setDialog(null);
          resolve();
        }
      });
    });
  };

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}

      <AnimatePresence>
        {dialog && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg-primary/60 backdrop-blur-sm"
              onClick={dialog.onCancel}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="relative w-full max-w-sm bg-bg-primary border border-text-primary/10 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${dialog.type === 'confirm' ? 'bg-[#c2410c]/20 text-[#c2410c]' : 'bg-text-primary/10 text-text-primary'}`}>
                    {dialog.type === 'confirm' ? <AlertTriangle size={24} /> : <Info size={24} />}
                  </div>
                  <h3 className="font-serif text-2xl text-text-primary tracking-wide leading-tight">
                    {dialog.title}
                  </h3>
                </div>
                
                <p className="text-text-primary/60 text-sm leading-relaxed mb-8">
                  {dialog.message}
                </p>

                <div className="flex items-center justify-end gap-3">
                  {dialog.type === 'confirm' && (
                    <button
                      onClick={dialog.onCancel}
                      className="px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest text-text-primary/60 hover:text-text-primary hover:bg-text-primary/5 transition-colors border border-transparent"
                    >
                      {dialog.cancelText}
                    </button>
                  )}
                  <button
                    onClick={dialog.onConfirm}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
                      dialog.type === 'confirm' 
                        ? 'bg-[#c2410c] text-text-primary hover:bg-[#c2410c]/90 shadow-lg shadow-[#c2410c]/20'
                        : 'bg-text-primary/10 text-text-primary hover:bg-text-primary/20'
                    }`}
                  >
                    {dialog.type === 'confirm' ? <Check size={14} /> : null}
                    <span>{dialog.confirmText}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DialogContext.Provider>
  );
}
