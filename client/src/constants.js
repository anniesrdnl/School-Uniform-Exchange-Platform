// Listing options shared by the home page, browse filters and sell form.
// Keep in sync with the check constraints in server/supabase/schema.sql.
export const CATEGORIES = ['Uniform Shirt', 'Pants / Skirt', 'PE Uniform', 'Accessories'];
export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
export const CONDITION_HINTS = { New: 'Never worn', 'Like New': 'Worn a few times, no visible wear', Good: 'Normal wear, no damage', Fair: 'Visible wear such as fading' };
export const EXCHANGE_OPTIONS = ['Buy Only', 'Exchange Only', 'Buy or Exchange'];
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Browse results grid (shared with its loading placeholder in components/PageSkeletons.jsx)
export const BROWSE_GRID = 'grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5';

// Icon (components/Icon.jsx) for each category
export const CATEGORY_STYLES = {
  'Uniform Shirt': { icon: 'shirt' },
  'Pants / Skirt': { icon: 'pants' },
  'PE Uniform': { icon: 'jersey' },
  Accessories: { icon: 'tie' },
};

// ₱1,250 or ₱99.5 — peso amount with thousands separators
export const formatPrice = (value) => `₱${Number(value || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}`;

// "3 days ago", "2 months ago": how long ago a listing was posted
const RELATIVE = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const STEPS = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
export const timeAgo = (date) => {
  const seconds = (new Date(date) - Date.now()) / 1000;
  if (Math.abs(seconds) < 60) return 'just now';
  const [unit, size] = STEPS.find(([, s]) => Math.abs(seconds) >= s) || ['minute', 60];
  return RELATIVE.format(Math.round(seconds / size), unit);
};

// Online indicator: someone counts as active if they used the site in the last 2 minutes (the server records
// activity at most once a minute, and open chats keep polling). Returns { online, label }.
const ACTIVE_MS = 2 * 60 * 1000;
export const presence = (lastSeenAt) => {
  const ago = lastSeenAt ? Date.now() - new Date(lastSeenAt) : Infinity;
  if (ago < ACTIVE_MS) return { online: true, label: 'Active now' };
  if (ago < 86400000) {
    const minutes = Math.round(ago / 60000);
    return { online: false, label: `Active ${minutes < 60 ? `${minutes}m` : `${Math.round(minutes / 60)}h`} ago` };
  }
  return { online: false, label: 'Offline' };
};
