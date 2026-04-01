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

type Role = 'assistant' | 'user'

type ChatMessage = {
  id: string
  role: Role
  text: string
}

const TIME_SLOTS = [
  '09:00',
  '10:30',
  '13:00',
  '15:30',
  '17:00',
] as const

const GUEST_CHIPS = ['1', '2', '3', '4', '5', '6+'] as const

const RESTAURANT_SERVICE = 'Restaurant'

function nextWeekdays(count: number): Date[] {
  const out: Date[] = []
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  while (out.length < count) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) out.push(new Date(d))
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

const chipBase =
  'rounded-full border border-neutral-300 bg-white px-4 py-2 text-left text-sm font-medium text-neutral-800 shadow-sm transition will-change-transform hover:border-[#303030]/30 hover:bg-neutral-50 active:scale-[0.98] active:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900'

/** Figma 83:3123 — above the card, aligned with its left edge (see 78:1998). */
const backAboveCard =
  'flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-200/80 bg-white p-2 text-neutral-700 shadow-[0_2px_16px_rgba(0,0,0,0.14)] backdrop-blur-[13px] transition hover:bg-neutral-50 hover:text-neutral-900 hover:shadow-[0_4px_20px_rgba(0,0,0,0.16)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500'

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

  const pushUser = (text: string) => {
    setMessages((m) => [...m, { id: uid(), role: 'user', text }])
  }

  const pushAssistant = (text: string) => {
    setMessages((m) => [...m, { id: uid(), role: 'assistant', text }])
  }

  const guestCountFromLabel = (label: string) => {
    if (label === '6+') return 6
    const n = Number(label)
    return Number.isFinite(n) ? n : 0
  }

  const pickGuest = (label: string) => {
    if (step !== 'guests') return
    pushUser(
      label === '6+' ? 'Table for 6 or more' : `Table for ${label} guest${label === '1' ? '' : 's'}`,
    )
    const gc = guestCountFromLabel(label)
    setBooking((b) => ({ ...b, guestCount: gc }))
    pushAssistant('Which **date** would you like to book?')
    setStep('date')
  }

  const pickDate = (d: Date) => {
    if (step !== 'date') return
    pushUser(formatDay(d))
    setBooking((b) => ({ ...b, date: d }))
    pushAssistant('Here are the available times. Pick one that suits you.')
    setStep('time')
  }

  const pickTime = (t: string) => {
    if (step !== 'time') return
    pushUser(t)
    setBooking((b) => ({ ...b, time: t }))
    pushAssistant(
      'Almost there. Enter your **full name**, **email**, and **phone number** below, then continue.',
    )
    setStep('details')
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

  const days = nextWeekdays(5)

  const resetChat = () => {
    setBooking({ guestCount: 0, date: null, time: '' })
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
    <div className="relative min-h-dvh bg-[#ececec]">
      <div className="flex min-h-dvh w-full items-center justify-center px-4 pb-28 pt-8">
        <div className="flex w-full max-w-[308px] flex-col items-stretch">
          <div className="sticky top-[max(0.75rem,env(safe-area-inset-top))] z-50 mb-2 self-start">
            <button
              type="button"
              onClick={onBack}
              className={backAboveCard}
              aria-label="Back to restaurant"
            >
              <BackChevronIcon size={14} />
            </button>
          </div>

          <div
            className="flex max-h-[min(580px,calc(100dvh-5.5rem))] w-full flex-col rounded-2xl border border-white/30 bg-[#f3f3f3]/95 p-3 shadow-sm backdrop-blur-[14px]"
            role="region"
            aria-labelledby={titleId}
          >
            <div className="shrink-0 rounded-xl border border-white/30 bg-[#272727] p-4 shadow-inner">
              <div className="mb-3">
                <AiChatbotLogo sizePx={24} />
              </div>
              <p
                id={titleId}
                className="text-[14px] font-semibold text-white [text-shadow:0_9px_54px_rgba(0,0,0,0.5)]"
              >
                Hey !
              </p>
              <p className="mt-1 text-[13px] leading-snug text-white/80 [text-shadow:0_9px_54px_rgba(0,0,0,0.5)]">
                I&apos;m here to help you make your reservation
              </p>
            </div>

            {step === 'submitting' ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-4 py-8">
                <div
                  className="size-10 animate-spin rounded-full border-2 border-neutral-300 border-t-[#303030]"
                  aria-hidden
                />
                <p className="text-center text-[14px] font-medium text-[#303030]">
                  Booking in progress…
                </p>
                <p className="text-center text-xs text-neutral-500">
                  Please wait a moment
                </p>
              </div>
            ) : (
              <>
                <div
                  ref={listRef}
                  className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto px-1 py-1"
                  role="log"
                  aria-relevant="additions"
                  aria-live="polite"
                >
                  {messages.map((msg) => (
                    <FigmaMessage key={msg.id} role={msg.role} text={msg.text} />
                  ))}

                  {step === 'guests' && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {GUEST_CHIPS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => pickGuest(g)}
                          className={chipBase}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 'date' && (
                    <div className="flex gap-2 overflow-x-auto pb-1 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {days.map((d) => (
                        <button
                          key={d.toISOString()}
                          type="button"
                          onClick={() => pickDate(d)}
                          className={`${chipBase} shrink-0`}
                        >
                          {formatDay(d)}
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 'time' && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {TIME_SLOTS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => pickTime(t)}
                          className={chipBase}
                        >
                          {t}
                        </button>
                      ))}
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
                    />
                  )}
                </div>

                {step === 'success' && (
                  <div className="mt-3 shrink-0 space-y-3 border-t border-white/30 pt-3">
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-3 text-center">
                      <span
                        className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white"
                        aria-hidden
                      >
                        ✓
                      </span>
                      <p className="text-left text-[13px] font-medium text-emerald-900">
                        You&apos;re all set. Ready for another reservation?
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetChat}
                      className="mx-auto flex h-11 w-[200px] items-center justify-center rounded-lg bg-[#303030] text-sm font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition hover:bg-[#3d3d3d] active:scale-[0.99] active:bg-[#252525] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                    >
                      Book Now
                    </button>
                  </div>
                )}
              </>
            )}

            {showFooter && (
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/20 pt-2">
                <p className="truncate text-xs text-neutral-500">
                  Gilgamesh · booking assistant
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLogOpen(true)
                    setImportMsg(null)
                    refreshSaved()
                  }}
                  className="relative shrink-0 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                >
                  Bookings
                  {savedBookings.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#303030] px-0.5 text-[10px] font-semibold text-white">
                      {savedBookings.length > 99 ? '99+' : savedBookings.length}
                    </span>
                  )}
                </button>
              </div>
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
    'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[13px] text-[#303030] placeholder:text-neutral-400 focus:border-[#303030] focus:outline-none focus:ring-2 focus:ring-neutral-900/20'

  return (
    <div className="space-y-3 rounded-xl border border-white/40 bg-white/80 p-3 pt-2">
      <p className="text-[13px] font-medium text-[#303030]">Your details</p>
      <div>
        <label className="mb-1 block text-[11px] font-medium text-neutral-500">
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
          <p className="mt-1 text-[11px] text-red-600">{errors.name}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-medium text-neutral-500">
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
          <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-medium text-neutral-500">
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
          <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onSubmit}
        className="w-full rounded-lg bg-[#303030] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#3d3d3d] active:scale-[0.99] active:bg-[#252525] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
      >
        Continue
      </button>
    </div>
  )
}

