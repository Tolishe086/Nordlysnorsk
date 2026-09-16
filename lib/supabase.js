import { createClient } from '@supabase/supabase-js';

// Uses the SERVICE ROLE key — this file only ever runs on the server
// (API routes / server components), never in the browser. Never expose
// this key in client-side code.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
