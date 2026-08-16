import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export type ModalType = 'alert' | 'confirm' | 'prompt';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: ModalType;
  onConfirm?: (inputValue?: string) => void;
  confirmText?: string;
  cancelText?: string;
  promptPlaceholder?: string;
  variant?: 'info' | 'success' | 'error' | 'warning';
  children?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'alert',
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  promptPlaceholder = 'Enter your input here...',
  variant = 'info',
  children
}: ModalProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(type === 'prompt' ? inputValue : undefined);
    }
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { icon: <CheckCircle className="w-6 h-6 text-green-500" />, btn: 'bg-green-600 hover:bg-green-700 focus:ring-green-500' };
      case 'error':
        return { icon: <AlertCircle className="w-6 h-6 text-red-500" />, btn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500' };
      case 'warning':
        return { icon: <AlertCircle className="w-6 h-6 text-amber-500" />, btn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' };
      default:
        return { icon: <Info className="w-6 h-6 text-blue-500" />, btn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' };
    }
  };

  const styles = getVariantStyles();

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">
        <div className="flex items-start justify-between p-6 border-b border-slate-50 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-2xl ${variant === 'success' ? 'bg-green-100' : variant === 'error' ? 'bg-red-100' : variant === 'warning' ? 'bg-amber-100' : 'bg-blue-100'}`}>
              {styles.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {message && <p className="text-slate-700 font-medium mb-6 leading-relaxed">{message}</p>}
          
          {type === 'prompt' && (
            <div className="mb-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={promptPlaceholder}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-inner"
                autoFocus
              />
            </div>
          )}
          
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>
        
        <div className="bg-slate-50/80 border-t border-slate-100 px-6 py-5 flex justify-end gap-3 rounded-b-3xl">
          {type !== 'alert' && (
            <button 
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-sm"
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={handleConfirm}
            className={`px-6 py-2.5 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
