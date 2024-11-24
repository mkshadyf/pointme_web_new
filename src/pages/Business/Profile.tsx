import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Business } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function BusinessProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [business, setBusiness] = useState<Business | null>(null);

  const { isLoading } = useQuery({
    queryKey: ['business', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user?.id)
        .single();

      if (error) throw error;
      setBusiness(data);
      return data;
    },
    enabled: !!user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedBusiness: Business) => {
      const { error } = await supabase
        .from('businesses')
        .update(updatedBusiness)
        .eq('id', updatedBusiness.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['business', user?.id] 
      });
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (business) {
      updateMutation.mutate(business);
    }
  };

  if (isLoading || !business) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Business Name"
              value={business?.name || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                business && setBusiness({ ...business, name: e.target.value })
              }
              required
            />
            <FormField
              label="Email"
              type="email"
              value={business?.email || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                business && setBusiness({ ...business, email: e.target.value })
              }
              required
            />
            <FormField
              label="Phone"
              type="tel"
              value={business?.phone || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                business && setBusiness({ ...business, phone: e.target.value })
              }
              required
            />
            <FormField
              label="Address"
              value={business?.address || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                business && setBusiness({ ...business, address: e.target.value })
              }
              required
            />
            <Button type="submit" disabled={updateMutation.isPending}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 