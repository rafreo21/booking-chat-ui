/** Same-origin landing URL from emails — reservation preview (pay / edit). */
export function reservationManagePath(manageToken: string): string {
  return `/reservation/${encodeURIComponent(manageToken)}`
}

/** Full dining customization editor. */
export function reservationCustomizePath(manageToken: string): string {
  return `/reservation/${encodeURIComponent(manageToken)}/customize`
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
