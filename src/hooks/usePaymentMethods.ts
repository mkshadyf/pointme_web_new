import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { PaymentMethod } from '../types/payment';

export function usePaymentMethods() {
  const queryClient = useQueryClient();

  const { data: paymentMethods, isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addPaymentMethod = useMutation({
    mutationFn: async (paymentMethod: Omit<PaymentMethod, 'id' | 'user_id'>) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          ...paymentMethod,
          user_id: session.session.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });

  const updatePaymentMethod = useMutation({
    mutationFn: async (paymentMethod: PaymentMethod) => {
      const { data, error } = await supabase
        .from('payment_methods')
        .update(paymentMethod)
        .eq('id', paymentMethod.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });

  const deletePaymentMethod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });

  return {
    paymentMethods,
    isLoading,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  };
} 