import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

export type Tables = Database['public']['Tables'];
export type Category = Tables['categories']['Row'];
export type Service = Tables['services']['Row'];
export type Business = Tables['businesses']['Row'];
export type Booking = Tables['bookings']['Row'];
export type Profile = Tables['profiles']['Row'];

export type AuthUser = {
  id: string;
  email?: string;
  role?: 'super_admin' | 'admin' | 'provider' | 'client';
  avatar_url?: string | null;
  user_metadata?: {
    full_name?: string;
  };
};