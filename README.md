# PTB Time Management System v1

Designed for a small accounting office (5-7 staff, about 5 entries per person per day).

## Vercel Environment Variables
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

## Supabase setup
1. Create a Supabase project.
2. Go to SQL Editor.
3. Run `supabase/schema.sql`.
4. Go to Authentication > Users, create staff users.
5. In Table Editor > profiles, change role to admin/manager/staff as needed.
