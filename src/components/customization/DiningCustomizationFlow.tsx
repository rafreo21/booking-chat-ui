import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SavedBooking } from '../../storage'
import { saveCustomization } from '../../storage'
import { notifyDiningPreferenceSaved } from '../../lib/diningPreferenceIngest'
import { useMenuCatalog } from '../../menu/useMenuCatalog'
import type { DiningCustomization, GuestSeat, MenuCategoryId } from '../../types/bookingCustomization'
import { buildDefaultSeats } from '../../types/bookingCustomization'
import { CustomizationSummary } from './CustomizationSummary'
import { MenuCategoryTabs } from './MenuCategoryTabs'
import { SeatAssignmentList } from './SeatAssignmentList'
import { SeatMenuPicker } from './SeatMenuPicker'

function cloneGuestSeats(seats: GuestSeat[]): GuestSeat[] {
  return seats.map((s) => ({
    ...s,
    selectedMenuItemIds: [...s.selectedMenuItemIds],
  }))
}

function reconcileSeats(booking: SavedBooking, saved: DiningCustomization | null): GuestSeat[] {
  const n = Math.max(1, booking.guests)
  if (!saved || saved.seats.length !== n) {
    if (saved && saved.seats.length > 0) {
      return buildDefaultSeats(n).map((s, i) => ({
        ...s,
        displayName: saved.seats[i]?.displayName ?? s.displayName,
        selectedMenuItemIds: [...(saved.seats[i]?.selectedMenuItemIds ?? [])],
      }))
    }
    return buildDefaultSeats(n)
  }
  return saved.seats.map((s) => ({
    ...s,
    selectedMenuItemIds: [...s.selectedMenuItemIds],
  }))
}

const btnPrimary =
  'w-full min-h-[48px] rounded-full bg-neutral-950 px-4 text-[15px] font-semibold text-white shadow-sm transition-[colors,box-shadow,transform] duration-200 ease-out press:bg-neutral-700 press:shadow-md active:bg-neutral-900 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2'

const btnGhost =
  'w-full min-h-[44px] rounded-full border border-neutral-300 bg-white px-4 text-[15px] font-semibold text-neutral-800 shadow-sm transition-colors duration-200 ease-out press:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2'

const notesCls =
  'mt-3 w-full rounded-xl border-2 border-neutral-200 bg-white px-3 py-2.5 text-[15px] text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-4 focus:ring-neutral-950/10'

type Props = {
  reservation: SavedBooking
  initialCustomization: DiningCustomization | null
  showBackLink?: boolean
  onBack?: () => void
}

