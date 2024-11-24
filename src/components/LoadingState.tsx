import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoadingStateProps {
  className?: string;
  message?: string;
}

export function LoadingState({ className, message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8",
      className
    )}>
      <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-4" />
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}

// Also create a loading skeleton component
export function LoadingSkeleton({ count = 1, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="space-y-3 mt-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
} 