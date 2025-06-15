# Supabase Music Player Fix

This script can fix issues with music database connectivity in your Next.js project.

## Steps to fix:

1. Make sure your `.env.local` has the necessary Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. Run the SQL queries from `scripts/setup-supabase.sql` in your Supabase dashboard SQL editor.

3. Create a "songs" bucket in Supabase storage with public read access.

4. Update your MusicPlayer component to add better error handling.

## Example code for MusicPlayer:

```jsx
// Check for Supabase connectivity:
console.log("MusicPlayer: Checking connection to Supabase:", process.env.NEXT_PUBLIC_SUPABASE_URL);

try {
  // Simple ping query
  const { error } = await supabase
    .from('music_meta')
    .select('count(*)', { count: 'exact', head: true });

  if (error) {
    console.error("Database connection error:", error);
    return;
  }
  
  // Your actual query...
} catch (err) {
  console.error("Critical connection error:", err);
}
```

## Troubleshooting

If you still have connection issues after these fixes:

1. Check network connectivity to Supabase
2. Verify your RLS policies allow public select access on music_meta table
3. Check browser console for CORS errors
4. Verify your storage bucket permissions
