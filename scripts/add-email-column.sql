-- Add email column to luubut table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'luubut'
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.luubut ADD COLUMN email TEXT;
    END IF;
END
$$;

-- Notify in SQL console
DO $$
BEGIN
    RAISE NOTICE 'Email column has been added to luubut table (if it didn''t exist)';
END
$$;
