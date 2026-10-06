// Helpers for working with Supabase query results.

// Throw the Supabase error (handled by middleware/error.js) or return the data.
export function check({ data, error }) {
  if (error) throw error;
  return data;
}

const camel = (key) => key.replace(/_([a-z])/g, (_m, c) => c.toUpperCase());

// Convert a database row (snake_case) into the shape the client expects:
// camelCase keys plus an `_id` alias for `id`. Works on nested rows and arrays.
export function toClient(value) {
  if (Array.isArray(value)) return value.map(toClient);
  if (!value || typeof value !== 'object' || value instanceof Date) return value;
  const out = {};
  for (const [k, v] of Object.entries(value)) out[camel(k)] = toClient(v);
  if (out.id !== undefined) out._id = out.id;
  return out;
}

// Column lists for embedded profiles (the "populate" equivalents)
export const PUBLIC_PROFILE = 'id, full_name, avatar, program, year_level, verified, rating_avg, rating_count';
