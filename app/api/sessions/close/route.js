import { query } from '../../../lib/db';
export async function POST(req) {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const { sessionId } = await req.json();
  if (!sessionId) return new Response(JSON.stringify({ error: 'Missing sessionId' }), { status: 400 });
  await query('update sessions set closed_at = now() where id = $1', [sessionId]);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
}
