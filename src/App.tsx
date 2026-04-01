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
  | 'service'
  | 'date'
  | 'time'
  | 'contact'
  | 'done'

export default function App() {
  const titleId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('service')
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: uid(),
      role: 'assistant',
      text: "Hi — I'll help you book in a few taps. What would you like to schedule?",
    },
  ])

  const [booking, setBooking] = useState({
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

  return (
    <div
      className="mx-auto flex h-dvh max-w-lg flex-col bg-[var(--color-chat-bg)] shadow-[0_0_0_1px_var(--color-chat-border)] md:my-4 md:h-[calc(100dvh-2rem)] md:rounded-2xl md:shadow-lg"
      role="region"
      aria-labelledby={titleId}
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-[var(--color-chat-border)] bg-[var(--color-chat-surface)]/90 px-4 py-3 backdrop-blur-md md:rounded-t-2xl">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white"
          aria-hidden
        >
          B
        </div>
        <div className="min-w-0 flex-1">
          <h1 id={titleId} className="truncate text-base font-semibold text-stone-900">
            Booking assistant
          </h1>
          <p className="truncate text-sm text-stone-500">
            {step === 'done' ? 'Booking saved locally' : 'Usually replies instantly'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLogOpen(true)
            setImportMsg(null)
            refreshSaved()
          }}
          className="relative shrink-0 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          Bookings
          {savedBookings.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-[11px] font-semibold text-white">
              {savedBookings.length > 99 ? '99+' : savedBookings.length}
            </span>
          )}
        </button>
      </header>

      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4"
        role="log"
        aria-relevant="additions"
        aria-live="polite"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role} text={msg.text} />
        ))}

        {step === 'service' && (
          <div className="flex flex-wrap gap-2 pl-1 pt-1">
            {SERVICES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pickService(s.label)}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-left text-sm font-medium text-stone-800 shadow-sm transition hover:border-teal-600/40 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                <span className="block">{s.label}</span>
                <span className="block text-xs font-normal text-stone-500">
                  {s.detail}
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 'date' && (
          <div className="flex gap-2 overflow-x-auto pb-1 pl-1 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {days.map((d) => (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => pickDate(d)}
                className="shrink-0 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-800 shadow-sm transition hover:border-teal-600/50 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                {formatDay(d)}
              </button>
            ))}
          </div>
        )}

        {step === 'time' && (
          <div className="flex flex-wrap gap-2 pl-1 pt-1">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => pickTime(t)}
                className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
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
        <div className="shrink-0 space-y-2 border-t border-[var(--color-chat-border)] bg-[var(--color-chat-surface)] p-4 md:rounded-b-2xl">
          <button
            type="button"
            onClick={() => {
              setBooking({
                serviceLabel: '',
                date: null,
                time: '',
                name: '',
                email: '',
              })
              setStep('service')
              setMessages([
                {
                  id: uid(),
                  role: 'assistant',
                  text: 'Start another booking whenever you like. What would you like to schedule?',
                },
              ])
            }}
            className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
          >
            Book another
          </button>
        </div>
      )}

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

function BookingsLog({
  bookings,
  importMsg,
  fileInputRef,
  onClose,
  onDelete,
  onClear,
  onExport,
  onPickImportFile,
  onFileChange,
}: {
  bookings: SavedBooking[]
  importMsg: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onClose: () => void
  onDelete: (id: string) => void
  onClear: () => void
  onExport: () => void
  onPickImportFile: (mode: 'merge' | 'replace') => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bookings-log-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative max-h-[85dvh] w-full max-w-lg overflow-hidden rounded-t-2xl border border-[var(--color-chat-border)] bg-[var(--color-chat-surface)] shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-[var(--color-chat-border)] px-4 py-3">
          <h2 id="bookings-log-title" className="text-base font-semibold text-stone-900">
            Saved bookings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-stone-600 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            Close
          </button>
        </div>
        <p className="border-b border-[var(--color-chat-border)] px-4 py-2 text-xs text-stone-500">
          Stored in this browser (localStorage). Export JSON and commit{' '}
          <code className="rounded bg-stone-100 px-1 text-[11px] text-stone-800">
            public/bookings.json
          </code>{' '}
          to back up on GitHub; redeploy so new visitors can hydrate from that file.
        </p>
        <div className="max-h-[40dvh] overflow-y-auto px-2 py-2">
          {bookings.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-stone-500">
              No bookings yet. Complete a chat booking to save one here.
            </p>
          ) : (
            <ul className="space-y-2">
              {bookings.map((b) => (
                <li
                  key={b.id}
                  className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-stone-900">{b.service}</p>
                      <p className="text-stone-600">
                        {b.dateIso
                          ? `${formatDay(new Date(b.dateIso))} · ${b.time}`
                          : b.time}
                      </p>
                      <p className="truncate text-stone-500">
                        {b.name}
                        {b.email ? ` · ${b.email}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDelete(b.id)}
                      className="shrink-0 text-xs text-red-700 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-2 border-t border-[var(--color-chat-border)] bg-stone-50/80 px-4 py-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={onFileChange}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onExport}
              className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              Download JSON
            </button>
            <button
              type="button"
              onClick={() => onPickImportFile('merge')}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-800 hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              Import file (merge)
            </button>
            <button
              type="button"
              onClick={() => onPickImportFile('replace')}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-800 hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              Replace from file
            </button>
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-800 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Clear all
            </button>
          </div>
          {importMsg && (
            <p className="text-xs text-stone-600" role="status">
              {importMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ role, text }: { role: Role; text: string }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug ${
          isUser
            ? 'rounded-br-md bg-teal-700 text-white'
            : 'rounded-bl-md border border-[var(--color-chat-border)] bg-[var(--color-chat-surface)] text-stone-800 shadow-sm'
        }`}
      >
        <RichText text={text} isUser={isUser} />
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
              className={isUser ? 'font-semibold text-white' : 'font-semibold text-stone-900'}
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
      <div className="shrink-0 border-t border-[var(--color-chat-border)] bg-[var(--color-chat-surface)]/95 p-3 backdrop-blur md:rounded-b-2xl">
        <div className="flex items-end gap-2">
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
            className="min-h-11 flex-1 rounded-xl border border-stone-300 bg-stone-50 px-4 py-2 text-[15px] text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Message"
          />
          <button
            type="button"
            disabled={disabled || !value.trim()}
            onClick={send}
            className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            Send
          </button>
        </div>
      </div>
    )
  },
)
