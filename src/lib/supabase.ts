import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uzjminstcjrjhgqhgvty.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_uVEVrVri7epz4awVkp7auw_a1m6PoYU';

// Client-side Supabase client (respects Row Level Security)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side / Admin Supabase client (bypasses RLS when needed for administrative webhooks/jobs)
export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
