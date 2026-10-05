<div align="center">

# School Uniform Exchange Platform

**Buy, sell, and swap pre-loved school uniforms with students on your campus.**

[Live demo](https://school-uniform-exchange-platform.vercel.app)

</div>

## About

Students outgrow uniforms long before the uniforms wear out. This web app lets them list a uniform in a few
minutes, find the right size for less, chat with the other student, and meet up on campus to hand it over.
It works on phones, tablets, and desktops.

## Features

- **Browse and search** by keyword, category, size, condition, and price
- **Sell** with up to 5 photos, and choose to sell, swap, or both
- **Requests** to buy or swap, which the seller accepts or declines
- **Messaging** between buyer and seller for each listing
- **Profile** with your listings, requests, and reviews
- **Help assistant** that answers common questions
- **Admin dashboard** to verify or ban users, remove listings, and handle reports

## Tech stack

React · Vite · Tailwind CSS · Node.js · Express · Supabase (PostgreSQL + Auth) · Cloudinary · Vercel

## Getting started

**Requirements:** Node.js 22+ and a [Supabase](https://supabase.com/) project.

1. In Supabase, open **SQL Editor** and run `server/supabase/schema.sql` once.
2. Start the API:

   ```bash
   cd server
   npm install
   cp .env.example .env    # fill in the values below
   npm run seed            # optional: sample users and listings
   npm run dev             # http://localhost:5000
   ```

3. In a second terminal, start the frontend:

   ```bash
   cd client
   npm install
   npm run dev             # http://localhost:5173
   ```

### Environment variables (`server/.env`)

| Variable | Description |
|---|---|
| `JWT_SECRET` | Long random string for signing session tokens |
| `CLIENT_URL` | Allowed origins, e.g. `http://localhost:5173` |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | From Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only. Never commit it or expose it to the client. |
| `CLOUDINARY_*` | Photo storage. Optional locally, required in production. |

### Demo accounts

After `npm run seed`: `admin@school.edu` / `admin123` (admin) and `juan@school.edu` / `student123` (student).
Change these before using a public database.

## Deployment

The app deploys to **Vercel** using [`vercel.json`](vercel.json). The frontend is served as static files and
the API runs as a serverless function.

1. Import the repository in Vercel.
2. Add the environment variables above, with `CLIENT_URL` set to your Vercel URL.
3. In Supabase → **Authentication → URL Configuration**, set **Site URL** to your Vercel URL.
