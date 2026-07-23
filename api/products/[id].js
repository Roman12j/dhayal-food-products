import { authorized } from '../../lib/auth.js'
import { database, ensureProductsTable } from '../../lib/database.js'

export default async function handler(request, response) {
  if (request.method !== 'PUT') return response.status(405).json({ message: 'Method not allowed.' })
  if (!authorized(request)) return response.status(401).json({ message: 'Admin authorization required.' })
  if (!Number.isFinite(Number(request.body?.price))) return response.status(400).json({ message: 'A valid price is required.' })
  try {
    const sql = database(); await ensureProductsTable(sql)
    const rows = await sql`UPDATE products SET price = ${Number(request.body.price)} WHERE id = ${request.query.id} RETURNING id, name, category, sizes, price::float AS price, image, note`
    return rows[0] ? response.status(200).json(rows[0]) : response.status(404).json({ message: 'Product not found.' })
  } catch (error) { return response.status(500).json({ message: error.message || 'Internal server error.' }) }
}
