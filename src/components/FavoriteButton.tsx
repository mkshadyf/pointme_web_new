import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface FavoriteButtonProps {
  serviceId?: string;
  providerId?: string;
}

export function FavoriteButton({ serviceId, providerId }: FavoriteButtonProps) {
  const { data: favorite, refetch } = useQuery({
    queryKey: ['favorite', serviceId, providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_favorites')
        .select('*')
        .match({
          ...(serviceId && { service_id: serviceId }),
          ...(providerId && { provider_id: providerId }),
        })
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (favorite) {
        const { error } = await supabase
          .from('customer_favorites')
          .delete()
          .match({
            ...(serviceId && { service_id: serviceId }),
            ...(providerId && { provider_id: providerId }),
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customer_favorites')
          .insert({
            ...(serviceId && { service_id: serviceId }),
            ...(providerId && { provider_id: providerId }),
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      refetch();
      toast.success(favorite ? 'Removed from favorites' : 'Added to favorites');
    },
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggleFavorite.mutate()}
      className={favorite ? 'text-red-500' : 'text-gray-500'}
    >
      <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
    </Button>
  );
} 