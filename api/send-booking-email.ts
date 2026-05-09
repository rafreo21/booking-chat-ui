import type { VercelRequest, VercelResponse } from '@vercel/node'

type EmailBody = {
  guestEmail: string
  guestName: string
  manageUrl: string
  guests?: number
  dateIso?: string
  time?: string
}

function isEmailBody(x: unknown): x is EmailBody {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return (
    typeof o.guestEmail === 'string' &&
    typeof o.guestName === 'string' &&
    typeof o.manageUrl === 'string'
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/>/g, '&gt;')
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
  if (!isEmailBody(raw)) {
    return res.status(400).json({ error: 'Invalid body' })
  }

  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    return res.status(503).json({
      ok: false,
      error: 'Email not configured',
      hint: 'Set RESEND_API_KEY and RESEND_FROM on Vercel.',
    })
  }

  const from =
    process.env.RESEND_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Booking <onboarding@resend.dev>'

  let href = raw.manageUrl
  try {
    const u = new URL(raw.manageUrl)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') href = '#'
  } catch {
    href = '#'
  }

  const when =
    raw.dateIso || raw.time
      ? `<p style="margin:12px 0 0">${escapeHtml(raw.dateIso ?? '')}${raw.time ? ` · ${escapeHtml(raw.time)}` : ''}${typeof raw.guests === 'number' ? ` · ${raw.guests} guests` : ''}</p>`
      : ''

  const html = `
<p>Hi ${escapeHtml(raw.guestName)},</p>
<p>Your table is reserved. You can manage your booking and optionally share dining preferences anytime:</p>
<p><a href="${escapeHtml(href)}">${escapeHtml(raw.manageUrl)}</a></p>
${when}
<p style="margin-top:24px;color:#666;font-size:13px">If you did not request this, you can ignore this message.</p>
`.trim()

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [raw.guestEmail],
        subject: 'Your reservation — manage your booking',
        html,
      }),
    })

    const text = await r.text()
    if (!r.ok) {
      console.error('[send-booking-email] Resend error', r.status, text.slice(0, 500))
      return res.status(502).json({ ok: false, error: 'Resend rejected request' })
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('[send-booking-email]', e)
    return res.status(502).json({ ok: false, error: 'Could not reach Resend' })
  }
}
