# School Uniform Exchange Platform (SUEPS)

A responsive web app where students buy, sell, and swap school uniforms.
Works on desktop and phones from one codebase.

## Stack
Supabase (Postgres + Auth) · Express · React (Vite) · Node.js · Tailwind CSS · Socket.io · JWT · Cloudinary

## Folder structure
```
uniform-exchange/
├── server/
│   ├── server.js            entry point: Express + Socket.io
│   ├── seed.js              sample data
│   ├── config/              db.js, cloudinary.js
│   ├── middleware/          auth.js (JWT + admin), upload.js (multer), error.js
│   ├── supabase/schema.sql  database tables, triggers, RLS
│   └── routes/              auth, listings, requests, messages, users, admin
└── client/
    └── src/
        ├── api.js           axios instance (adds the JWT)
        ├── context/         AuthContext.jsx
        ├── components/      Navbar (top bar + mobile bottom bar), ListingCard, ProtectedRoute
        └── pages/           Home, Login, Register, Browse, ListingDetails,
                             Sell, Messages, Profile, Admin
```

## Setup

**Requirements:** Node 22+, and the Supabase project. Run `server/supabase/schema.sql` once in the Supabase SQL Editor.

```bash
# 1. Backend
cd server
npm install
cp .env.example .env        # then add the Supabase keys, JWT_SECRET, Cloudinary keys
npm run seed                # optional: sample users + listings
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Seed accounts (after `npm run seed`):
- Admin: `admin@school.edu` / `admin123`
- Student: `juan@school.edu` / `student123`
- Student: `maria@school.edu` / `student123`

Photo uploads need free Cloudinary keys in `server/.env`. Everything else works without them.
Change the seed passwords before deploying anywhere public.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` `/login` | Create account / sign in |
| GET | `/api/auth/me` | Current user |
| GET | `/api/listings` | Browse: `q, category, size, condition, minPrice, maxPrice, sort, page` |
| GET | `/api/listings/:id` | Listing details |
| POST | `/api/listings` | Create (multipart, field `photos` x5) |
| PUT / DELETE | `/api/listings/:id` | Edit / delete own listing |
| GET | `/api/listings/mine` | My listings |
| POST | `/api/requests` | Buyer sends request |
| GET | `/api/requests/incoming` `/outgoing` | Requests I received / sent |
| PATCH | `/api/requests/:id/status` | accepted / declined / cancelled / completed |
| GET/POST | `/api/messages/conversations` | List / start a chat |
| GET/POST | `/api/messages/conversations/:id/messages` | History / send (text + photo) |
| GET | `/api/users/me/stats` | Profile counts |
| POST | `/api/users/reviews` `/reports` | Review after exchange / report content |
| GET | `/api/admin/stats` | Dashboard numbers |
| GET/PATCH/DELETE | `/api/admin/users` `/listings` `/reports` | Moderation (admin only) |

Socket.io events: client emits `conversation:join`; server emits `message:new`.

## Deployment
- **Server → Render** via `render.yaml` (New → Blueprint). Set `CLIENT_URL` to the Vercel URL, plus the Supabase and Cloudinary keys.
  Cloudinary is required in production; the free plan sleeps when idle, so the first request can take ~30 s.
- **Client → Vercel** via `vercel.json`. Set `VITE_API_URL` to the Render URL (no trailing slash), then redeploy.
- **Supabase → Authentication → URL Configuration:** set Site URL to the Vercel URL so confirmation emails link there.

## Exchange flow
`pending` → seller **accepts** (listing becomes `reserved`) → they meet up → seller marks **completed**
(listing becomes `sold`) → both sides can leave a review. A seller can decline, a buyer can cancel.

## Suggested next steps
1. Add input validation (e.g. `express-validator` or `zod`) and rate limiting on `/api/auth`.
2. Block unverified users from posting until an admin verifies their student ID.
3. Add a "school" field so different schools' uniforms don't mix.
4. Show request status inside the chat and add unread-message badges.
5. Edit-listing page, report button on listings, and password reset.
6. Automated tests.

## Known limits of this starter
- Reviews and ratings use a simple `prompt()` for now; replace with a proper form.
- No automated tests yet.
