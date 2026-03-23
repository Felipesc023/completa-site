import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Só aceita GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return res.status(200).json({
    ok: true,
    service: 'Completa API',
    timestamp: new Date().toISOString(),
    env: {
      // Nunca exponha secrets — apenas confirma se estão definidos
      pagbank: !!process.env.PAGBANK_TOKEN,
      firebase_admin: !!process.env.FIREBASE_ADMIN_KEY,
    },
  })
}
