// Lightweight Supabase catalog client for the UI
// Usage: import { getCatalog } from './data/catalogClient';
// getCatalog() -> Promise<catalog>

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wicdvohhcwmhwlfahofy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpY2R2b2hoY3dtaHdsZmFob2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5ODU2NTYsImV4cCI6MjA3MjU2MTY1Nn0.oWDDpNgWzxUmWA4kmksqGInhWkqzoJv_BO1cjLreP5A";


const placeholderImage = 'src/assets/blueberry.jpg';

let supabase = null;
function getClient() {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY in environment');
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabase;
}

let cached = null;

export async function getCatalog() {
  if (cached) return cached;

  const sb = getClient();

  // fetch categories
  const { data: categories, error: catErr } = await sb
    .from('category')
    .select('id,name,description');
  if (catErr) throw catErr;

  // fetch ice creams
  const { data: items, error: itemErr } = await sb
    .from('ice_cream')
    .select('id,name,category_id,description,price');
  if (itemErr) throw itemErr;

  const cats = (categories || []).map((c, idx) => ({
    categoryIndex: idx,
    category: {
      id: c.id,
      name: c.name,
      description: c.description || '',
    },
    items: [],
  }));

  // Map items into categories
  (items || []).forEach((it) => {
    const cid = it.category_id;
    const cat = cats.find((c) => Number(c.category.id) === Number(cid));
    const entry = {
      id: it.id,
      image: placeholderImage,
      name: it.name,
      description: it.description || '',
      price: it.price != null ? String(it.price) : '0',
    };
    if (cat) cat.items.push(entry);
  });

  // For categories without DB items, ensure empty list exists
  cached = cats;
  return cached;
}

export default { getCatalog };
