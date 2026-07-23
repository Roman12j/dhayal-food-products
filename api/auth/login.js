import { createToken } from '../../lib/auth.js'

export default function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ message: 'Method not allowed.' })
  if (!process.env.ADMIN_PASSWORD || request.body?.password !== process.env.ADMIN_PASSWORD) return response.status(401).json({ message: 'Invalid admin password.' })
  return response.status(200).json({ token: createToken() })
}
