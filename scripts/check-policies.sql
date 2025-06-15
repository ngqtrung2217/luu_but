-- This script checks the current setup of your Supabase policies
-- Run this in the SQL Editor to see your current configuration

-- Check the tables and their owners
SELECT 
    table_name,
    table_schema
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
ORDER BY 
    table_name;

-- Check RLS status for each table
SELECT
    table_name,
    has_row_level_security,
    row_security_active
FROM
    pg_tables
WHERE
    schemaname = 'public'
ORDER BY
    table_name;

-- Check existing policies
SELECT
    pol.polname AS policy_name,
    tbl.relname AS table_name,
    CASE
        WHEN pol.polpermissive THEN 'PERMISSIVE'
        ELSE 'RESTRICTIVE'
    END AS permissive,
    CASE
        WHEN pol.polroles = '{0}' THEN 'PUBLIC'
        ELSE array_to_string(ARRAY(
            SELECT pg_authid.rolname
            FROM pg_authid
            WHERE oid = ANY(pol.polroles)
        ), ', ')
    END AS roles,
    pg_get_expr(pol.polqual, pol.polrelid) AS policy_definition
FROM
    pg_policy pol
    JOIN pg_class tbl ON pol.polrelid = tbl.oid
    JOIN pg_namespace ns ON tbl.relnamespace = ns.oid
WHERE
    ns.nspname = 'public'
ORDER BY
    tbl.relname,
    pol.polname;

-- Check storage bucket policies
SELECT 
    id, 
    name 
FROM 
    storage.buckets;

-- Check storage policies
SELECT 
    * 
FROM 
    pg_policies 
WHERE 
    tablename = 'objects' 
    AND schemaname = 'storage';

-- Check admin_users table structure and content count
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'admin_users' 
    AND table_schema = 'public';

SELECT 
    count(*) 
FROM 
    public.admin_users;
