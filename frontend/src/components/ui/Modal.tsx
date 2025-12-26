import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'form' | 'full';
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, size = 'form', className = '' }: ModalProps) {
  console.log('Modal render:', { isOpen, title, size });
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    form: 'max-w-md',
    full: 'max-w-full'
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div
        className={`modal-container bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 mx-auto ${sizeClasses[size]} ${className}`}
      >
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-4 sm:px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-base sm:text-lg font-bold text-white truncate pr-2">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors shrink-0"
            type="button"
          >
            <X className="w-5 h-5 text-white/80 hover:text-white" />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
