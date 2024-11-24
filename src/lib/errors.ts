import { PostgrestError } from '@supabase/supabase-js';

export class SupabaseError extends Error {
  constructor(
    message: string,
    public originalError: PostgrestError,
    public code?: string
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export function handleSupabaseError(error: PostgrestError): never {
  const message = getErrorMessage(error);
  throw new SupabaseError(message, error, error.code);
}

function getErrorMessage(error: PostgrestError): string {
  switch (error.code) {
    case '23505': // unique_violation
      return 'This record already exists.';
    case '23503': // foreign_key_violation
      return 'This operation would break data relationships.';
    case '42P01': // undefined_table
      return 'Database table not found.';
    case '42703': // undefined_column
      return 'Invalid data structure.';
    case '28000': // invalid_authorization_specification
    case '28P01': // invalid_password
      return 'Authentication failed.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
}

export function isSupabaseError(error: unknown): error is SupabaseError {
  return error instanceof SupabaseError;
} 