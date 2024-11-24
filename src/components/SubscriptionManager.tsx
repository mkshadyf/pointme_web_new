import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { useSubscription } from '../hooks/useSubscription';
import { LoadingState } from './LoadingState';
import { ErrorMessage } from './ErrorMessage';
import { ConfirmDialog } from './ConfirmDialog';
import type { SubscriptionPlan } from '../types/subscription';

export function SubscriptionManager() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { subscription, plans, createSubscription, cancelSubscription, updateSubscription } = useSubscription();

  if (!plans) return <LoadingState />;

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      if (!subscription) {
        await createSubscription.mutateAsync({ planId: plan.id });
      } else {
        await updateSubscription.mutateAsync({ planId: plan.id });
      }
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSubscription.mutateAsync({});
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Cancellation error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={
              subscription?.plan_id === plan.id
                ? 'ring-2 ring-primary-500'
                : ''
            }>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-2xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-gray-500">
                    /{plan.interval}
                  </span>
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full mt-6"
                  onClick={() => handleSubscribe(plan)}
                  disabled={subscription?.plan_id === plan.id}
                >
                  {subscription?.plan_id === plan.id
                    ? 'Current Plan'
                    : subscription
                    ? 'Switch Plan'
                    : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {subscription && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Current Subscription</h3>
                <p className="text-sm text-gray-500">
                  Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(true)}
              >
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancel}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period."
        confirmText="Yes, Cancel"
        type="danger"
      />
    </div>
  );
} 