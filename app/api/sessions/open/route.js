import { query } from "../../lib/db";

export async function POST(req) {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await req.json();
  const classroom = String(body.classroom || '');
  if (!classroom) return new Response(JSON.stringify({ error: 'Missing classroom' }), { status: 400 });

  const active = await query('select * from sessions where closed_at is null limit 1', []);
  if (active.rows.length) {
    return new Response(JSON.stringify({ error: 'A session is already active', session: active.rows[0] }), { status: 400 });
  }

  const ins = await query('insert into sessions(classroom) values($1) returning *', [classroom]);
  return new Response(JSON.stringify({ session: ins.rows[0] }), { headers: { 'content-type': 'application/json' } });
}
