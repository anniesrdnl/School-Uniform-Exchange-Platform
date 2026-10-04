// Run once (after running supabase/schema.sql):  npm run seed
// Creates an admin, two students and a few sample listings (no photos).
// Needs SUPABASE_SERVICE_ROLE_KEY in .env. Existing accounts with the same email are reused.
import 'dotenv/config';
import { supabase } from './supabaseServer.js';
import { check } from './config/db.js';

async function ensureUser({ email, password, fullName, studentId, program, yearLevel, role = 'student' }) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, student_id: studentId, program, year_level: yearLevel },
  });

  let id = data?.user?.id;
  if (error) {
    // already registered -> look up the existing profile
    const existing = check(await supabase.from('profiles').select('id').eq('email', email).maybeSingle());
    if (!existing) throw error;
    id = existing.id;
  }

  check(await supabase.from('profiles').update({ role, verified: true }).eq('id', id));
  console.log(`✔ ${email} / ${password} (${role})`);
  return id;
}

await ensureUser({
  email: 'admin@school.edu', password: 'admin123', fullName: 'Admin', studentId: 'ADMIN-001',
  program: 'Administration', yearLevel: '-', role: 'admin',
});
const maria = await ensureUser({
  email: 'maria@school.edu', password: 'student123', fullName: 'Maria Santos', studentId: '2026-00002',
  program: 'BSIT', yearLevel: '4th Year',
});
await ensureUser({
  email: 'juan@school.edu', password: 'student123', fullName: 'Juan Dela Cruz', studentId: '2026-00001',
  program: 'BS Information Technology', yearLevel: '3rd Year',
});

// replace Maria's sample listings
check(await supabase.from('listings').delete().eq('seller', maria));
check(await supabase.from('listings').insert([
  { seller: maria, title: 'School Polo Shirt', category: 'Uniform Shirt', size: 'M', condition: 'Good', price: 250, exchange_option: 'Buy or Exchange', description: 'Used but in good condition. Clean and well maintained.' },
  { seller: maria, title: 'Navy Skirt', category: 'Pants / Skirt', size: 'L', condition: 'Like New', price: 300, exchange_option: 'Buy Only', description: '' },
  { seller: maria, title: 'PE Shirt', category: 'PE Uniform', size: 'M', condition: 'Good', price: 200, exchange_option: 'Exchange Only', description: '' },
  { seller: maria, title: 'PE Pants', category: 'PE Uniform', size: 'L', condition: 'Good', price: 250, exchange_option: 'Buy Only', description: '' },
]));

console.log('✔ Sample listings created');
process.exit(0);
