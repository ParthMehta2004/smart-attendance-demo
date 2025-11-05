import { query } from "../../../../lib/db";
export async function POST(req) {
  const { regNo, name, deviceMac } = await req.json();

  if (!regNo || !name || !deviceMac) {
    return new Response(JSON.stringify({ error: "regNo, name, deviceMac required" }), { status: 400 });
  }

  const existing = await query("select * from users where reg_no = $1", [regNo]);
  if (existing.rows.length) {
    const u = existing.rows[0];
    if (u.device_mac !== deviceMac) {
      return new Response(JSON.stringify({ error: "Device already linked for this reg no. Contact admin." }), { status: 409 });
    }
    return new Response(JSON.stringify({ ok: true, user: u }), { headers: { "content-type": "application/json" } });
  }

  const exMac = await query("select * from users where device_mac = $1", [deviceMac]);
  if (exMac.rows.length) {
    return new Response(JSON.stringify({ error: "This device is already linked to another account" }), { status: 409 });
  }

  const ins = await query(
    "insert into users(reg_no, name, device_mac) values($1,$2,$3) returning *",
    [regNo, name, deviceMac]
  );

  return new Response(JSON.stringify({ ok: true, user: ins.rows[0] }), { headers: { "content-type": "application/json" } });
}
