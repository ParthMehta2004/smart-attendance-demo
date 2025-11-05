import { query } from '../../../lib/db';
import { distanceMeters } from '../../../lib/geo';

export async function POST(req) {
  const body = await req.json();
  const { regNo, deviceMac, lat, lon, classroom } = body || {};
  if (!regNo || !deviceMac || typeof lat !== 'number' || typeof lon !== 'number' || !classroom) {
    return new Response(JSON.stringify({ error: 'regNo, deviceMac, lat, lon, classroom required' }), { status: 400 });
  }
  // find active session for classroom
  const act = await query('select * from sessions where closed_at is null and classroom = $1 limit 1', [classroom]);
  if (!act.rows.length) return new Response(JSON.stringify({ error: 'No active session for this classroom' }), { status: 409 });
  const session = act.rows[0];

  // user
  const ures = await query('select * from users where reg_no = $1', [regNo]);
  if (!ures.rows.length) return new Response(JSON.stringify({ error: 'User not found. Register first.' }), { status: 404 });
  const user = ures.rows[0];
  if (user.device_mac !== deviceMac) return new Response(JSON.stringify({ error: 'Device mismatch for this user' }), { status: 403 });

  // geo fence
  const geoLat = parseFloat(process.env.GEO_LAT || '26.843983727627208');
  const geoLon = parseFloat(process.env.GEO_LON || '75.56469440460206');
  const radius = parseFloat(process.env.GEO_RADIUS_M || '200');
  const d = distanceMeters(geoLat, geoLon, lat, lon);
  if (d > radius) return new Response(JSON.stringify({ error: 'Outside allowed location radius', distance: d }), { status: 403 });

  // insert attendance (unique constraints enforce no duplicate user/mac per session)
  try {
    const ins = await query('insert into attendance(session_id, user_id, lat, lon, device_mac) values($1,$2,$3,$4,$5) returning *', [session.id, user.id, lat, lon, deviceMac]);
    return new Response(JSON.stringify({ ok: true, attendance: ins.rows[0] }), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Already marked or MAC used in this session' }), { status: 409 });
  }
}
