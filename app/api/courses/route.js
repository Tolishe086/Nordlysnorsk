import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { isAdminRequest } from '../../../lib/auth';

// Public: list all courses with live seat availability.
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('course_availability')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// Admin only: add a new course.
export async function POST(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, level, format, description, price_cents, currency, total_seats, start_date } = body;

  if (!name || !level || !format || !price_cents || !total_seats) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('courses')
    .insert([{ name, level, format, description, price_cents, currency: currency || 'nok', total_seats, start_date }])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data[0]);
}
