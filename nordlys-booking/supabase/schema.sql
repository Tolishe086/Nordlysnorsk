-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text not null,           -- A0, A1, A2, B1, B2, C1
  format text not null,          -- Classroom, Virtual, Online, Private
  description text,
  price_cents integer not null,  -- store in the smallest currency unit (øre/pence)
  currency text not null default 'nok',
  total_seats integer not null,
  start_date date,
  created_at timestamptz default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  seats_booked integer not null default 1,
  stripe_session_id text unique,
  status text not null default 'pending', -- pending | paid | cancelled
  created_at timestamptz default now()
);

create index if not exists bookings_course_id_idx on bookings(course_id);

-- Live seat count: total seats minus seats from PAID bookings only.
-- Pending (unpaid checkout) bookings don't hold a seat.
create or replace view course_availability as
select
  c.*,
  c.total_seats - coalesce(sum(b.seats_booked) filter (where b.status = 'paid'), 0) as seats_available
from courses c
left join bookings b on b.course_id = c.id
group by c.id;
