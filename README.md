# Smart Attendance – Vercel + Postgres

## One-time setup
1. Create a free Postgres (Neon.io) database. Get `DATABASE_URL`.
2. Run `schema.sql` on the database.
3. On Vercel, create a new project from this folder.
4. Set Environment Variables:
   - `DATABASE_URL` = your Postgres URL
   - `ADMIN_KEY` = any secret for professor actions
   - `GEO_LAT` = 26.843983727627208
   - `GEO_LON` = 75.56469440460206
   - `GEO_RADIUS_M` = 200
5. Deploy.

## Professor Page
- Open the root URL. Enter Admin Key.
- Choose classroom: LHC 001, LHC 002, LHC003, LHC004, LHC101, LHC102, LHC103, LHC104.
- Activate/Close session.
- Live logs update every 3s (polling).

## API (mobile app uses these)
- `POST /api/users/register` { regNo, name, deviceMac }
- `POST /api/attendance/mark` { regNo, deviceMac, lat, lon, classroom }
- `GET /api/sessions/active`
- `GET /api/attendance?sessionId=...`
- Admin:
  - `POST /api/sessions/open` (header `x-admin-key`)
  - `POST /api/sessions/close` (header `x-admin-key`)
  - `POST /api/attendance/edit` (header `x-admin-key`)
