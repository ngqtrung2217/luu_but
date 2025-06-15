-- First, get your user ID from Supabase Auth
-- You can find this in the Auth > Users section of the Supabase Dashboard
-- Or by running this query in the Supabase SQL Editor:
-- SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Once you have your user ID, replace YOUR_USER_ID_HERE with it
-- and run this script in the SQL Editor

INSERT INTO public.admin_users (user_id)
VALUES ('YOUR_USER_ID_HERE')
ON CONFLICT (user_id) DO NOTHING;
