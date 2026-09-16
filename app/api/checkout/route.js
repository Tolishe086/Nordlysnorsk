import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { stripe } from '../../../lib/stripe';

export async function POST(request) {
  const { courseId, customerName, customerEmail, seats } = await request.json();
  const seatsRequested = seats || 1;

  if (!courseId || !customerName || !customerEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: course, error } = await supabaseAdmin
    .from('course_availability')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error || !course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }
  if (course.seats_available < seatsRequested) {
    return NextResponse.json({ error: 'Not enough seats available' }, { status: 409 });
  }

  // Record a "pending" booking now. It doesn't count against seats_available
  // (the view only counts "paid" rows) — it turns into a real seat once
  // Stripe's webhook confirms the payment below.
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .insert([{
      course_id: courseId,
      customer_name: customerName,
      customer_email: customerEmail,
      seats_booked: seatsRequested,
      status: 'pending',
    }])
    .select()
    .single();

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [{
      price_data: {
        currency: course.currency,
        product_data: { name: `${course.name} (${course.level})` },
        unit_amount: course.price_cents,
      },
      quantity: seatsRequested,
    }],
    success_url: `${process.env.SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_URL}/courses/${courseId}`,
    metadata: { booking_id: booking.id },
  });

  await supabaseAdmin
    .from('bookings')
    .update({ stripe_session_id: session.id })
    .eq('id', booking.id);

  return NextResponse.json({ url: session.url });
}
