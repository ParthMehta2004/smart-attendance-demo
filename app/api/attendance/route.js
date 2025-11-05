import { query } from "../../../lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) return new Response(JSON.stringify({ error: "Missing sessionId" }), { status: 400 });

  const rows = await query(
    `select a.id, a.marked_at, u.reg_no, u.name
     from attendance a
     join users u on u.id = a.user_id
     where a.session_id = $1
     order by a.marked_at desc`,
    [sessionId]
  );

  return new Response(JSON.stringify({ rows: rows.rows }), { headers: { "content-type": "application/json" } });
}
