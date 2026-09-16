import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { isAdminRequest } from '../../../../lib/auth';

export async function PATCH(request, { params }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from('courses')
    .update(body)
    .eq('id', params.id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}

export async function DELETE(request, { params }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabaseAdmin.from('courses').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
