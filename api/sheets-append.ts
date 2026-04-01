import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from 'googleapis'

/** Default spreadsheet when GOOGLE_SHEET_ID is omitted (booking-chat-ui sheet). */
const DEFAULT_GOOGLE_SHEET_ID =
  '1RdhcugBDt42oOzrGdqXwV5X29Wf40lm7eTofQ0JBAsw'

type BookingPayload = {
  id: string
  createdAt: string
  guests: number
  service: string
  dateIso: string
  time: string
  name: string
  email: string
  phone: string
}

function isBookingPayload(x: unknown): x is BookingPayload {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.createdAt === 'string' &&
    typeof o.guests === 'number' &&
    typeof o.service === 'string' &&
    typeof o.dateIso === 'string' &&
    typeof o.time === 'string' &&
    typeof o.name === 'string' &&
    typeof o.email === 'string' &&
    typeof o.phone === 'string'
  )
}

function formatDateForSheet(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

async function appendViaAppsScript(
  body: BookingPayload,
  res: VercelResponse,
): Promise<void> {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL!.trim()
  const scriptSecret = process.env.GOOGLE_APPS_SCRIPT_SECRET
  const payload: Record<string, unknown> = { ...body }
  if (scriptSecret) payload._scriptSecret = scriptSecret

  let r: Response
  try {
    r = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.error('[sheets-append] apps script fetch', e)
    res.status(502).json({ error: 'Could not reach Google Apps Script' })
    return
  }

  const text = await r.text()
  if (!r.ok) {
    console.error('[sheets-append] apps script', r.status, text.slice(0, 500))
    res.status(502).json({ error: 'Apps Script returned an error', status: r.status })
    return
  }

  try {
    const j = JSON.parse(text) as { ok?: boolean; error?: string }
    if (j.ok === false) {
      res.status(502).json({ error: j.error ?? 'Apps Script rejected payload' })
      return
    }
  } catch {
    /* non-JSON success body — treat as ok if 200 */
    if (!r.ok) {
      res.status(502).json({ error: 'Unexpected Apps Script response' })
      return
    }
  }

  res.status(200).json({ ok: true })
}

async function appendViaServiceAccount(
  body: BookingPayload,
  res: VercelResponse,
): Promise<void> {
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  const sheetId =
    process.env.GOOGLE_SHEET_ID?.trim() || DEFAULT_GOOGLE_SHEET_ID
  const range = process.env.GOOGLE_SHEET_RANGE ?? 'Sheet1!A:I'

  if (!rawJson) {
    res.status(503).json({
      error: 'Sheets not configured',
      hint:
        'Easiest: set GOOGLE_APPS_SCRIPT_URL (see scripts/google-apps-script/booking-append.gs). Or set GOOGLE_SERVICE_ACCOUNT_JSON for API access.',
    })
    return
  }

  let credentials: Record<string, unknown>
  try {
    credentials = JSON.parse(rawJson) as Record<string, unknown>
  } catch {
    res.status(500).json({ error: 'Invalid GOOGLE_SERVICE_ACCOUNT_JSON' })
    return
  }

  if (typeof credentials.private_key === 'string') {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n')
  }

  const row: string[] = [
    body.createdAt,
    String(body.guests),
    body.service,
    formatDateForSheet(body.dateIso),
    body.time,
    body.name,
    body.email,
    body.phone,
    body.id,
  ]

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    })
    res.status(200).json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Sheets append failed'
    console.error('[sheets-append]', e)
    res.status(502).json({ error: message })
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
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

  const body: unknown =
    typeof req.body === 'string' ? JSON.parse(req.body) : req.body

  if (!isBookingPayload(body)) {
    return res.status(400).json({ error: 'Invalid booking payload' })
  }

  const appsUrl = process.env.GOOGLE_APPS_SCRIPT_URL?.trim()
  if (appsUrl) {
    await appendViaAppsScript(body, res)
    return
  }

  await appendViaServiceAccount(body, res)
}
