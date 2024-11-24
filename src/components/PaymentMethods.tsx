import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Star, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { LoadingState } from './LoadingState';
import { ConfirmDialog } from './ConfirmDialog';
import type { PaymentMethod } from '../types/payment';

interface PaymentMethodsProps {
  onSelect?: (paymentMethod: PaymentMethod) => void;
  selectedId?: string;
}

export function PaymentMethods({ onSelect, selectedId }: PaymentMethodsProps) {
  const { paymentMethods, isLoading, setDefaultPaymentMethod, deletePaymentMethod } = usePaymentMethods();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payment Methods</h3>
        <Button variant="outline" size="sm" onClick={() => {/* TODO: Add new payment method */}}>
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            deletePaymentMethod.mutate(confirmDelete);
          }
          setConfirmDelete(null);
        }}
        title="Remove Payment Method"
        message="Are you sure you want to remove this payment method? This action cannot be undone."
        confirmText="Remove"
        type="danger"
      />

      <div className="grid gap-4">
        {paymentMethods?.map((method) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card
              className={`relative cursor-pointer transition-shadow hover:shadow-md ${
                selectedId === method.id ? 'ring-2 ring-primary-500' : ''
              }`}
              onClick={() => onSelect?.(method)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full dark:bg-gray-800">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {method.card?.brand} •••• {method.card?.last4}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expires {method.card?.exp_month}/{method.card?.exp_year}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {method.is_default && (
                      <div className="flex items-center gap-1 text-sm text-primary-600">
                        <Star className="w-4 h-4 fill-current" />
                        Default
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(method.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {!method.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDefaultPaymentMethod.mutate(method.id);
                    }}
                  >
                    Set as Default
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 