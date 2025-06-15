-- Simple script to fix policies without schema changes
-- This will prevent infinite recursion and allow uploads

-- Drop problematic policies one by one to avoid errors
DROP POLICY IF EXISTS "Allow admin to select" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admin to insert, update, delete" ON public.music_meta;
DROP POLICY IF EXISTS "Allow admin to select all" ON public.luubut;

-- Make sure RLS is enabled on all tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.luubut ENABLE ROW LEVEL SECURITY;

-- 1. Simple policies for admin_users
CREATE POLICY "Allow anyone to view admin_users" ON public.admin_users
FOR SELECT USING (true);

-- 2. Simple policies for music_meta
CREATE POLICY "Allow anyone to view music" ON public.music_meta
FOR SELECT USING (true);

CREATE POLICY "Allow anyone to add music" ON public.music_meta
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to update music" ON public.music_meta
FOR UPDATE USING (true);

CREATE POLICY "Allow anyone to delete music" ON public.music_meta
FOR DELETE USING (true);

-- 3. Simple policies for luubut
CREATE POLICY "Allow anyone to add entries" ON public.luubut
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to view entries" ON public.luubut
FOR SELECT USING (true);

-- 4. Make sure storage bucket exists and has right policies
-- First ensure the 'songs' bucket exists
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name)
    VALUES ('songs', 'songs')
    ON CONFLICT (id) DO NOTHING;
END
$$;

-- Storage policies for public access to songs
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
CREATE POLICY "Allow public access" ON storage.objects
FOR ALL USING (bucket_id = 'songs');
