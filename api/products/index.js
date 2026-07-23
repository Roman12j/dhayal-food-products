import { randomUUID } from 'node:crypto'
import { authorized } from '../../lib/auth.js'
import { database, ensureProductsTable } from '../../lib/database.js'

export default async function handler(request, response) {
  try {
    const sql = database(); await ensureProductsTable(sql)
    if (request.method === 'GET') return response.status(200).json(await sql`SELECT id, name, category, sizes, price::float AS price, image, note FROM products ORDER BY name`)
    if (request.method !== 'POST') return response.status(405).json({ message: 'Method not allowed.' })
    if (!authorized(request)) return response.status(401).json({ message: 'Admin authorization required.' })
    const { name, category = 'Other', sizes = '', price, image = '/assets/desi-ghee.png', note = '' } = request.body || {}
    if (!name || !Number.isFinite(Number(price))) return response.status(400).json({ message: 'Product name and price are required.' })
    const product = { id: randomUUID(), name, category, sizes, price: Number(price), image, note }
    await sql`INSERT INTO products (id, name, category, sizes, price, image, note) VALUES (${product.id}, ${product.name}, ${product.category}, ${product.sizes}, ${product.price}, ${product.image}, ${product.note})`
    return response.status(201).json(product)
  } catch (error) { return response.status(500).json({ message: error.message || 'Internal server error.' }) }
}