export function DiningCustomizationFlow({
  reservation,
  initialCustomization,
  showBackLink,
  onBack,
}: Props) {
  const {
    loading: menuLoading,
    error: menuError,
    categories,
    menuItemsInCategory,
    availabilityVersion,
  } = useMenuCatalog()

  const maxPerSeat = useMemo(() => {
    const n = Number(import.meta.env.VITE_MAX_DISHES_PER_SEAT)
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 8
  }, [])

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories],
  )

  const [activeCategory, setActiveCategory] = useState<MenuCategoryId>('starters')
  const displayCategory = useMemo((): MenuCategoryId => {
    if (sortedCategories.some((c) => c.id === activeCategory)) return activeCategory
    return sortedCategories[0]?.id ?? 'starters'
  }, [sortedCategories, activeCategory])

  const [activeSeatIndex, setActiveSeatIndex] = useState(1)
  const [seats, setSeats] = useState<GuestSeat[]>(() =>
    reconcileSeats(reservation, initialCustomization),
  )
  const [notes, setNotes] = useState(initialCustomization?.notes ?? '')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [lastSaved, setLastSaved] = useState(() => ({
    seats: reconcileSeats(reservation, initialCustomization),
    notes: initialCustomization?.notes ?? '',
  }))
  const lastSavedRef = useRef(lastSaved)

  useEffect(() => {
    lastSavedRef.current = lastSaved
  }, [lastSaved])

  const [undoSnapshot, setUndoSnapshot] = useState<{ seats: GuestSeat[]; notes: string } | null>(
    null,
  )
  const [undoVisible, setUndoVisible] = useState(false)

  useEffect(() => {
    if (!undoVisible) return
    const t = window.setTimeout(() => {
      setUndoVisible(false)
      setUndoSnapshot(null)
    }, 12000)
    return () => window.clearTimeout(t)
  }, [undoVisible])

  const activeSeat = seats.find((s) => s.seatIndex === activeSeatIndex) ?? seats[0]

  const categoryItems = useMemo(
    () => menuItemsInCategory(displayCategory),
    [menuItemsInCategory, displayCategory],
  )

  const onSeatNameChange = useCallback((seatIndex: number, displayName: string) => {
    setSeats((prev) =>
      prev.map((s) => (s.seatIndex === seatIndex ? { ...s, displayName } : s)),
    )
    setSaveState('idle')
  }, [])

  const onToggleItem = useCallback(
    (seatIndex: number, menuItemId: string, selected: boolean) => {
      setSeats((prev) =>
        prev.map((s) => {
          if (s.seatIndex !== seatIndex) return s
          const set = new Set(s.selectedMenuItemIds)
          const already = set.has(menuItemId)
          if (selected) {
            if (!already && set.size >= maxPerSeat) return s
            set.add(menuItemId)
          } else {
            set.delete(menuItemId)
          }
          return { ...s, selectedMenuItemIds: [...set] }
        }),
      )
      setSaveState('idle')
    },
    [maxPerSeat],
  )

  const buildPayload = useCallback((): DiningCustomization => {
    return {
      reservationId: reservation.id,
      updatedAt: new Date().toISOString(),
      guestCount: reservation.guests,
      seats: cloneGuestSeats(seats),
      notes: notes.trim() || undefined,
    }
  }, [reservation.id, reservation.guests, seats, notes])

  const handleSave = () => {
    setSaveState('saving')
    setErrorMsg(null)
    const revertTarget = {
      seats: cloneGuestSeats(lastSavedRef.current.seats),
      notes: lastSavedRef.current.notes,
    }
    void (async () => {
      try {
        const payload = buildPayload()
        await saveCustomization(payload)
        void notifyDiningPreferenceSaved(reservation, payload)
        setLastSaved({ seats: cloneGuestSeats(seats), notes })
        setUndoSnapshot(revertTarget)
        setUndoVisible(true)
        setSaveState('saved')
      } catch {
        setSaveState('error')
        setErrorMsg('Could not save preferences. Please try again.')
      }
    })()
  }

  const handleUndo = () => {
    if (!undoSnapshot) return
    setUndoVisible(false)
    void (async () => {
      try {
        setSaveState('saving')
        const restored: DiningCustomization = {
          reservationId: reservation.id,
          updatedAt: new Date().toISOString(),
          guestCount: reservation.guests,
          seats: cloneGuestSeats(undoSnapshot.seats),
          notes: undoSnapshot.notes.trim() || undefined,
        }
        await saveCustomization(restored)
        void notifyDiningPreferenceSaved(reservation, restored)
        setSeats(reconcileSeats(reservation, restored))
        setNotes(undoSnapshot.notes)
        setLastSaved({
          seats: cloneGuestSeats(undoSnapshot.seats),
          notes: undoSnapshot.notes,
        })
        setUndoSnapshot(null)
        setSaveState('saved')
      } catch {
        setSaveState('error')
        setErrorMsg('Could not undo. Please try again.')
      }
    })()
  }

  const saveFooter = (
    <div className="space-y-2">
      {saveState === 'error' && errorMsg ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[14px] font-medium text-red-800" role="alert">
          {errorMsg}
        </p>
      ) : null}
      {saveState === 'saved' ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[14px] font-medium text-emerald-900" role="status">
          Preferences saved. You can update them again anytime from this link.
        </p>
      ) : null}
      {undoVisible && undoSnapshot ? (
        <button type="button" className={btnGhost} onClick={handleUndo}>
          Undo last save
        </button>
      ) : null}
      <button
        type="button"
        className={btnPrimary}
        onClick={handleSave}
        disabled={saveState === 'saving'}
      >
        {saveState === 'saving' ? 'Saving…' : 'Save dining preferences'}
      </button>
    </div>
  )

  if (menuLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div
          className="size-10 animate-spin rounded-full border-[3px] border-neutral-200 border-t-neutral-950"
          aria-hidden
        />
        <p className="text-[15px] font-medium text-neutral-700">Loading menu…</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_280px] md:items-start md:gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-12">
      <div className="flex min-w-0 flex-col gap-6">
        {menuError ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-[13px] font-medium text-amber-950">
            Menu fallback (offline): {menuError}
          </p>
        ) : null}

        <p className="sr-only" aria-live="polite">
          Menu catalog version {availabilityVersion}
        </p>

        {showBackLink && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-[14px] font-semibold text-neutral-700 underline-offset-2 press:text-neutral-950 press:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            ← Back
          </button>
        ) : null}

        <header className="space-y-1">
          <h1 className="text-[1.35rem] font-bold leading-tight text-neutral-950 sm:text-[1.5rem]">
            Customize your dining experience
          </h1>
          <p className="text-[15px] leading-relaxed text-neutral-600">
            Pre-select dishes by seat — optional, editable anytime from your reservation link.
          </p>
        </header>

        <SeatAssignmentList
          seats={seats}
          activeSeatIndex={activeSeatIndex}
          onSelectSeat={setActiveSeatIndex}
          onSeatNameChange={onSeatNameChange}
        />

        <MenuCategoryTabs
          categories={sortedCategories.map(({ id, label }) => ({ id, label }))}
          activeId={displayCategory}
          onChange={setActiveCategory}
        />

        {activeSeat ? (
          <SeatMenuPicker
            items={categoryItems}
            activeSeat={activeSeat}
            maxSelectablePerSeat={maxPerSeat}
            onToggleItem={onToggleItem}
          />
        ) : null}

        <div>
          <label htmlFor="dining-notes" className="text-[13px] font-semibold text-neutral-700">
            Notes for the restaurant{' '}
            <span className="font-normal text-neutral-500">(optional)</span>
          </label>
          <textarea
            id="dining-notes"
            rows={3}
            placeholder="Allergies, celebrations, pacing preferences…"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              setSaveState('idle')
            }}
            className={notesCls}
            maxLength={2000}
          />
        </div>

        <div className="hidden md:block">{saveFooter}</div>
      </div>

      <aside
        className="w-full md:sticky md:top-4 md:self-start"
        aria-label="Your selections summary"
      >
        <div className="md:max-h-[calc(100dvh-6rem)] md:overflow-y-auto md:overscroll-contain md:pr-1">
          <CustomizationSummary seats={seats} />
        </div>
      </aside>

      <div className="md:hidden">{saveFooter}</div>
    </div>
  )
}
