import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Subscription, SubscriptionPlan } from '../types/subscription';

export function useSubscription() {
  const queryClient = useQueryClient();

  const { data: subscription } = useQuery<Subscription>({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('customer_id', session.session.user.id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: plans } = useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (error) throw error;
      return data;
    },
  });

  const createSubscription = useMutation({
    mutationFn: async ({ planId }: { planId: string }) => {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { planId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async ({ atPeriodEnd = true }: { atPeriodEnd?: boolean }) => {
      if (!subscription) throw new Error('No active subscription');

      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscriptionId: subscription.id,
          atPeriodEnd,
        },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  const updateSubscription = useMutation({
    mutationFn: async ({ planId }: { planId: string }) => {
      if (!subscription) throw new Error('No active subscription');

      const { error } = await supabase.functions.invoke('update-subscription', {
        body: {
          subscriptionId: subscription.id,
          planId,
        },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  return {
    subscription,
    plans,
    createSubscription,
    cancelSubscription,
    updateSubscription,
  };
} 