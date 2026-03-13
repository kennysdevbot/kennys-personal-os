import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create client only if configured; otherwise provide a dummy that logs warnings
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new Proxy({} as SupabaseClient, {
      get(_target, prop) {
        if (prop === 'from') {
          return () => ({
            select: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }),
            insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            upsert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          });
        }
        return () => ({});
      },
    }) as unknown as SupabaseClient);
