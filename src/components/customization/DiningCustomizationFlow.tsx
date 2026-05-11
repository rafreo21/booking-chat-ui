import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDownIcon, CheckCircle2Icon, EyeIcon, ExternalLinkIcon, Loader2Icon } from 'lucide-react'
import { Collapsible } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import type { SavedBooking } from '../../storage'
import { saveCustomization } from '../../storage'
import { notifyDiningPreferenceSaved } from '../../lib/diningPreferenceIngest'
import { reservationManagePath } from '../../lib/reservationUrls'
import { reconcileGuestSeats } from '../../lib/reconcileGuestSeats'
import {
  filterItemsByAllergens,
  parseAllergenFilterIds,
  type AllergenFilterId,
} from '../../menu/allergenFilters'
import { useMenuCatalog } from '../../menu/useMenuCatalog'
import type { DiningCustomization, GuestSeat, MenuCategoryId, MenuId } from '../../types/bookingCustomization'
import { CustomizationSummary } from './CustomizationSummary'
import { MenuCategoryTabs } from './MenuCategoryTabs'
import { SeatAssignmentList } from './SeatAssignmentList'
import { SeatMenuPicker } from './SeatMenuPicker'

function cloneGuestSeats(seats: GuestSeat[]): GuestSeat[] {
  return seats.map((s) => ({
    ...s,
    selectedMenuItemIds: [...s.selectedMenuItemIds],
    avoidAllergens:
      s.avoidAllergens?.length && s.avoidAllergens.length > 0 ? [...s.avoidAllergens] : undefined,
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
  const navigate = useNavigate()
  const {
    loading: menuLoading,
    error: menuError,
    menus,
    items: catalogItems,
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

  const activeMenuMeta = useMemo(
    () => sortedMenus.find((m) => m.id === displayMenuId),
    [sortedMenus, displayMenuId],
  )

  const sortedCategories = useMemo(
    () => (displayMenuId ? categoriesInMenu(displayMenuId) : []),
    [categoriesInMenu, displayMenuId],
  )

  const [activeCategory, setActiveCategory] = useState<MenuCategoryId>('')
  const [menuSearchQuery, setMenuSearchQuery] = useState('')
  const displayCategory = useMemo((): MenuCategoryId => {
    if (sortedCategories.some((c) => c.id === activeCategory)) return activeCategory
    return sortedCategories[0]?.id ?? ''
  }, [sortedCategories, activeCategory])

  const onMenuChange = useCallback((id: MenuId) => {
    setActiveMenuId(id)
    setActiveCategory('')
    setMenuSearchQuery('')
  }, [])

  const [activeSeatIndex, setActiveSeatIndex] = useState(1)
  const [seats, setSeats] = useState<GuestSeat[]>(() =>
    reconcileGuestSeats(reservation, initialCustomization),
  )
  const [notes, setNotes] = useState(initialCustomization?.notes ?? '')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const previewAfterSaveRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (saveState !== 'saved') return
    queueMicrotask(() => previewAfterSaveRef.current?.focus())
  }, [saveState])

  const saveFlowOverlayOpen = saveState === 'saving' || saveState === 'saved'

  useEffect(() => {
    if (!saveFlowOverlayOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [saveFlowOverlayOpen])

  const activeSeat = seats.find((s) => s.seatIndex === activeSeatIndex) ?? seats[0]

  const activeSeatAllergenIds = useMemo(
    () => parseAllergenFilterIds(activeSeat?.avoidAllergens),
    [activeSeat?.avoidAllergens],
  )

  const categoryItems = useMemo(
    () => menuItemsInCategory(displayCategory),
    [menuItemsInCategory, displayCategory],
  )

  const categoryIdsInActiveMenu = useMemo(
    () => new Set(sortedCategories.map((c) => c.id)),
    [sortedCategories],
  )

  const pickerItems = useMemo(() => {
    const q = menuSearchQuery.trim().toLowerCase()
    const searched =
      q.length === 0
        ? categoryItems
        : catalogItems.filter((item) => {
            if (!categoryIdsInActiveMenu.has(item.categoryId)) return false
            const blob = [item.name, item.description ?? '', ...(item.dietaryTags ?? [])]
              .join(' ')
              .toLowerCase()
            return blob.includes(q)
          })
    return filterItemsByAllergens(searched, activeSeatAllergenIds)
  }, [
    menuSearchQuery,
    categoryItems,
    catalogItems,
    categoryIdsInActiveMenu,
    activeSeatAllergenIds,
  ])

  const toggleSeatAllergen = useCallback((id: AllergenFilterId) => {
    setSeats((prev) =>
      prev.map((s) => {
        if (s.seatIndex !== activeSeatIndex) return s
        const cur = parseAllergenFilterIds(s.avoidAllergens)
        const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
        return {
          ...s,
          avoidAllergens: next.length > 0 ? next : undefined,
        }
      }),
    )
    setSaveState('idle')
  }, [activeSeatIndex])

  const clearSeatAllergens = useCallback(() => {
    setSeats((prev) =>
      prev.map((s) =>
        s.seatIndex === activeSeatIndex ? { ...s, avoidAllergens: undefined } : s,
      ),
    )
    setSaveState('idle')
  }, [activeSeatIndex])

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
    void (async () => {
      try {
        const payload = buildPayload()
        await saveCustomization(payload)
        void notifyDiningPreferenceSaved(reservation, payload)
        setSaveState('saved')
      } catch {
        setSaveState('error')
        setErrorMsg('Could not save preferences. Please try again.')
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
      {saveFlowOverlayOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-[2px] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby={saveState === 'saving' ? 'dining-save-loading-title' : 'dining-save-success-title'}
          aria-busy={saveState === 'saving'}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg ring-1 ring-foreground/5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200">
            {saveState === 'saving' ? (
              <div className="flex flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                  <Loader2Icon className="size-9 animate-spin text-primary" aria-hidden />
                </div>
                <h2 id="dining-save-loading-title" className="mt-6 text-xl font-bold tracking-tight text-foreground">
                  Saving your preferences
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  Please wait — we’re securely storing your dining choices for this reservation.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15 dark:bg-emerald-400/15">
                  <CheckCircle2Icon
                    className="size-10 text-emerald-600 dark:text-emerald-400"
                    aria-hidden
                  />
                </div>
                <h2 id="dining-save-success-title" className="mt-6 text-xl font-bold tracking-tight text-foreground">
                  Saved successfully
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  Your dining experience preferences are saved for this booking.
                </p>
                <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
                  {reservation.email.trim() ? (
                    <>
                      Your confirmation email to{' '}
                      <span className="break-all font-semibold text-foreground">
                        {reservation.email.trim()}
                      </span>{' '}
                      includes a link to open this page again and update your choices.
                    </>
                  ) : (
                    <>
                      Your confirmation email includes a link to open this page again and update your choices.
                    </>
                  )}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                  Review everything on one screen, or keep editing your picks below.
                </p>
                <div className="mt-8 flex w-full flex-col gap-3">
                  <Button
                    ref={previewAfterSaveRef}
                    type="button"
                    size="lg"
                    className="h-12 w-full gap-2 text-[15px] font-semibold"
                    onClick={() => {
                      navigate(reservationManagePath(reservation.manageToken))
                    }}
                  >
                    <EyeIcon className="size-4" aria-hidden />
                    Preview experience
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-12 w-full text-[15px] font-semibold"
                    onClick={() => setSaveState('idle')}
                  >
                    Edit dining experience
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

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

        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[26px]">
            Customize your dining experience
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
            Pre-select dishes by seat — optional, editable anytime from your reservation link.
          </p>
        </header>

        <SeatAssignmentList
          seats={seats}
          activeSeatIndex={activeSeatIndex}
          onSelectSeat={setActiveSeatIndex}
          onSeatNameChange={onSeatNameChange}
          activeSeatAllergenIds={activeSeatAllergenIds}
          onAllergenToggle={toggleSeatAllergen}
          onAllergenClearAll={clearSeatAllergens}
        />

        <MenuCategoryTabs
          menus={sortedMenus}
          activeMenuId={displayMenuId}
          onMenuChange={onMenuChange}
          categories={sortedCategories.map(({ id, label }) => ({ id, label }))}
          activeId={displayCategory}
          onChange={setActiveCategory}
          searchQuery={menuSearchQuery}
          onSearchQueryChange={setMenuSearchQuery}
        />

        {activeSeat ? (
          <SeatMenuPicker
            items={pickerItems}
            activeSeat={activeSeat}
            maxSelectablePerSeat={maxPerSeat}
            onToggleItem={onToggleItem}
            menuPdfUrl={activeMenuMeta?.pdfUrl}
            menuTitle={activeMenuMeta?.label}
            searchActive={Boolean(menuSearchQuery.trim())}
            allergyFilterActive={activeSeatAllergenIds.length > 0}
          />
        ) : null}

        {activeMenuMeta?.pdfUrl ? (
          <Collapsible.Root
            key={`official-pdf-${displayMenuId}`}
            defaultOpen={false}
            className="group rounded-xl border border-border bg-muted/35 dark:bg-muted/25"
          >
            <Collapsible.Trigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl">
              <span className="min-w-0 text-[13px] font-semibold text-foreground">
                Official menu (PDF)
              </span>
              <ChevronDownIcon
                className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                aria-hidden
              />
            </Collapsible.Trigger>
            <Collapsible.Content className="border-t border-border/60 px-4 pb-3 pt-3 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
              <p className="text-[12px] leading-snug text-muted-foreground">
                {displayMenuId === 'a-la-carte'
                  ? 'Full pricing and options in the PDF — interactive picks above match à la carte sections.'
                  : 'Browse this menu in the PDF, then describe choices in Notes or pick from À la carte if applicable.'}
              </p>
              <Button variant="secondary" size="sm" className="mt-3 gap-2" asChild>
                <a href={activeMenuMeta.pdfUrl} target="_blank" rel="noopener noreferrer">
                  Open {activeMenuMeta.label}
                  <ExternalLinkIcon className="size-4 opacity-80" aria-hidden />
                </a>
              </Button>
            </Collapsible.Content>
          </Collapsible.Root>
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
