-- Postgres schema for Smart Attendance
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  reg_no text unique not null,
  name text not null,
  device_mac text unique not null,
  created_at timestamptz default now()
);

create table if not exists professors (
  id uuid default gen_random_uuid() primary key,
  email text unique,
  password_hash text,
  created_at timestamptz default now()
);

create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  classroom text not null,
  opened_at timestamptz default now(),
  closed_at timestamptz
);

create table if not exists attendance (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  marked_at timestamptz default now(),
  lat double precision,
  lon double precision,
  device_mac text not null
);

-- Prevent multiple marks by same user per session
create unique index if not exists uniq_attendance_session_user on attendance(session_id, user_id);
-- Prevent MAC reuse within a session
create unique index if not exists uniq_attendance_session_mac on attendance(session_id, device_mac);

-- Helper extension
create extension if not exists pgcrypto;
