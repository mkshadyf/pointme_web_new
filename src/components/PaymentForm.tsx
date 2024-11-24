import { useState, useEffect } from 'react';
import { 
  PaymentElement, 
  useStripe, 
  useElements,
  PaymentRequestButtonElement,
} from '@stripe/react-stripe-js';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { PlaidLink } from 'react-plaid-link';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { LoadingState } from './LoadingState';
import { ErrorMessage } from './ErrorMessage';
import { usePayment } from '../hooks/usePayment';
import { schedulePaymentRetry } from '../lib/paymentRetry';
import type { PaymentMethodType } from '../types/payment';

const PAYMENT_TIMEOUT = 60000; // 60 seconds

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function PaymentForm({ bookingId, amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');
  const [paymentRequest, setPaymentRequest] = useState(null);
  const { confirmPayment } = usePayment(bookingId);

  // Initialize payment request for Apple/Google Pay
  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Booking Payment',
          amount: amount * 100,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then(result => {
        if (result) {
          setPaymentRequest(pr);
        }
      });
    }
  }, [stripe, amount]);

  // Handle digital wallet payment
  const handleWalletPayment = async (ev: any) => {
    setIsProcessing(true);
    try {
      const { paymentIntent, error: confirmError } = await stripe!.confirmCardPayment(
        ev.paymentMethod.id
      );

      if (confirmError) {
        throw confirmError;
      }

      if (paymentIntent.status === 'succeeded') {
        await confirmPayment.mutateAsync({ paymentIntentId: paymentIntent.id });
        onSuccess?.();
      }
    } catch (error) {
      console.error('Wallet payment error:', error);
      onError?.(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle PayPal payment
  const handlePayPalPayment = async (data: any) => {
    setIsProcessing(true);
    try {
      const { paymentIntent } = await stripe!.confirmPayPalPayment(
        data.orderID
      );

      if (paymentIntent.status === 'succeeded') {
        await confirmPayment.mutateAsync({ paymentIntentId: paymentIntent.id });
        onSuccess?.();
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      onError?.(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle ACH/Bank transfer
  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    setIsProcessing(true);
    try {
      const { paymentIntent } = await stripe!.confirmAchPayment(
        publicToken,
        {
          payment_method_data: {
            type: 'us_bank_account',
            billing_details: {
              name: metadata.account.name,
            },
          },
        }
      );

      if (paymentIntent.status === 'succeeded') {
        await confirmPayment.mutateAsync({ paymentIntentId: paymentIntent.id });
        onSuccess?.();
      }
    } catch (error) {
      console.error('ACH payment error:', error);
      onError?.(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Set payment timeout
    const timeout = setTimeout(() => {
      setError('Payment timed out. Please try again.');
      setIsProcessing(false);
      schedulePaymentRetry(bookingId);
    }, PAYMENT_TIMEOUT);

    setTimeoutId(timeout);

    try {
      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      clearTimeout(timeout);

      if (paymentError) {
        setError(paymentError.message || 'Failed to process payment');
        onError?.(new Error(paymentError.message || 'Payment failed'));
        // Schedule retry for failed payment
        await schedulePaymentRetry(bookingId);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        await confirmPayment.mutateAsync({ paymentIntentId: paymentIntent.id });
        onSuccess?.();
      }
    } catch (err) {
      clearTimeout(timeout);
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
      // Schedule retry for failed payment
      await schedulePaymentRetry(bookingId);
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
        <CardTitle>Complete Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethodType)}>
          <TabsList>
            <TabsTrigger value="card">Credit Card</TabsTrigger>
            {paymentRequest && (
              <TabsTrigger value="wallet">Apple/Google Pay</TabsTrigger>
            )}
            <TabsTrigger value="paypal">PayPal</TabsTrigger>
            <TabsTrigger value="bank">Bank Account</TabsTrigger>
          </TabsList>

          <TabsContent value="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-3 border rounded-md">
                <PaymentElement
                  options={{
                    layout: {
                      type: 'tabs',
                      defaultCollapsed: false,
                    },
                  }}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Total</p>
                  <p className="text-2xl font-bold">${amount}</p>
                </div>
                <Button
                  type="submit"
                  disabled={!stripe || isProcessing}
                  className="min-w-[120px]"
                >
                  {isProcessing ? 'Processing...' : 'Pay Now'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="wallet">
            {paymentRequest && (
              <PaymentRequestButtonElement
                options={{ paymentRequest }}
                onClick={handleWalletPayment}
              />
            )}
          </TabsContent>

          <TabsContent value="paypal">
            <PayPalButtons
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: amount.toString(),
                    },
                  }],
                });
              }}
              onApprove={handlePayPalPayment}
            />
          </TabsContent>

          <TabsContent value="bank">
            <PlaidLink
              clientName="Your App Name"
              env="sandbox"
              product={['auth', 'transactions']}
              publicKey="your_plaid_public_key"
              onSuccess={handlePlaidSuccess}
              className="w-full"
            >
              <Button className="w-full">
                Connect Bank Account
              </Button>
            </PlaidLink>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 