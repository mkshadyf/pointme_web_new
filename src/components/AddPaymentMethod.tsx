import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { LoadingState } from './LoadingState';
import { ErrorMessage } from './ErrorMessage';

interface AddPaymentMethodProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddPaymentMethod({ onSuccess, onCancel }: AddPaymentMethodProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addPaymentMethod } = usePaymentMethods();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (stripeError) {
        setError(stripeError.message || 'Failed to add payment method');
        return;
      }

      await addPaymentMethod.mutateAsync({
        type: paymentMethod.type,
        card: {
          brand: paymentMethod.card!.brand,
          last4: paymentMethod.card!.last4,
          exp_month: paymentMethod.card!.exp_month,
          exp_year: paymentMethod.card!.exp_year,
        },
      });

      onSuccess?.();
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error adding payment method:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!stripe || !elements) {
    return <LoadingState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 border rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Add Payment Method'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 