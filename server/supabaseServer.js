import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Ensure dotenv loads variables from .env in the server folder
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const anonKey = process.env.SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in server/.env file.');
}
if (!serviceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in server/.env file. Database queries will be blocked by Row Level Security.');
}

const serverOptions = { auth: { persistSession: false, autoRefreshToken: false } };

// Database client: uses the service_role key, so it bypasses RLS. Never expose this key to the browser.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceKey || anonKey || 'placeholder-key',
  serverOptions
);

// Auth client: used only for signUp / signInWithPassword, kept separate so a
// signed-in session never replaces the service_role key on database queries.
export const supabaseAuth = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-key',
  serverOptions
);
