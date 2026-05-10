import { PencilSimple } from '@phosphor-icons/react'
import { Loader2Icon, ArrowLeftIcon } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  addBooking,
  clearBookings,
  deleteBooking,
  exportBookingsJson,
  hydrateFromPublicFile,
  importBookingsFromJson,
  loadBookings,
  type SavedBooking,
} from './storage'
import { reservationManageAbsoluteUrl, reservationManagePath } from './lib/reservationUrls'
import { sendBookingConfirmationEmail } from './lib/sendBookingEmail'
import { useMenuCatalog } from './menu/useMenuCatalog'
import { syncBookingToSheets } from './syncBookingToSheets'
import { AiChatbotLogo } from './components/AiChatbotLogo'
import { GetDirectionsFab } from './components/GetDirectionsFab'
import { BookingsLog } from './components/BookingsLog'
import { NotionStyleDatePicker } from './components/NotionStyleDatePicker'
import { VenueHeaderRating } from './components/VenueHeaderRating'
import { BookingConfirmationCta } from './components/customization/BookingConfirmationCta'
import {
  PILL_CHOICE_BUTTON_CLASS,
  PILL_TABS_LIST_CLASS,
} from './components/customization/pillTabStyles'
import {
  WIDGET_CHAT_CARD_FRAME_CLASS,
  WIDGET_CHAT_HEADER_PAD_CLASS,
  WIDGET_CHAT_PAGE_SHELL_CLASS,
  WIDGET_CHAT_STACK_COLUMN_CLASS,
} from './widgetLayout'

type Role = 'assistant' | 'user'

/** User answers that can be revised via the chat edit control. */
type BookingSection = 'guests' | 'date' | 'time' | 'details'

type ChatMessage = {
  id: string
  role: Role
  text: string
  /** Set on user bubbles that correspond to a booking step. */
  section?: BookingSection
}

