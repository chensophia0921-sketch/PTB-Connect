# PTB Time Management System

A private accounting timesheet web app for internal staff.

## Features
- Staff login with Supabase Auth
- Role based access: admin, manager, staff
- Staff can record their own time
- Managers/admins can view all staff and client summaries
- Client management
- Billable / non-billable hours
- CSV export
- PDF export
- Mobile friendly

## Deployment overview

### 1. Create Supabase project
1. Go to Supabase and create a new project.
2. Open SQL Editor.
3. Copy everything from `supabase/schema.sql` and run it.

### 2. Get Supabase keys
In Supabase:
Project Settings → API

Copy:
- Project URL
- anon public key

### 3. Add environment variables
Create `.env` locally, or add these in Vercel:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Deploy to Vercel
1. Upload this folder to GitHub.
2. Go to Vercel.
3. Import the GitHub repository.
4. Add the two environment variables.
5. Deploy.

## First admin account
1. Sign up through the website.
2. In Supabase SQL Editor, run:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');
```

After that, this account can manage clients and view all reports.

## Privacy
The public can only see the login page. Business data is protected by Supabase Row Level Security policies.
