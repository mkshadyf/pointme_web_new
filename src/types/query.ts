import type { Query } from '@tanstack/react-query';

export interface QueryCacheEvent {
  type: 'added' | 'removed' | 'updated' | 'error';
  query: Query;
  error?: unknown;
}

export interface QueryErrorEvent {
  type: 'error';
  query: Query;
  error: unknown;
}

export interface QuerySuccessEvent {
  type: 'success';
  query: Query;
  data: unknown;
}

export type QueryEvent = QueryErrorEvent | QuerySuccessEvent;

export interface QueryOptions {
  retry?: boolean | number | ((failureCount: number, error: unknown) => boolean);
  retryDelay?: number | ((retryAttempt: number) => number);
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  refetchOnMount?: boolean;
  throwOnError?: boolean;
} 