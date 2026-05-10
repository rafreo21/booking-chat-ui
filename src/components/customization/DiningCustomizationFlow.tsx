import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Loader2Icon, RotateCcwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import type { SavedBooking } from '../../storage'
import { saveCustomization } from '../../storage'
import { notifyDiningPreferenceSaved } from '../../lib/diningPreferenceIngest'
import { useMenuCatalog } from '../../menu/useMenuCatalog'
import type { DiningCustomization, GuestSeat, MenuCategoryId, MenuId } from '../../types/bookingCustomization'
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
    menus,
    categoriesInMenu,
    menuItemsInCategory,
    availabilityVersion,
  } = useMenuCatalog()

  const maxPerSeat = useMemo(() => {
    const n = Number(import.meta.env.VITE_MAX_DISHES_PER_SEAT)
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 8
  }, [])

  const sortedMenus = useMemo(() => [...menus].sort((a, b) => a.order - b.order), [menus])

  const [activeMenuId, setActiveMenuId] = useState<MenuId>('')
  const displayMenuId = useMemo((): MenuId => {
    if (sortedMenus.some((m) => m.id === activeMenuId)) return activeMenuId
    return sortedMenus[0]?.id ?? ''
  }, [sortedMenus, activeMenuId])

  const sortedCategories = useMemo(
    () => (displayMenuId ? categoriesInMenu(displayMenuId) : []),
    [categoriesInMenu, displayMenuId],
  )

  const [activeCategory, setActiveCategory] = useState<MenuCategoryId>('')
  const displayCategory = useMemo((): MenuCategoryId => {
    if (sortedCategories.some((c) => c.id === activeCategory)) return activeCategory
    return sortedCategories[0]?.id ?? ''
  }, [sortedCategories, activeCategory])

  const onMenuChange = useCallback((id: MenuId) => {
    setActiveMenuId(id)
    setActiveCategory('')
  }, [])

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
        <p
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
          role="alert"
        >
          {errorMsg}
        </p>
      ) : null}
      {saveState === 'saved' ? (
        <p
          className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200"
          role="status"
        >
          Preferences saved. You can update them again anytime from this link.
        </p>
      ) : null}
      {undoVisible && undoSnapshot ? (
        <Button type="button" variant="outline" size="lg" className="h-11 w-full" onClick={handleUndo}>
          <RotateCcwIcon />
          Undo last save
        </Button>
      ) : null}
      <Button
        type="button"
        size="lg"
        className="h-12 w-full text-[15px] font-semibold"
        onClick={handleSave}
        disabled={saveState === 'saving'}
      >
        {saveState === 'saving' ? (
          <>
            <Loader2Icon className="animate-spin" />
            Saving…
          </>
        ) : (
          'Save dining preferences'
        )}
      </Button>
    </div>
  )

  if (menuLoading) {
    return (
      <div className="space-y-6 py-2">
        <div className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full max-w-xs" />
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-24" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
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
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto self-start p-0 text-sm font-semibold"
            onClick={onBack}
          >
            ← Back
          </Button>
        ) : null}

        <header className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight sm:text-[1.5rem]">
            Customize your dining experience
          </h1>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
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
          menus={sortedMenus}
          activeMenuId={displayMenuId}
          onMenuChange={onMenuChange}
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

        <div className="grid gap-1.5">
          <Label htmlFor="dining-notes" className="text-[13px] font-semibold">
            Notes for the restaurant{' '}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="dining-notes"
            rows={3}
            placeholder="Allergies, celebrations, pacing preferences…"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              setSaveState('idle')
            }}
            maxLength={2000}
            className="min-h-24 resize-y"
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
