import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Define types for our database tables
export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  email?: string;
  created_at: string;
};

export type MusicTrack = {
  id: string;
  title: string;
  file_path: string;
  created_at: string;
  artist?: string; // Optional artist field
};
