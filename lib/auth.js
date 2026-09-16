// Minimal single-password admin check, sent as a header on each admin
// request. Fine for one owner/operator. If more than one staff member
// needs the admin area, switch this to Supabase Auth with real accounts.
export function isAdminRequest(request) {
  const password = request.headers.get('x-admin-password');
  return Boolean(password) && password === process.env.ADMIN_PASSWORD;
}
