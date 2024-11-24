import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { isSupabaseError } from './errors';

// Create a function to handle errors consistently
const handleError = (error: unknown) => {
  console.error('Query Error:', error);
  if (isSupabaseError(error)) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        if (isSupabaseError(error)) {
          // Don't retry auth errors or data constraint errors
          if (error.code?.startsWith('2')) return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 0, // Set to 0 to always fetch fresh data
      gcTime: 1000 * 60 * 5, // Cache for 5 minutes then garbage collect
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchOnReconnect: true, // Refetch when internet reconnects
      refetchOnMount: true, // Refetch when component mounts
    },
    mutations: {
      retry: false,
      onSuccess: () => {
        // Invalidate and refetch all queries when any mutation succeeds
        queryClient.invalidateQueries();
      },
    },
  },
});

// Add global error handlers
queryClient.getQueryCache().subscribe(({ type, query }) => {
  if (type === 'updated' && query.state.error) {
    handleError(query.state.error);
  }
});

queryClient.getMutationCache().subscribe(({ type, mutation }) => {
  if (type === 'updated' && mutation.state.error) {
    handleError(mutation.state.error);
  }
});

// Add a function to manually clear the cache
export const clearQueryCache = () => {
  queryClient.clear(); // Clear all cache
};

// Add a function to invalidate specific queries
export const invalidateQueries = (queryKey?: string[]) => {
  if (queryKey) {
    queryClient.invalidateQueries({ queryKey });
  } else {
    queryClient.invalidateQueries();
  }
};