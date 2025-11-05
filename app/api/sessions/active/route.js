import { query } from '../../../lib/db';
export async function GET() {
  const active = await query('select * from sessions where closed_at is null order by opened_at desc limit 1', []);
  return new Response(JSON.stringify({ session: active.rows[0] || null }), { headers: { 'content-type': 'application/json' } });
}
