import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

interface UseLoadingStateOptions {
  onError?: (error: Error) => void;
  errorMessage?: string;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback((error: Error) => {
    setError(error);
    setIsLoading(false);
    if (options.onError) {
      options.onError(error);
    }
    toast.error(options.errorMessage || 'An error occurred. Please try again.');
    console.error(error);
  }, [options]);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    handleError,
  };
} 