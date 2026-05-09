/** Same-origin manage URL for routing / copy-link */
export function reservationManagePath(manageToken: string): string {
  return `/reservation/${encodeURIComponent(manageToken)}`
}

/** Absolute URL for emails / CRM / webhooks (needs VITE_PUBLIC_APP_ORIGIN on server builds). */
export function reservationManageAbsoluteUrl(manageToken: string): string {
  const configured = import.meta.env.VITE_PUBLIC_APP_ORIGIN?.trim().replace(/\/$/, '')
  if (configured) {
    return `${configured}${reservationManagePath(manageToken)}`
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${reservationManagePath(manageToken)}`
  }
  return reservationManagePath(manageToken)
}
