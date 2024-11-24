import { create } from 'zustand';
import type { AuthUser } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (profileError) throw profileError;

    set({ user: { ...data.user, role: profileData.role }, loading: false });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
  setUser: (user) => set({ user, loading: false }),
}));

// Fetch user role after authentication state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!error && data) {
      useAuth.getState().setUser({
        ...session.user,
        role: data.role,
      });
    }
  } else {
    useAuth.getState().setUser(null);
  }
});