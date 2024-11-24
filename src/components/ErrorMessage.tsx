import { AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface ErrorMessageProps {
  error: Error | unknown;
  resetError?: () => void;
}

export function ErrorMessage({ error, resetError }: ErrorMessageProps) {
  const errorMessage = error instanceof Error ? error.message : 'An error occurred';

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {errorMessage}
      </p>
      {resetError && (
        <Button onClick={resetError}>
          Try again
        </Button>
      )}
    </div>
  );
} 