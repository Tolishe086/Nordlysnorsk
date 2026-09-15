# Nordlys Norsk — course booking site

A working booking site: course catalog with live seat counts, Stripe
Checkout for payment, and a password-protected admin page to add
courses and see who's booked. Built with Next.js.

You'll need three free accounts to run this: **Supabase** (database),
**Stripe** (payments), and **Vercel** (hosting). Total setup time is
roughly 30–45 minutes.

## 1. Set up the database (Supabase)

1. Go to supabase.com, create a free account, and create a new project.
2. Once it's ready, open **SQL Editor > New query**, paste in the
   contents of `supabase/schema.sql`, and run it. This creates the
   `courses` and `bookings` tables and a view that calculates live
   seat availability.
3. Go to **Project Settings > API** and copy:
   - **Project URL** → this is `SUPABASE_URL`
   - **service_role key** (not the anon key) → this is `SUPABASE_SERVICE_ROLE_KEY`

## 2. Set up payments (Stripe)

1. Go to stripe.com and create an account. You can build and test
   everything in **test mode** before you ever touch real money.
2. Go to **Developers > API keys** and copy the **Secret key**
   (starts with `sk_test_...` in test mode) → this is `STRIPE_SECRET_KEY`.
3. You'll add the webhook secret (`STRIPE_WEBHOOK_SECRET`) after
   deploying, in step 4 — Stripe needs your live URL first.

## 3. Configure and deploy (Vercel)

1. Push this folder to a GitHub repository.
2. Go to vercel.com, create an account, and import that repository.
3. Before the first deploy, add these environment variables in
   Vercel's project settings (copy from `.env.example`):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `ADMIN_PASSWORD` — pick your own
   - `SITE_URL` — your Vercel URL, e.g. `https://nordlys-norsk.vercel.app`
   (Leave `STRIPE_WEBHOOK_SECRET` blank for now.)
4. Deploy. You should see the (empty) course catalog live.

## 4. Connect the Stripe webhook

This is the step that makes seats actually update after payment —
don't skip it.

1. In Stripe, go to **Developers > Webhooks > Add endpoint**.
2. Endpoint URL: `https://YOUR-SITE-URL/api/webhook`
3. Listen for these events: `checkout.session.completed` and
   `checkout.session.expired`.
4. After creating it, Stripe shows a **Signing secret**
   (`whsec_...`) → add this to Vercel as `STRIPE_WEBHOOK_SECRET`,
   then redeploy.

## 5. Add your first course

1. Visit `https://YOUR-SITE-URL/admin` and log in with your
   `ADMIN_PASSWORD`.
2. Fill in the "Add a course" form. Price is in the smallest currency
   unit (øre for NOK, pence for GBP) — e.g. 928 kr = `92800`.
3. It'll now show up on the homepage. Test a full booking yourself
   using a [Stripe test card](https://docs.stripe.com/testing) —
   `4242 4242 4242 4242`, any future expiry, any CVC.
4. Check `/admin` again — the booking should show as `paid` and the
   seat count should have dropped by one.

## Going live

Once you've tested a full booking end to end:

1. In Stripe, flip out of test mode (top-left toggle) and repeat
   step 2 and step 4 above with your **live** keys — you'll get a
   new secret key and a new webhook signing secret for live mode.
2. Update `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Vercel
   to the live values, and redeploy.
3. Point your real domain at the Vercel project (Vercel's docs cover
   custom domains), and update `SITE_URL` to match.

## Known limitations, worth knowing about

- **Admin login** is a single shared password, not real user
  accounts. Fine for one person running the school; if several staff
  need separate logins, swap this for Supabase Auth.
- **Overbooking window**: two people paying for the last seat at the
  exact same second could both succeed, since the seat check happens
  right before checkout rather than inside a database lock. For a
  language school's booking volumes this is a very unlikely edge
  case, but worth knowing if you ever expect a rush on a single course.
- **No automated confirmation emails** yet — Stripe sends its own
  payment receipt, but nothing from the school itself. Adding this
  (e.g. via Resend or Supabase's email integration) is a reasonable
  next step.
- **Editing a course's price/seats** after it's created works from
  `/admin` via the delete button and re-adding for now — there's no
  in-place edit form yet.
