create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text default 'staff' check (role in ('admin','manager','staff')),
  created_at timestamptz default now()
);
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);
create table if not exists time_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  staff_id uuid references profiles(id) on delete cascade not null,
  client_id uuid references clients(id) on delete restrict not null,
  job_name text not null,
  hours numeric(6,2) not null check (hours > 0),
  details text,
  billable boolean default true,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
alter table clients enable row level security;
alter table time_entries enable row level security;
create policy "profiles read own or manager" on profiles for select using (auth.uid() = id or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','manager')));
create policy "clients read all logged in" on clients for select using (auth.role()='authenticated');
create policy "clients insert logged in" on clients for insert with check (auth.role()='authenticated');
create policy "time read own or manager" on time_entries for select using (staff_id=auth.uid() or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','manager')));
create policy "time insert own" on time_entries for insert with check (staff_id=auth.uid());
create policy "time update own" on time_entries for update using (staff_id=auth.uid());
create policy "time delete own" on time_entries for delete using (staff_id=auth.uid());
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), 'staff')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
