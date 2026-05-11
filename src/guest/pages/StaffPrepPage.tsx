import { Link, useSearchParams } from 'react-router-dom'
import { Loader2Icon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { CustomizationSummary } from '@/components/customization/CustomizationSummary'
import { loadCustomization, resolveReservationPublicRef } from '@/storage'
import type { SavedBooking } from '@/storage'
import type { DiningCustomization } from '@/types/bookingCustomization'
import { occasionSummaryFromMeta } from '@/lib/bookingOccasion'
import { useEffect, useState } from 'react'

export function StaffPrepPage() {
  const [params] = useSearchParams()
  const ref = params.get('ref')?.trim() ?? ''
  const key = params.get('key')?.trim() ?? ''
  const secret = import.meta.env.VITE_STAFF_PREP_SECRET?.trim()

  const denied = Boolean(secret && key !== secret)
  const missingRef = !ref

  type Loaded = {
    booking: SavedBooking
    customization: DiningCustomization | null
  }

  const shouldFetch = !denied && !missingRef
  const [payload, setPayload] = useState<Loaded | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(shouldFetch)

  useEffect(() => {
    if (!shouldFetch) return
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setLoading(true)
      setPayload(null)
      setNotFound(false)
    })

    void (async () => {
      const b = await resolveReservationPublicRef(ref)
      if (cancelled) return
      if (!b) {
        setNotFound(true)
        setPayload(null)
        setLoading(false)
        return
      }
      const c = await loadCustomization(b.id)
      if (cancelled) return
      setPayload({ booking: b, customization: c })
      setNotFound(false)
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [ref, shouldFetch])

  if (denied) {
    return (
      <div className="min-h-dvh bg-muted/40 px-4 py-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle className="text-xl tracking-tight">Staff prep</CardTitle>
            <CardDescription className="text-[15px] leading-relaxed">
              Add the correct <code className="rounded-md bg-muted px-1.5 py-0.5 text-sm">key</code> query parameter matching{' '}
              <code className="rounded-md bg-muted px-1.5 py-0.5 text-sm">VITE_STAFF_PREP_SECRET</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link to="/">Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (missingRef) {
    return (
      <div className="min-h-dvh bg-muted/40 px-4 py-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle className="text-xl tracking-tight">Staff prep</CardTitle>
            <CardDescription className="text-[15px] leading-relaxed">
              Pass <code className="rounded-md bg-muted px-1.5 py-0.5 text-sm">ref</code> with the guest&apos;s reservation manage token
              (or legacy internal id).
            </CardDescription>
            <p className="pt-2 font-mono text-[13px] text-muted-foreground">Example: /staff/prep?ref=YOUR_TOKEN</p>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link to="/">Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-muted/40 px-4">
        <Loader2Icon className="size-10 animate-spin text-primary" aria-hidden />
        <Skeleton className="h-4 w-48" />
        <p className="text-[15px] font-medium text-muted-foreground">Loading prep sheet…</p>
      </div>
    )
  }

  if (notFound || !payload) {
    return (
      <div className="min-h-dvh bg-muted/40 px-4 py-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle className="text-xl tracking-tight">Reservation not found</CardTitle>
            <CardDescription className="text-[15px]">
              No booking matches this ref. Check the token or try the internal id for legacy rows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link to="/">Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { booking, customization } = payload

  const prepNotes =
    typeof booking.meta?.kitchenPrepNotes === 'string' ? booking.meta.kitchenPrepNotes.trim() : ''

  const occasionSummary = occasionSummaryFromMeta(booking.meta)

  return (
    <div className="min-h-dvh bg-muted/40 px-4 py-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Card>
          <CardHeader className="gap-1">
            <Badge variant="outline" className="w-fit text-[11px] uppercase tracking-wide">
              Kitchen / floor
            </Badge>
            <CardTitle className="text-xl tracking-tight">{booking.name}</CardTitle>
            <CardDescription className="text-[15px]">
              {booking.guests} guest{booking.guests === 1 ? '' : 's'} · {booking.time || '—'}
            </CardDescription>
            <p className="font-mono text-[12px] text-muted-foreground">
              Token{' '}
              <span className="font-semibold text-foreground">{booking.manageToken.slice(0, 14)}…</span>
            </p>
            {occasionSummary ? (
              <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 dark:border-sky-900/50 dark:bg-sky-950/40">
                <p className="text-[11px] font-bold uppercase tracking-wide text-sky-900 dark:text-sky-200">
                  Occasion
                </p>
                <p className="mt-1 whitespace-pre-wrap text-[14px] text-sky-950 dark:text-sky-50">
                  {occasionSummary}
                </p>
              </div>
            ) : null}
            {prepNotes ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-950/30">
                <p className="text-[11px] font-bold uppercase tracking-wide text-amber-900 dark:text-amber-200">
                  Kitchen notes (meta)
                </p>
                <p className="mt-1 whitespace-pre-wrap text-[14px] text-amber-950 dark:text-amber-50">{prepNotes}</p>
              </div>
            ) : null}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-tight">Guest dining customization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {customization?.notes ? (
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Guest notes</p>
                <p className="mt-1 whitespace-pre-wrap text-[14px] text-foreground">{customization.notes}</p>
              </div>
            ) : (
              <p className="text-[14px] text-muted-foreground">No dining customization saved yet.</p>
            )}
            {customization?.seats?.length ? (
              <>
                <Separator />
                <CustomizationSummary seats={customization.seats} />
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary text-primary-foreground shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wide text-primary-foreground/80">
              Raw JSON
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <pre className="max-h-[40vh] overflow-auto rounded-md bg-black/20 p-3 text-[11px] leading-relaxed text-primary-foreground/95">
              {JSON.stringify({ booking, customization }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Button variant="ghost" className="w-full" asChild>
          <Link to="/">← Home</Link>
        </Button>
      </div>
    </div>
  )
}
