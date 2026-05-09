import type { VercelRequest, VercelResponse } from '@vercel/node'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

function isPayload(x: unknown): x is {
  event?: string
  reservationId: string
  manageToken: string
  manageUrl: string
  customization: unknown
} {
  if (!isRecord(x)) return false
  return (
    typeof x.reservationId === 'string' &&
    typeof x.manageToken === 'string' &&
    typeof x.manageUrl === 'string' &&
    'customization' in x
  )
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.BOOKING_INGEST_SECRET
  if (secret) {
    const authz = req.headers.authorization
    const token = authz?.startsWith('Bearer ') ? authz.slice(7) : ''
    if (token !== secret) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const raw: unknown = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  if (!isPayload(raw)) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  const forwardUrl = process.env.OPS_WEBHOOK_URL?.trim()
  if (forwardUrl) {
    try {
      const fr = await fetch(forwardUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(raw),
      })
      if (!fr.ok) {
        const t = await fr.text()
        console.warn('[dining-customization] forward failed', fr.status, t.slice(0, 400))
      }
    } catch (e) {
      console.warn('[dining-customization] forward error', e)
    }
  }

  return res.status(200).json({ ok: true })
}
