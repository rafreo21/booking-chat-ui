/**
 * AUTO SHEET APPEND (no Google Cloud service account)
 *
 * 1) Open your booking spreadsheet → Extensions → Apps Script.
 * 2) Paste this entire file, Save.
 * 3) Run once: select "authorizeScript" in the toolbar → Run → allow permissions.
 * 4) Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5) Copy the Web app URL (ends in /exec).
 * 6) In Vercel → Environment Variables:
 *      GOOGLE_APPS_SCRIPT_URL = that URL
 *    Optional (recommended): add Script property BOOKING_SECRET and same value as
 *      GOOGLE_APPS_SCRIPT_SECRET on Vercel.
 *
 * Script properties: Project Settings (gear) → Script properties → Add row
 *   Property: BOOKING_SECRET   Value: <long random string>
 */

function doPost(e) {
  var props = PropertiesService.getScriptProperties()
  var expected = props.getProperty('BOOKING_SECRET')
  var data
  try {
    data = JSON.parse(e.postData.contents)
  } catch (err) {
    return jsonResponse({ ok: false, error: 'invalid_json' })
  }

  if (expected && data._scriptSecret !== expected) {
    return jsonResponse({ ok: false, error: 'unauthorized' })
  }

  delete data._scriptSecret

  var required = ['id', 'createdAt', 'guests', 'service', 'dateIso', 'time', 'name', 'email', 'phone']
  for (var i = 0; i < required.length; i++) {
    if (data[required[i]] === undefined || data[required[i]] === null) {
      return jsonResponse({ ok: false, error: 'missing_' + required[i] })
    }
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName('Sheet1')
  if (!sheet) sheet = ss.getSheets()[0]

  sheet.appendRow([
    data.createdAt,
    String(data.guests),
    data.service,
    formatDateForRow_(data.dateIso),
    data.time,
    data.name,
    data.email,
    data.phone,
    data.id,
  ])

  return jsonResponse({ ok: true })
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}

function formatDateForRow_(iso) {
  if (!iso) return ''
  var d = new Date(iso)
  if (isNaN(d.getTime())) return String(iso)
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Run this once from the editor so Google asks for spreadsheet access. */
function authorizeScript() {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1')
}