/** Every 15 minutes from 14:00 through 22:00 (2pm–10pm). */
function buildSlots14Through22(): string[] {
  const out: string[] = []
  for (let mins = 14 * 60; mins <= 22 * 60; mins += 15) {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
  return out
}

/** Deterministic PRNG for stable “random” 20 picks across reloads. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickRandomSubset<T>(arr: readonly T[], count: number, seed: number): T[] {
  const rng = mulberry32(seed)
  const idx = arr.map((_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx.slice(0, count).map((i) => arr[i])
}

const TIME_SLOTS_24 = pickRandomSubset(buildSlots14Through22(), 20, 0x9e3779b9).sort(
  (a, b) => a.localeCompare(b),
)

function formatTimeSlot12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(2000, 0, 1, h, m)
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const GUEST_CHIPS = ['1', '2', '3', '4', '5'] as const

/** Max guests when typing a number (quick chips are 1–5; 6+ uses Enter Number). */
const MAX_GUESTS_TYPED = 100_000

const RESTAURANT_SERVICE = 'Restaurant'

/** How many days appear as quick-pick chips — one full week (7-day window from today). */
const QUICK_PICK_DAYS = 7

/** Inclusive range: today through today + (QUICK_PICK_DAYS − 1); weekends included. */
function quickPickDatesInWeekWindow(): Date[] {
  const out: Date[] = []
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  for (let i = 0; i < QUICK_PICK_DAYS; i++) {
    out.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}

function formatDay(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatDayFromIso(dateIso: string): string {
  if (!dateIso) return '—'
  try {
    const d = new Date(dateIso)
    return formatDay(d)
  } catch {
    return '—'
  }
}

/** Same rules as validateDetails, without mutating error state. */
function detailsFormIsComplete(d: { name: string; email: string; phone: string }): boolean {
  const name = d.name.trim()
  const email = d.email.trim()
  const phone = d.phone.replace(/\s/g, '')
  const digits = phone.replace(/\D/g, '')
  if (name.length < 2) return false
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false
  if (digits.length < 8) return false
  return true
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

type Step =
  | 'guests'
  | 'date'
  | 'time'
  | 'details'
  | 'confirm'
  | 'submitting'
  | 'success'

/** Snapshot of booking fields used to resume the thread after a step is re-answered. */
type BookingSnapshot = {
  guestCount: number
  date: Date | null
  time: string
}

type DetailsSnapshot = { name: string; email: string; phone: string }

type ResumeChatActions = {
  pushUser: (text: string, section?: BookingSection) => void
  pushAssistant: (text: string) => void
  setStep: (s: Step) => void
}

const ASSISTANT_DETAILS_PROMPT =
  'Almost there. Enter your **full name**, **email**, and **phone number** below, then continue.'

/** After time is chosen (or restored), jump to details or confirm from saved contact fields. */
function resumeAfterTimeChosen(
  details: DetailsSnapshot,
  { pushUser, pushAssistant, setStep }: ResumeChatActions,
) {
  // Always show this prompt when leaving the time step so the thread stays consistent
  // (including when contact fields are already valid and we skip ahead to confirm).
  pushAssistant(ASSISTANT_DETAILS_PROMPT)
  if (detailsFormIsComplete(details)) {
    pushUser(
      `${details.name.trim()} · ${details.email.trim()} · ${details.phone.trim()}`,
      'details',
    )
    pushAssistant('Review your booking below, then tap **Confirm booking**.')
    setStep('confirm')
  } else {
    setStep('details')
  }
}

/**
 * After date is set, either ask for time or replay saved time + downstream messages.
 * Caller must already have pushed the user date line when entering this from pickDate.
 */
function resumeAfterDateSet(
  b: BookingSnapshot,
  details: DetailsSnapshot,
  actions: ResumeChatActions,
) {
  if (!b.time.trim()) {
    actions.pushAssistant('Here are the available times. Pick one that suits you.')
    actions.setStep('time')
    return
  }
  actions.pushAssistant('Here are the available times. Pick one that suits you.')
  actions.pushUser(b.time, 'time')
  resumeAfterTimeChosen(details, actions)
}

/**
 * After guest count is set, continue at the first step that still needs input,
 * re-inserting user bubbles for any values we kept in state (uniform with date/time edits).
 */
function resumeAfterGuestCountSet(
  b: BookingSnapshot,
  details: DetailsSnapshot,
  actions: ResumeChatActions,
) {
  if (!b.date) {
    actions.pushAssistant('Which **date** would you like to book?')
    actions.setStep('date')
    return
  }
  actions.pushAssistant('Which **date** would you like to book?')
  actions.pushUser(formatDay(b.date), 'date')
  resumeAfterDateSet(b, details, actions)
}

function canShowEditForSection(section: BookingSection, step: Step): boolean {
  if (step === 'submitting') return false
  switch (section) {
    case 'guests':
      return step !== 'guests'
    case 'date':
      return (
        step === 'time' ||
        step === 'details' ||
        step === 'confirm' ||
        step === 'success'
      )
    case 'time':
      return step === 'details' || step === 'confirm' || step === 'success'
    case 'details':
      return step === 'confirm' || step === 'success'
    default:
      return false
  }
}

function editSectionAriaLabel(section: BookingSection): string {
  switch (section) {
    case 'guests':
      return 'Edit number of guests'
    case 'date':
      return 'Edit booking date'
    case 'time':
      return 'Edit booking time'
    case 'details':
      return 'Edit contact details'
    default:
      return 'Edit'
  }
}

type Props = {
  onBack: () => void
}

export function BookingChatView({ onBack }: Props) {
  const navigate = useNavigate()
  const { availabilityVersion } = useMenuCatalog()
  const titleId = useId()
  const listRef = useRef<HTMLDivElement>(null)

  const [step, setStep] = useState<Step>('guests')
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: uid(),
      role: 'assistant',
      text: 'How many guests are we expecting?',
    },
  ])

  const [booking, setBooking] = useState({
    guestCount: 0,
    date: null as Date | null,
    time: '',
  })

  /** Typing guest count via footer after "Enter Number" (chips hidden; no extra chat lines). */
  const [guestsInputMode, setGuestsInputMode] = useState(false)
  const [guestInputDraft, setGuestInputDraft] = useState('')
  const [guestInputError, setGuestInputError] = useState<string | null>(null)
  const guestInputRef = useRef<HTMLInputElement>(null)

  /** Full calendar in footer when user taps “Pick Date”; otherwise show the date option chips. */
  const [datesCustomMode, setDatesCustomMode] = useState(false)

  const [details, setDetails] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [detailErrors, setDetailErrors] = useState<{
    name?: string
    email?: string
    phone?: string
  }>({})

  const [savedBookings, setSavedBookings] = useState<SavedBooking[]>([])
  const [logOpen, setLogOpen] = useState(false)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importModeRef = useRef<'merge' | 'replace'>('merge')
  /** Latest confirmed reservation — drives optional post-booking dining CTA */
  const [lastConfirmedReservation, setLastConfirmedReservation] =
    useState<SavedBooking | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    void (async () => {
      await hydrateFromPublicFile()
      setSavedBookings(await loadBookings())
    })()
  }, [])

  useEffect(() => {
    if (guestsInputMode) guestInputRef.current?.focus()
  }, [guestsInputMode])

  const refreshSaved = useCallback(async () => {
    try {
      setSavedBookings(await loadBookings())
    } catch {
      setSavedBookings([])
    }
  }, [])

  const scrollToBottom = useCallback(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
    const t = window.setTimeout(scrollToBottom, 80)
    const t2 = window.setTimeout(scrollToBottom, 280)
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(t2)
    }
  }, [messages, step, scrollToBottom])

  const pushUser = (text: string, section?: BookingSection) => {
    setMessages((m) => [...m, { id: uid(), role: 'user', text, section }])
  }

  const pushAssistant = (text: string) => {
    setMessages((m) => [...m, { id: uid(), role: 'assistant', text }])
  }

  const guestCountFromLabel = (label: string) => {
    const n = Number(label)
    return Number.isFinite(n) ? n : 0
  }

  const resumeActions: ResumeChatActions = {
    pushUser,
    pushAssistant,
    setStep,
  }

  const pickGuest = (label: string) => {
    if (step !== 'guests') return
    setGuestsInputMode(false)
    setGuestInputDraft('')
    setGuestInputError(null)
    pushUser(`Table for ${label} guest${label === '1' ? '' : 's'}`, 'guests')
    const gc = guestCountFromLabel(label)
    // Never schedule resume inside setBooking's updater — React Strict Mode may run it twice
    // in dev and duplicate assistant lines. One microtask per user action is enough.
    let snapshot: BookingSnapshot | null = null
    setBooking((b) => {
      snapshot = {
        ...b,
        guestCount: gc,
      }
      return snapshot
    })
    queueMicrotask(() => {
      if (snapshot) resumeAfterGuestCountSet(snapshot, details, resumeActions)
    })
  }

  const startGuestNumberInput = () => {
    if (step !== 'guests' || guestsInputMode) return
    setGuestsInputMode(true)
    setGuestInputDraft('')
    setGuestInputError(null)
  }

  const submitGuestNumber = () => {
    if (step !== 'guests' || !guestsInputMode) return
    const raw = guestInputDraft.trim()
    const n = Number.parseInt(raw, 10)
    if (!Number.isFinite(n) || n < 1 || n > MAX_GUESTS_TYPED) {
      setGuestInputError(
        `Enter a whole number from 1 to ${MAX_GUESTS_TYPED.toLocaleString()}.`,
      )
      return
    }
    setGuestInputError(null)
    setGuestsInputMode(false)
    setGuestInputDraft('')
    pushUser(`Table for ${n} guest${n === 1 ? '' : 's'}`, 'guests')
    let snapshot: BookingSnapshot | null = null
    setBooking((b) => {
      snapshot = { ...b, guestCount: n }
      return snapshot
    })
    queueMicrotask(() => {
      if (snapshot) resumeAfterGuestCountSet(snapshot, details, resumeActions)
    })
  }

  const pickDate = (d: Date) => {
    if (step !== 'date') return
    setDatesCustomMode(false)
    pushUser(formatDay(d), 'date')
    let snapshot: BookingSnapshot | null = null
    setBooking((b) => {
      snapshot = { ...b, date: d }
      return snapshot
    })
    queueMicrotask(() => {
      if (snapshot) resumeAfterDateSet(snapshot, details, resumeActions)
    })
  }

  const startCustomDatePicker = () => {
    if (step !== 'date' || datesCustomMode) return
    setDatesCustomMode(true)
  }

  const pickTime = (t: string) => {
    if (step !== 'time') return
    pushUser(t, 'time')
    setBooking((b) => ({ ...b, time: t }))
    resumeAfterTimeChosen(details, resumeActions)
  }

  const validateDetails = (): boolean => {
    const err: typeof detailErrors = {}
    const name = details.name.trim()
    const email = details.email.trim()
    const phone = details.phone.replace(/\s/g, '')

    if (name.length < 2) err.name = 'Enter your full name'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = 'Enter a valid email'
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 8) {
      err.phone = 'Enter a valid phone number'
    }
    setDetailErrors(err)
    return Object.keys(err).length === 0
  }

  const submitDetails = () => {
    if (step !== 'details') return
    if (!validateDetails()) return
    pushUser(
      `${details.name.trim()} · ${details.email.trim()} · ${details.phone.trim()}`,
      'details',
    )
    pushAssistant('Review your booking below, then tap **Confirm booking**.')
    setStep('confirm')
  }

  const confirmBooking = () => {
    if (step !== 'confirm') return
    setStep('submitting')
    window.setTimeout(() => {
      void (async () => {
        try {
          const saved = await addBooking({
            guests: booking.guestCount,
            service: RESTAURANT_SERVICE,
            dateIso: booking.date ? booking.date.toISOString() : '',
            time: booking.time,
            name: details.name.trim(),
            email: details.email.trim(),
            phone: details.phone.trim(),
            meta: { menuAvailabilityVersion: availabilityVersion },
          })
          void syncBookingToSheets(saved)
          void sendBookingConfirmationEmail(saved)
          await refreshSaved()
          setLastConfirmedReservation(saved)
          pushAssistant(
            '**Booking confirmed!** Your table is reserved. We look forward to welcoming you.',
          )
          setStep('success')
        } catch {
          pushAssistant(
            "**We couldn't save your booking.** Check your connection and tap **Confirm booking** again.",
          )
          setStep('confirm')
        }
      })()
    }, 1600)
  }

  const handleEditSection = useCallback((section: BookingSection) => {
    setMessages((msgs) => {
      const idx = msgs.findIndex((m) => m.role === 'user' && m.section === section)
      if (idx === -1) return msgs
      return msgs.slice(0, idx)
    })
    setDetailErrors({})
    if (section === 'guests') {
      setBooking((b) => ({
        ...b,
        guestCount: 0,
      }))
      setGuestsInputMode(false)
      setGuestInputDraft('')
      setGuestInputError(null)
      setDatesCustomMode(false)
      setStep('guests')
    } else if (section === 'date') {
      setDatesCustomMode(false)
      setBooking((b) => ({
        ...b,
        date: null,
      }))
      setStep('date')
    } else if (section === 'time') {
      setBooking((b) => ({ ...b, time: '' }))
      setStep('time')
    } else {
      setStep('details')
    }
  }, [])

  const days = quickPickDatesInWeekWindow()

  const resetChat = () => {
    setLinkCopied(false)
    setLastConfirmedReservation(null)
    setBooking({ guestCount: 0, date: null, time: '' })
    setGuestsInputMode(false)
    setGuestInputDraft('')
    setGuestInputError(null)
    setDatesCustomMode(false)
    setDetails({ name: '', email: '', phone: '' })
    setDetailErrors({})
    setStep('guests')
    setMessages([
      {
        id: uid(),
        role: 'assistant',
        text: 'How many guests are we expecting?',
      },
    ])
  }

  const showFooter = step !== 'submitting'

  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-muted/40">
      <div className={WIDGET_CHAT_PAGE_SHELL_CLASS}>
        <div className={`${WIDGET_CHAT_STACK_COLUMN_CLASS} mx-auto`}>
          <div className="sticky top-[max(0.5rem,env(safe-area-inset-top))] z-50 flex w-full justify-start py-2">
            <Button
              type="button"
              variant="ghost"
              size="default"
              className="-ml-1 h-9 w-fit gap-1.5 rounded-full px-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
              onClick={onBack}
            >
              <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
              Back
            </Button>
          </div>

          <div
            className={cn(
              'flex min-h-0 w-full flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-md ring-1 ring-border',
              WIDGET_CHAT_CARD_FRAME_CLASS,
            )}
            role="region"
            aria-labelledby={titleId}
          >
          <div
            className={cn(
              'shrink-0 border-b border-primary/20 bg-primary text-primary-foreground',
              WIDGET_CHAT_HEADER_PAD_CLASS,
            )}
          >
            <div className="flex flex-col items-start gap-1.5 sm:gap-2">
              <AiChatbotLogo />
              <div className="min-w-0">
                <p
                  id={titleId}
                  className="text-[16px] font-bold leading-tight tracking-tight text-primary-foreground sm:text-[17px]"
                >
                  Hey!
                </p>
                <p className="mt-1 text-[14px] leading-snug text-primary-foreground/90 sm:text-[15px]">
                  I&apos;m here to help you make your reservation.
                </p>
              </div>
              <VenueHeaderRating
                theme="dark"
                className="mt-2 w-full border-t border-primary-foreground/15 pt-2.5 sm:mt-3 sm:pt-3"
              />
            </div>
          </div>

          {step === 'submitting' ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 py-10">
              <Loader2Icon className="size-11 animate-spin text-primary" aria-hidden />
              <p className="text-center text-[16px] font-semibold text-foreground">
                Booking in progress…
              </p>
              <p className="text-center text-[15px] text-muted-foreground">
                Please wait a moment.
              </p>
            </div>
          ) : (
            <>
              <div
                ref={listRef}
                className={
                  'min-h-0 max-h-[min(360px,calc(100dvh-13rem))] touch-pan-y space-y-3 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] bg-muted/50 px-3 py-3 sm:space-y-3 sm:px-4 sm:py-4 ' +
                  (step === 'success'
                    ? 'scroll-pb-[max(7rem,calc(env(safe-area-inset-bottom)+5rem))]'
                    : '')
                }
                role="log"
                aria-relevant="additions"
                aria-live="polite"
              >
                {messages.map((msg) => (
                  <FigmaMessage
                    key={msg.id}
                    role={msg.role}
                    text={msg.text}
                    section={msg.section}
                    showEdit={
                      msg.role === 'user' &&
                      msg.section != null &&
                      canShowEditForSection(msg.section, step)
                    }
                    onEdit={
                      msg.section
                        ? () => {
                            handleEditSection(msg.section!)
                          }
                        : undefined
                    }
                  />
                ))}

                {step === 'guests' && !guestsInputMode && (
                  <div className="w-full min-w-0 overflow-x-auto overflow-y-visible pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className={cn('flex w-max max-w-full flex-nowrap items-center', PILL_TABS_LIST_CLASS)}>
                      {GUEST_CHIPS.map((g) => (
                        <button key={g} type="button" className={PILL_CHOICE_BUTTON_CLASS} onClick={() => pickGuest(g)}>
                          {g}
                        </button>
                      ))}
                      <button type="button" className={PILL_CHOICE_BUTTON_CLASS} onClick={startGuestNumberInput}>
                        Enter Number
                      </button>
                    </div>
                  </div>
                )}

                {step === 'date' && !datesCustomMode && (
                  <div className="w-full min-w-0 overflow-x-auto overflow-y-visible pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className={cn('flex w-max max-w-full flex-nowrap items-center', PILL_TABS_LIST_CLASS)}>
                      {days.map((d) => (
                        <button
                          key={d.toISOString()}
                          type="button"
                          className={PILL_CHOICE_BUTTON_CLASS}
                          onClick={() => pickDate(d)}
                        >
                          {formatDay(d)}
                        </button>
                      ))}
                      <button type="button" className={PILL_CHOICE_BUTTON_CLASS} onClick={startCustomDatePicker}>
                        Pick Date
                      </button>
                    </div>
                  </div>
                )}

                {step === 'time' && (
                  <div
                    className="w-full min-w-0 overflow-x-auto overflow-y-visible pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    dir="ltr"
                  >
                    <div className="inline-flex min-w-min flex-col items-start gap-2">
                      <div className="flex w-max flex-nowrap items-center gap-2">
                        {TIME_SLOTS_24.slice(0, 10).map((t24) => {
                          const label = formatTimeSlot12h(t24)
                          return (
                            <button
                              key={t24}
                              type="button"
                              className={cn(
                                PILL_CHOICE_BUTTON_CLASS,
                                'min-w-[4.5rem] justify-center tabular-nums',
                              )}
                              onClick={() => pickTime(label)}
                            >
                              {label}
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex w-max flex-nowrap items-center gap-2">
                        {TIME_SLOTS_24.slice(10, 20).map((t24) => {
                          const label = formatTimeSlot12h(t24)
                          return (
                            <button
                              key={t24}
                              type="button"
                              className={cn(
                                PILL_CHOICE_BUTTON_CLASS,
                                'min-w-[4.5rem] justify-center tabular-nums',
                              )}
                              onClick={() => pickTime(label)}
                            >
                              {label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {step === 'details' && (
                  <DetailsForm
                    details={details}
                    errors={detailErrors}
                    onChange={(patch) => {
                      setDetails((d) => ({ ...d, ...patch }))
                      setDetailErrors({})
                    }}
                    onSubmit={submitDetails}
                  />
                )}

                {step === 'confirm' && booking.date && (
                  <ConfirmPanel
                    booking={booking}
                    details={details}
                    onConfirm={confirmBooking}
                    onEditDetails={() => handleEditSection('details')}
                  />
                )}

                {step === 'success' && (
                  <div className="mt-3 space-y-4 border-t border-border bg-card -mx-3 px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:-mx-4 sm:px-4">
                    {lastConfirmedReservation ? (
                      <BookingConfirmationCta
                        manageToken={lastConfirmedReservation.manageToken}
                        guests={lastConfirmedReservation.guests}
                        dateLabel={formatDayFromIso(lastConfirmedReservation.dateIso)}
                        timeLabel={lastConfirmedReservation.time || '—'}
                        onCustomize={() =>
                          navigate(reservationManagePath(lastConfirmedReservation.manageToken))
                        }
                        onSkip={resetChat}
                      />
                    ) : (
                      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                        <span
                          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white dark:bg-emerald-600"
                          aria-hidden
                        >
                          ✓
                        </span>
                        <p className="text-left text-[15px] font-medium leading-snug text-emerald-950 dark:text-emerald-50">
                          You&apos;re all set. Ready for another reservation?
                        </p>
                      </div>
                    )}
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        size="lg"
                        className="h-12 w-full max-w-[220px] text-[15px] font-semibold"
                        onClick={resetChat}
                      >
                        Book again
                      </Button>
                    </div>
                    {lastConfirmedReservation ? (
                      <p className="text-center text-[12px] leading-snug text-muted-foreground">
                        Manage dining preferences anytime:{' '}
                        <button
                          type="button"
                          className="font-semibold text-foreground underline-offset-2 hover:underline"
                          onClick={async () => {
                            const url = reservationManageAbsoluteUrl(
                              lastConfirmedReservation.manageToken,
                            )
                            try {
                              await navigator.clipboard.writeText(url)
                              setLinkCopied(true)
                              window.setTimeout(() => setLinkCopied(false), 2500)
                            } catch {
                              /* ignore */
                            }
                          }}
                        >
                          {linkCopied ? 'Link copied' : 'Copy reservation link'}
                        </button>{' '}
                        (confirmation email sends automatically when Resend is configured on the server).
                      </p>
                    ) : null}
                    <div className="flex justify-center pt-1">
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-[13px] font-semibold"
                        onClick={() => {
                          setImportMsg(null)
                          void refreshSaved()
                          setLogOpen(true)
                        }}
                      >
                        Saved bookings
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {showFooter && (
            <>
              {step === 'guests' && guestsInputMode && (
                <div className="shrink-0 border-t border-border bg-card px-3 py-2.5 sm:px-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="guest-count-input" className="sr-only">
                      Number of guests
                    </Label>
                    <Input
                      id="guest-count-input"
                      ref={guestInputRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      enterKeyHint="send"
                      placeholder={`Guests (1–${MAX_GUESTS_TYPED.toLocaleString()})`}
                      value={guestInputDraft}
                      onChange={(e) => {
                        setGuestInputDraft(e.target.value)
                        setGuestInputError(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          submitGuestNumber()
                        }
                      }}
                      className="h-10 flex-1"
                    />
                    <Button type="button" size="lg" className="h-10 shrink-0 px-4 text-[15px] font-semibold" onClick={submitGuestNumber}>
                      Send
                    </Button>
                  </div>
                  {guestInputError ? (
                    <p className="mt-2 text-[13px] font-medium text-destructive" role="alert">
                      {guestInputError}
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    variant="link"
                    className="mt-2 h-auto p-0 text-[13px] font-medium"
                    onClick={() => {
                      setGuestsInputMode(false)
                      setGuestInputDraft('')
                      setGuestInputError(null)
                    }}
                  >
                    Back to quick picks
                  </Button>
                </div>
              )}
              {step === 'date' && datesCustomMode && (
                <div className="w-full min-w-0 shrink-0 border-t border-border bg-card px-3 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-2.5 sm:pb-3">
                  <NotionStyleDatePicker
                    className="min-w-0"
                    onSelectDate={(d) => pickDate(d)}
                  />
                </div>
              )}
            </>
          )}
        </div>
        </div>
      </div>

      <GetDirectionsFab />

      {logOpen && (
        <BookingsLog
          bookings={savedBookings}
          importMsg={importMsg}
          fileInputRef={fileInputRef}
          onClose={() => setLogOpen(false)}
          onDelete={(id) => {
            void (async () => {
              await deleteBooking(id)
              await refreshSaved()
            })()
          }}
          onClear={() => {
            if (
              typeof window !== 'undefined' &&
              window.confirm(
                'Remove all saved bookings? This cannot be undone when using cloud storage.',
              )
            ) {
              void (async () => {
                await clearBookings()
                await refreshSaved()
              })()
            }
          }}
          onExport={() => {
            void (async () => {
              const json = await exportBookingsJson()
              const blob = new Blob([json], {
                type: 'application/json',
              })
              const a = document.createElement('a')
              a.href = URL.createObjectURL(blob)
              a.download = `bookings-${new Date().toISOString().slice(0, 10)}.json`
              a.click()
              URL.revokeObjectURL(a.href)
            })()
          }}
          onPickImportFile={(mode) => {
            importModeRef.current = mode
            fileInputRef.current?.click()
          }}
          onFileChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (!file) return
            const mode = importModeRef.current
            const reader = new FileReader()
            reader.onload = () => {
              void (async () => {
                const text = String(reader.result ?? '')
                const result = await importBookingsFromJson(
                  text,
                  mode === 'replace' ? 'replace' : 'merge',
                )
                if (result.ok) {
                  setImportMsg(
                    mode === 'replace'
                      ? `Replaced with ${result.count} booking(s).`
                      : `Imported / merged · ${result.count} total.`,
                  )
                  await refreshSaved()
                } else {
                  setImportMsg(result.error)
                }
              })()
            }
            reader.readAsText(file)
          }}
        />
      )}
    </div>
  )
}

function DetailsForm({
  details,
  errors,
  onChange,
  onSubmit,
}: {
  details: { name: string; email: string; phone: string }
  errors: { name?: string; email?: string; phone?: string }
  onChange: (patch: Partial<{ name: string; email: string; phone: string }>) => void
  onSubmit: () => void
}) {
  return (
    <Card className="gap-4 py-4 shadow-sm ring-1 ring-border">
      <CardHeader className="gap-1 pb-0">
        <CardTitle className="text-base font-semibold tracking-tight">Your details</CardTitle>
        <CardDescription className="text-[14px] leading-snug">
          We&apos;ll use these to confirm your reservation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        <div className="space-y-1.5">
          <Label htmlFor="details-name" className="text-[13px] font-semibold">
            Full name
          </Label>
          <Input
            id="details-name"
            type="text"
            autoComplete="name"
            value={details.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Alex Rivera"
            className={cn('h-10', errors.name && 'border-destructive')}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? (
            <p className="text-[13px] font-medium text-destructive">{errors.name}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="details-email" className="text-[13px] font-semibold">
            Email
          </Label>
          <Input
            id="details-email"
            type="email"
            autoComplete="email"
            value={details.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="alex@example.com"
            className={cn('h-10', errors.email && 'border-destructive')}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? (
            <p className="text-[13px] font-medium text-destructive">{errors.email}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="details-phone" className="text-[13px] font-semibold">
            Phone
          </Label>
          <Input
            id="details-phone"
            type="tel"
            autoComplete="tel"
            value={details.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+44 20 1234 5678"
            className={cn('h-10', errors.phone && 'border-destructive')}
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone ? (
            <p className="text-[13px] font-medium text-destructive">{errors.phone}</p>
          ) : null}
        </div>
        <Button
          type="button"
          size="lg"
          className="mt-1 h-12 w-full text-[15px] font-semibold"
          onClick={onSubmit}
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  )
}

function ConfirmPanel({
  booking,
  details,
  onConfirm,
  onEditDetails,
}: {
  booking: {
    guestCount: number
    date: Date | null
    time: string
  }
  details: { name: string; email: string; phone: string }
  onConfirm: () => void
  onEditDetails: () => void
}) {
  const d = booking.date
  const guestLabel = String(booking.guestCount)
  const rows = [
    ['Guests', guestLabel],
    ['Date', d ? formatDay(d) : '—'],
    ['Time', booking.time],
    ['Name', details.name.trim()],
    ['Email', details.email.trim()],
    ['Phone', details.phone.trim()],
  ] as const
  return (
    <Card className="gap-4 py-4 shadow-sm ring-1 ring-border">
      <CardHeader className="border-b border-border pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight">Confirm your booking</CardTitle>
          <CardDescription className="text-[14px]">
            Check everything looks right before you confirm.
          </CardDescription>
        </div>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="size-11 shrink-0 rounded-full text-muted-foreground"
            onClick={onEditDetails}
            aria-label={editSectionAriaLabel('details')}
          >
            <PencilSimple size={20} weight="regular" aria-hidden />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <dl className="space-y-2.5">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
              <dt className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground sm:w-24 sm:shrink-0">
                {label}
              </dt>
              <dd className="text-[15px] font-semibold text-foreground sm:min-w-0 sm:flex-1">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <Button
          type="button"
          size="lg"
          className="h-12 w-full text-[15px] font-semibold"
          onClick={onConfirm}
        >
          Confirm booking
        </Button>
      </CardContent>
    </Card>
  )
}

function FigmaMessage({
  role,
  text,
  section,
  showEdit,
  onEdit,
}: {
  role: Role
  text: string
  section?: BookingSection
  showEdit?: boolean
  onEdit?: () => void
}) {
  const isUser = role === 'user'
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="flex max-w-full items-center justify-end gap-1.5 sm:gap-2">
          {showEdit && onEdit && section ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              className="size-11 shrink-0 rounded-full text-muted-foreground"
              onClick={onEdit}
              aria-label={editSectionAriaLabel(section)}
            >
              <PencilSimple size={20} weight="regular" aria-hidden />
            </Button>
          ) : null}
          <div className="min-w-0 max-w-[min(90%,20rem)]">
            <div className="rounded-2xl rounded-br-md bg-primary px-4 py-3 text-[15px] leading-relaxed text-primary-foreground shadow-sm">
              <RichText text={text} isUser />
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-start border-l-4 border-muted-foreground/25 pl-3">
      <div className="max-w-[min(100%,24rem)] text-[15px] leading-relaxed text-foreground">
        <RichText text={text} isUser={false} />
      </div>
    </div>
  )
}

function RichText({ text, isUser }: { text: string; isUser: boolean }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <p className="m-0 whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const inner = part.slice(2, -2)
          return (
            <strong
              key={i}
              className={
                isUser ? 'font-bold text-primary-foreground' : 'font-bold text-foreground'
              }
            >
              {inner}
            </strong>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}
