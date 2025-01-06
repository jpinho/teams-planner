import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';
  const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon;

  return (
    <div className={`fixed top-4 right-4 w-96 rounded-lg p-4 shadow-lg border ${bgColor} ${borderColor} animate-in slide-in-from-top-2`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${textColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <button
            type="button"
            className={`inline-flex rounded-md ${bgColor} ${textColor} hover:${textColor} focus:outline-none focus:ring-2 focus:ring-offset-2`}
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
} 