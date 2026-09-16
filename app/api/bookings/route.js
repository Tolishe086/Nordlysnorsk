import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { isAdminRequest } from '../../../lib/auth';

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*, courses(name, level, start_date)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
