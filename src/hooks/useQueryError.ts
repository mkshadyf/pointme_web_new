import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { isSupabaseError } from '../lib/errors';

export function useQueryError() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(event => {
      if (event.type === 'updated' && event.query.state.error) {
        const error = event.query.state.error;

        // Log error for debugging
        console.error('Query Error:', {
          error,
          query: event.query.queryKey,
          time: new Date().toISOString(),
        });

        // Show user-friendly error message
        if (isSupabaseError(error)) {
          toast.error(error.message, {
            id: `error-${event.query.queryHash}`, // Prevent duplicate toasts
            duration: 5000,
          });
        } else {
          toast.error('An unexpected error occurred. Please try again.', {
            id: `error-${event.query.queryHash}`,
            duration: 5000,
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);
} 