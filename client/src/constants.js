// Listing options shared by the home page, browse filters and sell form.
// Keep in sync with the check constraints in server/supabase/schema.sql.
export const CATEGORIES = ['Uniform Shirt', 'Pants / Skirt', 'PE Uniform', 'Accessories'];
export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
export const EXCHANGE_OPTIONS = ['Buy Only', 'Exchange Only', 'Buy or Exchange'];
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Icon (components/Icon.jsx) and palette tile for each category
export const CATEGORY_STYLES = {
  'Uniform Shirt': { icon: 'shirt', tile: 'bg-aqua' },
  'Pants / Skirt': { icon: 'pants', tile: 'bg-cream' },
  'PE Uniform': { icon: 'bolt', tile: 'bg-powder' },
  Accessories: { icon: 'tie', tile: 'bg-frost' },
};

// ₱1,250 or ₱99.5 — peso amount with thousands separators
export const formatPrice = (value) => `₱${Number(value || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}`;
