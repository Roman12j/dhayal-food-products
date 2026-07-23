import { neon } from '@neondatabase/serverless'

const defaultProducts = [
  ['desi-ghee', 'Desi Ghee', 'Ghee', '500g / 1kg / 5kg', 450, '/assets/desi-ghee.png', 'Traditional richness in every spoon.'],
  ['cow-ghee', 'Cow Ghee', 'Ghee', '500g / 1kg / 5kg', 500, '/assets/cow-ghee.png', 'Golden, aromatic and wholesome.'],
  ['buffalo-ghee', 'Buffalo Ghee', 'Ghee', '500g / 1kg / 5kg', 430, '/assets/buffalo-ghee.png', 'Creamy flavour for everyday cooking.'],
  ['fresh-mawa', 'Fresh Mawa', 'Fresh dairy', '250g / 500g / 1kg', 280, '/assets/fresh-mawa.png', 'Made fresh for your celebrations.'],
  ['rasgulla', 'Rasgulla', 'Sweets', '250g / 500g / 1kg', 160, '/assets/rasgulla.png', 'Soft, juicy and delightfully sweet.'],
  ['gulab-jamun', 'Gulab Jamun', 'Sweets', '250g / 500g / 1kg', 160, '/assets/gulab-jamun.png', 'A classic made with care.'],
]

export function database() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.')
  return neon(process.env.DATABASE_URL)
}

export async function ensureProductsTable(sql) {
  await sql`CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, sizes TEXT NOT NULL, price NUMERIC NOT NULL, image TEXT NOT NULL, note TEXT NOT NULL)`
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM products`
  if (count === 0) await Promise.all(defaultProducts.map(([id, name, category, sizes, price, image, note]) => sql`INSERT INTO products (id, name, category, sizes, price, image, note) VALUES (${id}, ${name}, ${category}, ${sizes}, ${price}, ${image}, ${note})`))
}
