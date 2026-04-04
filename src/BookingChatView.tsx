import { PencilSimple } from '@phosphor-icons/react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
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
import { syncBookingToSheets } from './syncBookingToSheets'
import { AiChatbotLogo } from './components/AiChatbotLogo'
import { BackChevronIcon } from './components/BackChevronIcon'
import { GetDirectionsFab } from './components/GetDirectionsFab'
import { BookingsLog } from './components/BookingsLog'
import { NotionStyleDatePicker } from './components/NotionStyleDatePicker'
import { VenueHeaderRating } from './components/VenueHeaderRating'
import {
  WIDGET_FRAME_HEIGHT_CLASS,
  WIDGET_PAGE_SHELL_CLASS,
  WIDGET_STACK_COLUMN_CLASS,
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

/** Guest counts: equal width & height circles (reference). */
const chipGuest =
  'flex size-11 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-[15px] font-semibold tabular-nums text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1'

/** Date / time: compact pills — not stretched full width. */
const chipPill =
  'inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white px-3.5 text-[13px] font-semibold text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1'

const backAboveCard =
  'flex size-11 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition hover:border-neutral-300 hover:bg-neutral-50 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500'

const btnPrimary =
  'w-full min-h-[48px] rounded-full bg-neutral-950 px-4 text-[15px] font-semibold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2'

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

  useEffect(() => {
    void (async () => {
      await hydrateFromPublicFile()
      setSavedBookings(loadBookings())
    })()
  }, [])

  useEffect(() => {
    if (guestsInputMode) guestInputRef.current?.focus()
  }, [guestsInputMode])

  const refreshSaved = useCallback(() => {
    setSavedBookings(loadBookings())
  }, [])

  const scrollToBottom = useCallback(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
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
      const saved = addBooking({
        guests: booking.guestCount,
        service: RESTAURANT_SERVICE,
        dateIso: booking.date ? booking.date.toISOString() : '',
        time: booking.time,
        name: details.name.trim(),
        email: details.email.trim(),
        phone: details.phone.trim(),
      })
      void syncBookingToSheets(saved)
      refreshSaved()
      pushAssistant(
        '**Booking confirmed!** Your table is reserved. We look forward to welcoming you.',
      )
      setStep('success')
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

  const timeSlotsFirstRow = TIME_SLOTS_24.slice(0, 10)
  const timeSlotsSecondRow = TIME_SLOTS_24.slice(10, 20)

  const resetChat = () => {
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
    <div className="relative min-h-dvh bg-[var(--color-chat-bg)]">
      <div className={WIDGET_PAGE_SHELL_CLASS}>
        <div className={WIDGET_STACK_COLUMN_CLASS}>
          <div className="sticky top-[max(0.5rem,env(safe-area-inset-top))] z-50 flex w-full justify-start py-2">
            <button
              type="button"
              onClick={onBack}
              className={backAboveCard}
              aria-label="Back to restaurant"
            >
              <BackChevronIcon size={20} />
            </button>
          </div>

          <div
            className={`flex w-full flex-col overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-md ${WIDGET_FRAME_HEIGHT_CLASS}`}
            role="region"
            aria-labelledby={titleId}
          >
          <div className="shrink-0 border-b border-neutral-800 bg-neutral-950 px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex flex-col items-start gap-1.5 sm:gap-2">
              <AiChatbotLogo />
              <div className="min-w-0">
                <p
                  id={titleId}
                  className="text-[16px] font-bold leading-tight tracking-tight text-white sm:text-[17px]"
                >
                  Hey!
                </p>
                <p className="mt-1 text-[14px] leading-snug text-[#f3f2f2] sm:text-[15px]">
                  I&apos;m here to help you make your reservation.
                </p>
              </div>
              <VenueHeaderRating
                theme="dark"
                className="mt-2 w-full border-t border-white/10 pt-2.5 sm:mt-3 sm:pt-3"
              />
            </div>
          </div>

          {step === 'submitting' ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10">
              <div
                className="size-11 animate-spin rounded-full border-[3px] border-neutral-200 border-t-neutral-950"
                aria-hidden
              />
              <p className="text-center text-[16px] font-semibold text-neutral-950">
                Booking in progress…
              </p>
              <p className="text-center text-[15px] text-neutral-600">
                Please wait a moment.
              </p>
            </div>
          ) : (
            <>
              <div
                ref={listRef}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-neutral-50/80 px-3 py-3 sm:space-y-3 sm:px-4 sm:py-4"
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
                  <div className="w-full overflow-x-auto overflow-y-visible pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex w-max flex-nowrap items-center justify-start gap-2.5">
                      {GUEST_CHIPS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => pickGuest(g)}
                          className={chipGuest}
                        >
                          {g}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={startGuestNumberInput}
                        className={`${chipPill} shrink-0 whitespace-nowrap px-4`}
                      >
                        Enter Number
                      </button>
                    </div>
                  </div>
                )}

                {step === 'date' && !datesCustomMode && (
                  <div className="w-full overflow-x-auto overflow-y-visible pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex w-max flex-nowrap items-center justify-start gap-2.5">
                      {days.map((d) => (
                        <button
                          key={d.toISOString()}
                          type="button"
                          onClick={() => pickDate(d)}
                          className={chipPill}
                        >
                          {formatDay(d)}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={startCustomDatePicker}
                        className={`${chipPill} shrink-0 whitespace-nowrap px-4`}
                      >
                        Pick Date
                      </button>
                    </div>
                  </div>
                )}

                {step === 'time' && (
                  <div
                    className="w-full overflow-x-auto overflow-y-visible pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    dir="ltr"
                  >
                    <div className="inline-flex min-w-min flex-col items-start gap-2">
                      <div className="flex w-max flex-nowrap items-center justify-start gap-2.5">
                        {timeSlotsFirstRow.map((t24) => {
                          const label = formatTimeSlot12h(t24)
                          return (
                            <button
                              key={t24}
                              type="button"
                              onClick={() => pickTime(label)}
                              className={`${chipPill} min-w-[4.5rem] shrink-0 px-3.5 tabular-nums`}
                            >
                              {label}
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex w-max flex-nowrap items-center justify-start gap-2.5">
                        {timeSlotsSecondRow.map((t24) => {
                          const label = formatTimeSlot12h(t24)
                          return (
                            <button
                              key={t24}
                              type="button"
                              onClick={() => pickTime(label)}
                              className={`${chipPill} min-w-[4.5rem] shrink-0 px-3.5 tabular-nums`}
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
              </div>

              {step === 'success' && (
                <div className="shrink-0 space-y-3 border-t border-neutral-200 bg-white px-3 py-4 sm:px-4">
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <span
                      className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white"
                      aria-hidden
                    >
                      ✓
                    </span>
                    <p className="text-left text-[15px] font-medium leading-snug text-emerald-950">
                      You&apos;re all set. Ready for another reservation?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetChat}
                    className={`${btnPrimary} mx-auto w-full max-w-[220px]`}
                  >
                    Book again
                  </button>
                </div>
              )}
            </>
          )}

          {showFooter && (
            <>
              {step === 'guests' && guestsInputMode && (
                <div className="shrink-0 border-t border-neutral-200 bg-white px-3 py-2.5 sm:px-4">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="guest-count-input"
                      className="sr-only"
                    >
                      Number of guests
                    </label>
                    <input
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
                      className="min-h-11 min-w-0 flex-1 rounded-full border-2 border-neutral-200 bg-white px-4 text-[16px] text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-4 focus:ring-neutral-950/10"
                    />
                    <button
                      type="button"
                      onClick={submitGuestNumber}
                      className="shrink-0 rounded-full bg-neutral-950 px-4 py-2.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
                    >
                      Send
                    </button>
                  </div>
                  {guestInputError ? (
                    <p className="mt-2 text-[13px] font-medium text-red-600" role="alert">
                      {guestInputError}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setGuestsInputMode(false)
                      setGuestInputDraft('')
                      setGuestInputError(null)
                    }}
                    className="mt-2 text-[13px] font-medium text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline"
                  >
                    Back to quick picks
                  </button>
                </div>
              )}
              {step === 'date' && datesCustomMode && (
                <div className="w-full min-w-0 shrink-0 border-t border-neutral-200 bg-white px-3 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-2.5 sm:pb-3">
                  <NotionStyleDatePicker
                    className="min-w-0"
                    onSelectDate={(d) => pickDate(d)}
                  />
                </div>
              )}
              {!(step === 'date' && datesCustomMode) && (
                <div className="flex shrink-0 items-center justify-between gap-2 border-t border-neutral-200 bg-white px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
                  <p className="min-w-0 truncate text-[12px] font-medium text-neutral-500 sm:text-[13px] sm:text-neutral-600">
                    Gilgamesh · booking assistant
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLogOpen(true)
                      setImportMsg(null)
                      refreshSaved()
                    }}
                    className="relative shrink-0 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-[13px] font-semibold text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                  >
                    Bookings
                    {savedBookings.length > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1 text-[11px] font-bold text-white">
                        {savedBookings.length > 99 ? '99+' : savedBookings.length}
                      </span>
                    )}
                  </button>
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
            deleteBooking(id)
            refreshSaved()
          }}
          onClear={() => {
            if (
              typeof window !== 'undefined' &&
              window.confirm('Remove all saved bookings from this browser?')
            ) {
              clearBookings()
              refreshSaved()
            }
          }}
          onExport={() => {
            const blob = new Blob([exportBookingsJson()], {
              type: 'application/json',
            })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `bookings-${new Date().toISOString().slice(0, 10)}.json`
            a.click()
            URL.revokeObjectURL(a.href)
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
              const text = String(reader.result ?? '')
              const result = importBookingsFromJson(
                text,
                mode === 'replace' ? 'replace' : 'merge',
              )
              if (result.ok) {
                setImportMsg(
                  mode === 'replace'
                    ? `Replaced with ${result.count} booking(s).`
                    : `Imported / merged · ${result.count} total in browser.`,
                )
                refreshSaved()
              } else {
                setImportMsg(result.error)
              }
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
  const input =
    'w-full min-h-[48px] rounded-xl border-2 border-neutral-200 bg-white px-3.5 text-[16px] text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-4 focus:ring-neutral-950/10'

  return (
    <div className="space-y-4 rounded-xl border-2 border-neutral-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-[16px] font-bold text-neutral-950">Your details</h3>
        <p className="mt-1 text-[14px] leading-snug text-neutral-600">
          We&apos;ll use these to confirm your reservation.
        </p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-neutral-800">
            Full name
          </label>
          <input
            type="text"
            autoComplete="name"
            value={details.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Alex Rivera"
            className={input}
          />
          {errors.name && (
            <p className="mt-1.5 text-[13px] font-medium text-red-700">{errors.name}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-neutral-800">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            value={details.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="alex@example.com"
            className={input}
          />
          {errors.email && (
            <p className="mt-1.5 text-[13px] font-medium text-red-700">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-neutral-800">
            Phone
          </label>
          <input
            type="tel"
            autoComplete="tel"
            value={details.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+44 20 1234 5678"
            className={input}
          />
          {errors.phone && (
            <p className="mt-1.5 text-[13px] font-medium text-red-700">{errors.phone}</p>
          )}
        </div>
      </div>
      <button type="button" onClick={onSubmit} className={btnPrimary}>
        Continue
      </button>
    </div>
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
  const editBtn =
    'flex size-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 sm:size-11'
  return (
    <div className="space-y-4 rounded-xl border-2 border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-bold text-neutral-950">Confirm your booking</h3>
          <p className="mt-1 text-[14px] text-neutral-600">
            Check everything looks right before you confirm.
          </p>
        </div>
        <button
          type="button"
          onClick={onEditDetails}
          className={editBtn}
          aria-label={editSectionAriaLabel('details')}
        >
          <PencilSimple size={20} weight="regular" aria-hidden />
        </button>
      </div>
      <dl className="space-y-2.5 border-t border-neutral-100 pt-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
            <dt className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500 sm:w-24 sm:shrink-0">
              {label}
            </dt>
            <dd className="text-[15px] font-semibold text-neutral-950 sm:min-w-0 sm:flex-1">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <button type="button" onClick={onConfirm} className={btnPrimary}>
        Confirm booking
      </button>
    </div>
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
            <button
              type="button"
              onClick={onEdit}
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#919191] transition hover:bg-neutral-200/70 hover:text-[#717171] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#919191]/40 focus-visible:ring-offset-1"
              aria-label={editSectionAriaLabel(section)}
            >
              <PencilSimple size={20} weight="regular" aria-hidden />
            </button>
          ) : null}
          <div className="min-w-0 max-w-[min(90%,20rem)]">
            <div className="rounded-2xl rounded-br-md bg-neutral-950 px-4 py-3 text-[15px] leading-relaxed text-white shadow-sm">
              <RichText text={text} isUser />
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-start border-l-4 border-neutral-300 pl-3">
      <div className="max-w-[min(100%,24rem)] text-[15px] leading-relaxed text-neutral-950">
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
                isUser ? 'font-bold text-white' : 'font-bold text-neutral-950'
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
