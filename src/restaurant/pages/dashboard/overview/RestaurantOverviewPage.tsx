import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpIcon } from 'lucide-react'
import { AiChatbotLogo } from '@/components/AiChatbotLogo'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldContent } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  DEFAULT_LOCAL_GUEST_ORIGIN,
  DEFAULT_LOCAL_RESTAURANT_ORIGIN,
  currentOriginHref,
  devGuestShellOrigin,
  devRestaurantShellOrigin,
  guestBookingHomeHref,
  isSplitDevShell,
} from '@/lib/appShell'
import {
  deriveComparisonDate,
  isSameDay,
  reportingRangeFromPreset,
  startOfDay,
  type PerformanceFiltersState,
} from '@/restaurant/pages/dashboard/overview/performanceFilterModel'
import { PerformanceOverviewFilters } from '@/restaurant/pages/dashboard/overview/performanceOverviewFilters'

const chartHours = ['8 am', '9 am', '10 am', '11 am', '12 pm', '1 pm', '2 pm']

function MetricCell({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <Card size="sm" className="h-full min-w-0 gap-0 bg-background py-4 shadow-sm ring-border">
      <CardContent className="flex h-full flex-col justify-between space-y-2 px-4 py-0">
        <CardDescription className="text-[13px] font-medium leading-snug text-muted-foreground">
          {label}
        </CardDescription>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-[17px] font-semibold tracking-tight tabular-nums text-foreground">
            {value}
          </span>
          <Badge variant="secondary" className="h-5 shrink-0 rounded-full px-2 text-[10px] font-semibold uppercase text-muted-foreground">
            N/A
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

/** Dashboard home — performance snapshot (demo placeholders) and links into guest-facing flows. */
export function RestaurantOverviewPage() {
  const guestHome = guestBookingHomeHref()
  const guestOrigin = devGuestShellOrigin()
  const restaurantOrigin = devRestaurantShellOrigin()
  const origin = currentOriginHref()

  const [performanceFilters, setPerformanceFilters] = useState<PerformanceFiltersState>(() => {
    const { from, to } = reportingRangeFromPreset('today')
    return {
      datePreset: 'today',
      rangeFrom: from,
      rangeTo: to,
      comparisonId: 'prior-day',
      billsFilter: 'closed',
    }
  })

  const comparisonDate = deriveComparisonDate(
    performanceFilters.rangeTo,
    performanceFilters.comparisonId,
  )
  const todayStart = startOfDay(new Date())
  const longFmt = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const shortFmt = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  })
  const primaryLegendLabel = isSameDay(performanceFilters.rangeFrom, performanceFilters.rangeTo)
    ? isSameDay(performanceFilters.rangeFrom, todayStart)
      ? 'Today'
      : longFmt.format(performanceFilters.rangeFrom)
    : `${shortFmt.format(performanceFilters.rangeFrom)} – ${shortFmt.format(performanceFilters.rangeTo)}`

  const comparisonLegendLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(comparisonDate)

  return (
    <div className="space-y-5">
      <Field className="gap-1.5">
        <Label htmlFor="overview-assistant-query" className="sr-only">
          Venue assistant — ask a question or run a quick action
        </Label>
        <FieldContent className="w-full">
          <div className="relative">
            {/* Same mark as guest booking chat header (`BookingChatView`). */}
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2">
              <AiChatbotLogo sizePx={28} />
            </span>
            <Input
              id="overview-assistant-query"
              readOnly
              aria-readonly
              placeholder="Ask a question or run a quick action…"
              className="relative z-0 h-12 rounded-xl border-border bg-background pl-12 pr-12 text-[15px] shadow-none placeholder:text-muted-foreground"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-1.5 top-1/2 size-9 -translate-y-1/2 rounded-lg text-muted-foreground"
              aria-label="Send to assistant"
            >
              <ArrowUpIcon className="size-[18px]" aria-hidden />
            </Button>
          </div>
        </FieldContent>
      </Field>

      <Card className="shadow-sm ring-1 ring-border">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <CardTitle className="shrink-0 text-lg font-semibold tracking-tight">Performance</CardTitle>
            <PerformanceOverviewFilters
              filters={performanceFilters}
              onFiltersChange={setPerformanceFilters}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pb-6">
          <div className="space-y-1">
            <Label className="text-[13px] font-medium text-muted-foreground">Net sales</Label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[34px] font-semibold tracking-tight text-foreground">£0.00</span>
              <Badge variant="secondary" className="h-6 rounded-full px-2.5 text-[11px] font-semibold uppercase text-muted-foreground">
                N/A
              </Badge>
            </div>
          </div>

          <Card className="gap-0 overflow-hidden rounded-2xl bg-muted/25 py-0 shadow-none ring-border">
            <CardContent className="space-y-6 px-4 pb-3 pt-4">
              <div className="flex flex-wrap items-center gap-4 text-[12px] font-medium">
                <span className="inline-flex items-center gap-2 text-foreground">
                  <span className="size-2.5 rounded-full bg-[hsl(222_47%_28%)]" aria-hidden />
                  {primaryLegendLabel}
                </span>
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <span className="size-2.5 rounded-full bg-[hsl(214_70%_70%)]" aria-hidden />
                  {comparisonLegendLabel}
                </span>
              </div>
              <div className="relative flex min-h-[180px] flex-col justify-center">
                <CardDescription className="text-center text-[13px] font-medium">
                  No data available for timeframe selected.
                </CardDescription>
              </div>
              <Separator className="bg-border/60" />
              <div className="flex justify-between gap-1 font-mono text-[11px] text-muted-foreground">
                {chartHours.map((h) => (
                  <span key={h} className="flex-1 text-center">
                    {h}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCell label="Gross sales" value="£0.00" />
            <MetricCell label="Transactions" value="0" />
            <MetricCell label="Labour % of net sales" value="0.00%" />
            <MetricCell label="Average sale" value="£0.00" />
            <MetricCell label="Comps & discounts" value="£0.00" />
            <MetricCell label="Tips" value="£0.00" />
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardDescription className="text-[13px]">
              Open the guest site to test bookings and flows.
            </CardDescription>
            <Button asChild variant="secondary" className="w-full shrink-0 sm:w-auto">
              <a href={guestHome}>Open guest booking</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {import.meta.env.DEV ? (
        <Card className="border border-dashed border-border bg-muted/30 py-2 shadow-none ring-0">
          <CardContent className="px-2 py-0">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="dev-urls" className="border-border px-1">
              <AccordionTrigger className="py-3 text-[13px] font-semibold text-foreground hover:no-underline">
                Local dev URLs
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-[13px] leading-relaxed text-muted-foreground">
                {isSplitDevShell() ? (
                  <>
                    <p className="text-[12px] leading-snug">
                      Split shells (
                      <code className="rounded bg-background px-1 py-0.5 ring-1 ring-border">
                        VITE_SPLIT_DEV_SHELLS=true
                      </code>
                      ) — two Vite processes.
                    </p>
                    <p className="mt-2 space-y-1.5 font-mono text-[12px] text-foreground">
                      <span className="block">
                        <span className="text-muted-foreground">Guest </span>
                        <a className="underline-offset-2 hover:underline" href={`${guestOrigin}/`}>
                          {guestOrigin || DEFAULT_LOCAL_GUEST_ORIGIN}/
                        </a>
                      </span>
                      <span className="block">
                        <span className="text-muted-foreground">Restaurant </span>
                        <a
                          className="underline-offset-2 hover:underline"
                          href={`${restaurantOrigin}/restaurant/dashboard`}
                        >
                          {restaurantOrigin || DEFAULT_LOCAL_RESTAURANT_ORIGIN}/restaurant/dashboard
                        </a>
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[12px] leading-snug">
                      One server (
                      <code className="rounded bg-background px-1 py-0.5 ring-1 ring-border">npm run dev</code>
                      ). Restaurant lives under{' '}
                      <span className="font-mono text-foreground">/restaurant/*</span>, not a second port.
                    </p>
                    <ul className="mt-2 list-none space-y-1 font-mono text-[12px] text-foreground">
                      <li>
                        <span className="text-muted-foreground">Guest </span>
                        <Link className="underline-offset-2 hover:underline" to="/">
                          {origin || 'http://localhost:5173'}/
                        </Link>
                      </li>
                      <li>
                        <span className="text-muted-foreground">Restaurant login </span>
                        <Link className="underline-offset-2 hover:underline" to="/restaurant/login">
                          {origin || '…'}/restaurant/login
                        </Link>
                      </li>
                    </ul>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="dining-paths" className="border-border px-1">
              <AccordionTrigger className="py-3 text-[13px] font-semibold text-foreground hover:no-underline">
                Dining customization paths
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-[13px] leading-relaxed text-muted-foreground">
                <p>
                  Finish a booking on{' '}
                  <a href={guestHome} className="font-medium text-primary underline-offset-4 hover:underline">
                    guest home
                  </a>
                  , copy the <span className="text-foreground">manage token</span>, then open:
                </p>
                <code className="mt-2 block break-all rounded-md bg-background px-2 py-1.5 text-[12px] text-foreground ring-1 ring-border">
                  /reservation/&lt;manageToken&gt;/customize
                </code>
                <p className="mt-2">
                  Preview (no editor):{' '}
                  <code className="rounded bg-background px-1 py-0.5 text-[12px] ring-1 ring-border">
                    /reservation/&lt;manageToken&gt;
                  </code>
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
