import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { Staff, StaffForm } from '../types/staff';

export function useStaff(businessId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: staffMembers, isLoading, error } = useQuery<Staff[]>({
    queryKey: ['business-staff', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('business_id', businessId)
        .eq('status', 'active')
        .order('full_name');
      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  const createStaff = useMutation({
    mutationFn: async (staff: StaffForm) => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      const { data, error } = await supabase
        .from('staff')
        .insert({
          ...staff,
          business_id: businessId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-staff', businessId] });
      toast.success('Staff member added successfully');
    },
    onError: (error) => {
      console.error('Error adding staff member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add staff member');
    },
  });

  const updateStaff = useMutation({
    mutationFn: async (staff: Staff) => {
      const { data, error } = await supabase
        .from('staff')
        .update({
          ...staff,
          updated_at: new Date().toISOString(),
        })
        .eq('id', staff.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-staff', businessId] });
      toast.success('Staff member updated successfully');
    },
    onError: (error) => {
      console.error('Error updating staff member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update staff member');
    },
  });

  const deleteStaff = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('staff')
        .update({ status: 'inactive' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-staff', businessId] });
      toast.success('Staff member removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove staff member');
    },
  });

  return {
    staffMembers,
    isLoading,
    error,
    createStaff,
    updateStaff,
    deleteStaff,
  };
} 