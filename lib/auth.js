import { createHmac, timingSafeEqual } from 'node:crypto'

function secret() { return process.env.TOKEN_SECRET || '' }
function signature(payload) { return createHmac('sha256', secret()).update(payload).digest('base64url') }
export function createToken() { const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + 28800000 })).toString('base64url'); return `${payload}.${signature(payload)}` }
export function authorized(request) {
  const token = request.headers.authorization?.replace('Bearer ', ''); const [payload, signed] = token.split('.')
  if (!payload || !signed || !secret()) return false
  const expected = signature(payload); if (signed.length !== expected.length || !timingSafeEqual(Buffer.from(signed), Buffer.from(expected))) return false
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now() } catch { return false }
}
