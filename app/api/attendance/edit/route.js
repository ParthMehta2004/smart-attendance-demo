import { query } from '../../../lib/db';
export async function POST(req) {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const { attendanceId, newRegNo, deleteEntry } = await req.json();
  if (deleteEntry) {
    await query('delete from attendance where id = $1', [attendanceId]);
    return new Response(JSON.stringify({ ok: true }));
  }
  if (attendanceId && newRegNo) {
    const user = await query('select * from users where reg_no = $1', [newRegNo]);
    if (!user.rows.length) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    await query('update attendance set user_id = $1 where id = $2', [user.rows[0].id, attendanceId]);
    return new Response(JSON.stringify({ ok: true }));
  }
  return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 });
}