function ConfirmPanel({
  booking,
  details,
  onConfirm,
}: {
  booking: {
    guestCount: number
    date: Date | null
    time: string
  }
  details: { name: string; email: string; phone: string }
  onConfirm: () => void
}) {
  const d = booking.date
  return (
    <div className="space-y-3 rounded-xl border border-[#303030]/20 bg-white/90 p-3">
      <p className="text-[13px] font-semibold text-[#303030]">Confirm your booking</p>
      <ul className="space-y-1.5 text-[13px] text-neutral-700">
        <li>
          <span className="text-neutral-500">Guests:</span>{' '}
          {booking.guestCount === 6 ? '6+' : booking.guestCount}
        </li>
        <li>
          <span className="text-neutral-500">Date:</span>{' '}
          {d ? formatDay(d) : '—'}
        </li>
        <li>
          <span className="text-neutral-500">Time:</span> {booking.time}
        </li>
        <li>
          <span className="text-neutral-500">Name:</span> {details.name.trim()}
        </li>
        <li>
          <span className="text-neutral-500">Email:</span> {details.email.trim()}
        </li>
        <li>
          <span className="text-neutral-500">Phone:</span> {details.phone.trim()}
        </li>
      </ul>
      <button
        type="button"
        onClick={onConfirm}
        className="w-full rounded-lg bg-[#303030] py-2.5 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] transition hover:bg-[#3d3d3d] active:scale-[0.99] active:bg-[#252525] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
      >
        Confirm booking
      </button>
    </div>
  )
}

function FigmaMessage({ role, text }: { role: Role; text: string }) {
  const isUser = role === 'user'
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="relative max-w-[90%]">
          <div className="rounded-xl bg-[#303030] px-4 py-3 text-[14px] leading-snug text-white">
            <RichText text={text} isUser />
          </div>
          <div
            className="absolute -right-1 bottom-3 size-2.5 rotate-45 bg-[#303030]"
            aria-hidden
          />
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[95%] text-[14px] font-medium leading-5 text-[#303030]">
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
                isUser ? 'font-semibold text-white' : 'font-semibold text-[#303030]'
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
