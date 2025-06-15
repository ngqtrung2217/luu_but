-- Create luubut table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.luubut (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT DEFAULT 'Người bạn ẩn danh',
  message TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create music_meta table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.music_meta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on tables
ALTER TABLE public.luubut ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_meta ENABLE ROW LEVEL SECURITY;

-- Create policies for luubut
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_policies 
        WHERE tablename = 'luubut' AND policyname = 'Allow public to insert only'
    ) THEN
        CREATE POLICY "Allow public to insert only" ON public.luubut
        FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_policies 
        WHERE tablename = 'luubut' AND policyname = 'Allow admin to select all'
    ) THEN
        CREATE POLICY "Allow admin to select all" ON public.luubut
        FOR SELECT USING (
            auth.uid() IN (
                SELECT user_id FROM public.admin_users
            )
        );
    END IF;
END
$$;

-- Create policies for admin_users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_policies 
        WHERE tablename = 'admin_users' AND policyname = 'Allow admin to select'
    ) THEN
        CREATE POLICY "Allow admin to select" ON public.admin_users
        FOR SELECT USING (
            auth.uid() IN (
                SELECT user_id FROM public.admin_users
            )
        );
    END IF;
END
$$;

-- Create policies for music_meta
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_policies 
        WHERE tablename = 'music_meta' AND policyname = 'Allow public to select'
    ) THEN
        CREATE POLICY "Allow public to select" ON public.music_meta
        FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_policies 
        WHERE tablename = 'music_meta' AND policyname = 'Allow admin to insert, update, delete'
    ) THEN
        CREATE POLICY "Allow admin to insert, update, delete" ON public.music_meta
        FOR ALL USING (
            auth.uid() IN (
                SELECT user_id FROM public.admin_users
            )
        );
    END IF;
END
$$;

-- Create index on admin_users if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'admin_users_user_id_idx'
    ) THEN
        CREATE INDEX admin_users_user_id_idx ON public.admin_users (user_id);
    END IF;
END
$$;
