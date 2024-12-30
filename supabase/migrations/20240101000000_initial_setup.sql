-- Create a basic users table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  twitter_token text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );
