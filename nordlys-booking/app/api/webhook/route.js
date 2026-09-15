import { supabaseAdmin } from '../../../lib/supabase';
import { stripe } from '../../../lib/stripe';

// Stripe needs the raw request body (unmodified) to verify the signature,
// which request.text() gives us directly in the App Router — no extra
// config needed here.
export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.metadata?.booking_id;
    if (bookingId) {
      await supabaseAdmin.from('bookings').update({ status: 'paid' }).eq('id', bookingId);
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const bookingId = session.metadata?.booking_id;
    if (bookingId) {
      await supabaseAdmin.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    }
  }

  return new Response('ok', { status: 200 });
}
