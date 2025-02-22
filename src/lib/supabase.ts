import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please check your environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        } catch {
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error('Error storing auth state:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing auth state:', error);
        }
      }
    }
  }
});

// Add error handling for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    // Clear any local state
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('supabase.auth.')) {
        localStorage.removeItem(key);
      }
    }
  }
});