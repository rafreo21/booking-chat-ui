import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
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
import { ASSETS } from './figma/assets'
import { GetDirectionsFab } from './components/GetDirectionsFab'
import { BookingsLog } from './components/BookingsLog'

type Role = 'assistant' | 'user'

type ChatMessage = {
  id: string
  role: Role
  text: string
}

const SERVICES = [
  { id: 'consult', label: 'Consultation', detail: '30 min · intro call' },
  { id: 'workshop', label: 'Workshop', detail: 'Group session' },
  { id: 'oneone', label: '1:1 Session', detail: '60 min · deep dive' },
] as const

const TIME_SLOTS = [
  '09:00',
  '10:30',
  '13:00',
  '15:30',
  '17:00',
] as const

const GUEST_CHIPS = ['1', '2', '3', '4', '5', '6+'] as const

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

type Step = 'guests' | 'service' | 'date' | 'time' | 'contact' | 'done'

const chipBase =
  'rounded-full border border-neutral-300 bg-white px-4 py-2 text-left text-sm font-medium text-neutral-800 shadow-sm transition will-change-transform hover:border-[#303030]/30 hover:bg-neutral-50 active:scale-[0.98] active:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900'

const chipTime =
  'rounded-full bg-[#303030] px-4 py-2 text-sm font-semibold text-white shadow-sm transition will-change-transform hover:bg-[#3d3d3d] active:scale-[0.98] active:bg-[#252525] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2'

type Props = {
  onBack: () => void
}

export function BookingChatView({ onBack }: Props) {
  const titleId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    serviceLabel: '',
    date: null as Date | null,
    time: '',
    name: '',
    email: '',
  })

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
      label === '6+' ? 'I need a table for 6+' : `I need a table for ${label}`,
    )
    const gc = guestCountFromLabel(label)
    setBooking((b) => ({ ...b, guestCount: gc }))
    pushAssistant('What would you like to schedule?')
    setStep('service')
  }

  const pickService = (label: string) => {
    if (step !== 'service') return
    pushUser(label)
    setBooking((b) => ({ ...b, serviceLabel: label }))
    pushAssistant(`Great — ${label} it is. Pick a day that works for you.`)
    setStep('date')
  }

  const pickDate = (d: Date) => {
    if (step !== 'date') return
    pushUser(formatDay(d))
    setBooking((b) => ({ ...b, date: d }))
    pushAssistant('Here are open times that day. Tap one.')
    setStep('time')
  }

  const pickTime = (t: string) => {
    if (step !== 'time') return
    pushUser(t)
    setBooking((b) => ({ ...b, time: t }))
    pushAssistant(
      'Almost there. Send your name and email in one line, like: **Alex Rivera, alex@email.com** — or use the field below.',
    )
    setStep('contact')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const submitContact = (raw: string) => {
    if (step !== 'contact') return
    const trimmed = raw.trim()
    if (trimmed.length < 3) return

    const emailMatch = trimmed.match(/[^\s@]+@[^\s@]+\.[^\s@]+/)
    const email = emailMatch ? emailMatch[0] : ''
    const namePart = email
      ? trimmed.replace(email, '').replace(/,/g, ' ').trim()
      : trimmed

    pushUser(trimmed)
    setBooking((b) => ({ ...b, name: namePart || 'Guest', email: email || '' }))

    addBooking({
      guests: booking.guestCount,
      service: booking.serviceLabel,
      dateIso: booking.date ? booking.date.toISOString() : '',
      time: booking.time,
      name: namePart || 'Guest',
      email: email || '',
    })
    refreshSaved()

    const when = booking.date
      ? `${formatDay(booking.date)} · ${booking.time}`
      : `${booking.time}`

    pushAssistant(
      `You're booked for **${booking.serviceLabel}** on ${when}.` +
        (email
          ? ` I'll send details to ${email}.`
          : ' Add an email next time if you want a confirmation message.') +
        ' This booking is saved in your browser (see **Bookings**).',
    )
    setStep('done')
  }

  const days = nextWeekdays(5)

  const resetChat = () => {
    setBooking({
      guestCount: 0,
      serviceLabel: '',
      date: null,
      time: '',
      name: '',
      email: '',
    })
    setStep('guests')
    setMessages([
      {
        id: uid(),
        role: 'assistant',
        text: 'How many guests are we expecting?',
      },
    ])
  }

  return (
    <div className="relative min-h-dvh bg-[#ececec]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[340px] flex-col px-4 pb-28 pt-6 md:py-10">
        <div className="relative w-full max-w-[308px] self-center">
          <button
            type="button"
            onClick={onBack}
            className="absolute -left-1 -top-2 z-20 flex size-9 items-center justify-center rounded-full border border-white/50 bg-white shadow-md transition hover:bg-neutral-50 active:scale-95 active:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 md:-left-12"
            aria-label="Back to restaurant"
          >
            <img
              src={ASSETS.backChevron}
              alt=""
              className="size-3.5 opacity-70"
            />
          </button>

          <div
            className="flex max-h-[min(560px,calc(100dvh-7rem))] flex-col rounded-2xl border border-white/30 bg-[#f3f3f3]/95 p-3 shadow-sm backdrop-blur-[14px]"
            role="region"
            aria-labelledby={titleId}
          >
            <div className="shrink-0 rounded-xl border border-white/30 bg-[#272727] p-4 shadow-inner">
              <img
                src={ASSETS.aiLogo}
                alt=""
                className="mb-2 size-6"
                width={24}
                height={24}
              />
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

              {step === 'service' && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SERVICES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => pickService(s.label)}
                      className={chipBase}
                    >
                      <span className="block">{s.label}</span>
                      <span className="block text-xs font-normal text-neutral-500">
                        {s.detail}
                      </span>
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
                      className={chipTime}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {step !== 'done' && (
              <Composer
                ref={inputRef}
                disabled={step !== 'contact'}
                placeholder={
                  step === 'contact'
                    ? 'Name and email…'
                    : 'Use the suggestions above'
                }
                onSend={submitContact}
              />
            )}

            {step === 'done' && (
              <div className="mt-2 shrink-0 border-t border-white/30 pt-3">
                <button
                  type="button"
                  onClick={resetChat}
                  className="w-full rounded-lg bg-[#303030] py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition hover:bg-[#3d3d3d] active:scale-[0.99] active:bg-[#252525] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                >
                  Book another
                </button>
              </div>
            )}

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

type ComposerProps = {
  disabled: boolean
  placeholder: string
  onSend: (value: string) => void
}

const Composer = forwardRef<HTMLInputElement, ComposerProps>(
  function Composer({ disabled, placeholder, onSend }, ref) {
    const [value, setValue] = useState('')

    const send = () => {
      if (!value.trim() || disabled) return
      onSend(value)
      setValue('')
    }

    return (
      <div className="mt-2 shrink-0 border-t border-white/30 pt-3">
        <div className="flex items-center gap-1 rounded-lg border border-[#8a8a8a] bg-[#fdfdfd] px-3 py-1.5 shadow-sm">
          <input
            ref={ref}
            type="text"
            value={value}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder={placeholder}
            className="min-h-9 flex-1 bg-transparent text-[13px] font-medium leading-5 text-[#303030] placeholder:text-neutral-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Message"
          />
          <button
            type="button"
            disabled={disabled || !value.trim()}
            onClick={send}
            className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-[#3f3f3f] text-white transition hover:bg-[#303030] active:scale-95 active:bg-[#252525] disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            aria-label="Send"
          >
            <img src={ASSETS.sendIcon} alt="" className="size-3.5 opacity-90" />
          </button>
        </div>
      </div>
    )
  },
)
