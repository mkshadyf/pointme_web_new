import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          as={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${type === 'danger' ? 'bg-red-100 dark:bg-red-900/10' : 'bg-yellow-100 dark:bg-yellow-900/10'}`}>
              <AlertTriangle className={`w-6 h-6 ${type === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
            </div>
            <Dialog.Title className="text-lg font-semibold dark:text-white">
              {title}
            </Dialog.Title>
          </div>

          <Dialog.Description className="mt-4 text-gray-600 dark:text-gray-400">
            {message}
          </Dialog.Description>

          <div className="mt-6 flex justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="dark:text-gray-300 dark:hover:text-white"
            >
              {cancelText}
            </Button>
            <Button
              variant={type === 'danger' ? 'outline' : 'default'}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={cn(
                type === 'danger' && 'border-red-600 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-950/10',
                'dark:text-white'
              )}
            >
              {confirmText}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 