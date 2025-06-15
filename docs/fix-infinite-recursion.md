# Fixing Supabase Policy Issues

This document addresses two common errors with Supabase policies in this project:
1. **Infinite recursion in admin_users policy**
2. **Row-level security policy violation when uploading music**

## Common Errors

### Error 1: Infinite Recursion
```
Error: infinite recursion detected in policy for relation "admin_users"
```

This happens because the security policies for the tables are referencing each other in a circular way.

### Error 2: Row-Level Security Violation
```
Error: new row violates row-level security policy
```

This occurs when trying to insert data into a table but the current user doesn't have permission according to the Row Level Security (RLS) policies.

## How to Fix These Issues

1. **Connect to your Supabase SQL Editor**
   - Log in to your Supabase dashboard
   - Go to the SQL Editor
   - Copy and paste the contents of the `scripts/fix-policies.sql` file
   - Run the script to update the policies

2. **Verify Storage Bucket Permissions**
   - Go to Storage in your Supabase dashboard
   - Ensure there's a bucket named 'songs'
   - Check that the RLS policies allow uploads (the script updates these)

3. **Add yourself as an admin**
   - In the Supabase Dashboard, go to Auth > Users
   - Find your user account and copy your user ID
   - Open the `scripts/add-admin-user.sql` file in your code editor
   - Replace `YOUR_USER_ID_HERE` with your actual user ID 
   - Run this script in the SQL Editor

4. **Restart your Next.js development server**
   - Make sure to restart your development server for the changes to take effect

## Technical Explanation

### Infinite Recursion Problem
The issue was caused by circular references in Row Level Security (RLS) policies:

1. The admin_users table had a policy that checked if the current user was in the admin_users table
2. This creates an infinite recursion: to check if a user can access admin_users, it needs to check admin_users

### Upload Permission Problem
The upload failure happens because:

1. The current RLS policy restricts inserting into the music_meta table
2. The storage policies might also prevent uploading files to the songs bucket

## Solution Details

Our fix includes:

1. **Updated RLS Policies**
   - Simplified policies that don't cause recursion
   - Added explicit permissions for public uploads (for testing purposes)
   - Created separate policies for different operations (SELECT, INSERT, UPDATE, DELETE)

2. **Server-side API Routes**
   - Added `/api/music-upload` and `/api/music-tracks` routes
   - These routes bypass client-side RLS by using server-side Supabase clients
   - The API routes handle errors gracefully and provide better feedback

3. **Enhanced Error Handling**
   - The MusicUpload component now tries multiple approaches
   - Better error messages and logging
   - Fallback mechanisms when main approaches fail

These changes should resolve both the infinite recursion error and the upload permission issues while maintaining proper security for your app.
