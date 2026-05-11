import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  GlobeIcon,
  Link2Icon,
  MonitorIcon,
  PencilLineIcon,
  SaveIcon,
  UploadIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const STEP_ITEMS = [
  { label: 'Menu name', hint: 'Display label for staff and guests' },
  { label: 'Location', hint: 'Where this menu applies' },
  { label: 'Sales channels', hint: 'POS and online availability' },
  { label: 'Operating hours', hint: 'Days and times offered' },
  { label: 'Menu link or file', hint: 'Paste URLs or upload images / PDF' },
  { label: 'Notes', hint: 'Optional details for staff processing your menu' },
] as const

const STEP_LAST_INDEX = STEP_ITEMS.length - 1

const MENU_WIZARD_DRAFT_STORAGE_KEY = 'restaurant-menu-wizard-draft-v1'

const WEEKDAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const

type WeekdayKey = (typeof WEEKDAYS)[number]['key']

type DayHours = {
  enabled: boolean
  start: string
  end: string
}

function emptyDay(): DayHours {
  return { enabled: false, start: '09:00', end: '17:00' }
}

function isProbablyHttpUrl(value: string): boolean {
  const t = value.trim()
  if (!t) return false
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function menuSourcePillClass(active: boolean) {
  return cn(
    'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border px-4 text-[13px] font-semibold tracking-tight shadow-sm transition-[color,box-shadow,background-color,border-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] sm:px-5',
    active
      ? 'border-transparent bg-foreground text-background shadow-md hover:bg-foreground/90 hover:text-background'
      : 'border-border bg-background text-foreground hover:bg-muted/40',
  )
}

function isWizardStepChromeClick(target: EventTarget | null): boolean {
  const el = target instanceof HTMLElement ? target : null
  if (!el) return false
  if (el.closest('[data-wizard-step-fields]')) return false
  if (el.closest('button, a, input, textarea, select, option, [contenteditable="true"]')) return false
  return true
}

const customizationInputClass = 'h-10 bg-background'
/** ShadCN file control: `Input type="file"` with styled `::file-selector-button` + Field wiring */
const menuFileInputClassName = cn(
  'h-auto min-h-10 w-auto max-w-full cursor-pointer bg-background py-2 ps-2 text-[13px] text-muted-foreground shadow-xs',
  'file:inline-flex file:h-9 file:cursor-pointer file:items-center file:rounded-full file:border file:border-border file:bg-background file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-foreground file:shadow-sm',
  'file:transition-colors hover:file:bg-muted/40',
)
const wizardNavPrimaryButtonClass = 'h-9 min-w-[7.5rem] shrink-0 rounded-lg px-4'
const wizardNavBackButtonClass = 'h-9 min-w-[6.25rem] shrink-0 rounded-lg px-4'

function WizardStepNavGroup({
  onBack,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
}: {
  onBack: () => void
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={wizardNavBackButtonClass}
        onClick={onBack}
        aria-label="Previous step"
      >
        Back
      </Button>
      <Button
        type="button"
        variant="default"
        size="sm"
        className={wizardNavPrimaryButtonClass}
        disabled={primaryDisabled}
        onClick={onPrimary}
      >
        {primaryLabel}
      </Button>
    </div>
  )
}

function VerticalDeliveryProgress({
  current,
  furthestVisited,
  className,
  activeStepContent,
  onStepSelect,
}: {
  current: number
  furthestVisited: number
  className?: string
  activeStepContent?: ReactNode
  onStepSelect?: (stepIndex: number) => void
}) {
  /** Same grid on header + tail so the vertical rail stays centered under circles */
  const stepperRailGridClass =
    'grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-x-3 px-2 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-x-4 sm:px-2.5'

  return (
    <nav
      aria-label="Setup progress"
      className={cn(
        'px-4 py-5 sm:px-5 sm:py-6',
        className,
      )}
    >
      <ol className="m-0 list-none space-y-0 p-0">
        {STEP_ITEMS.map((item, i) => {
          const active = i === current
          const completed = !active && i <= furthestVisited
          const isLast = i === STEP_ITEMS.length - 1
          const canJump = Boolean(onStepSelect && i <= furthestVisited)

          return (
            <li
              key={item.label}
              className={cn('flex flex-col gap-0', !isLast && 'pb-2 sm:pb-3')}
              onClick={(e) => {
                if (!canJump || !onStepSelect || !isWizardStepChromeClick(e.target)) return
                onStepSelect(i)
              }}
            >
              <div
                className={cn(
                  stepperRailGridClass,
                  'rounded-lg py-1 outline-none transition-colors duration-150 sm:py-1.5',
                  canJump &&
                    'cursor-pointer hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
                tabIndex={canJump ? 0 : undefined}
                aria-current={active ? 'step' : undefined}
                aria-label={
                  canJump && !active
                    ? `Go to ${item.label}, step ${i + 1} of ${STEP_ITEMS.length}`
                    : undefined
                }
                onKeyDown={(e) => {
                  if (!canJump || !onStepSelect || e.target !== e.currentTarget) return
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  e.preventDefault()
                  onStepSelect(i)
                }}
              >
                <div className="flex w-full justify-center">
                  <div
                    className={cn(
                      'relative z-[1] flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors sm:size-10 sm:text-sm',
                      completed && 'border-primary bg-primary text-primary-foreground',
                      active && 'border-primary bg-background text-primary',
                      !completed && !active && 'border-muted-foreground/35 bg-background text-muted-foreground',
                    )}
                  >
                    {completed ? (
                      <CheckIcon className="size-4 stroke-[2.5] sm:size-[18px]" aria-hidden />
                    ) : active ? (
                      <span className="relative flex size-2.5 items-center justify-center">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/40 motion-reduce:hidden" />
                        <span className="relative size-2 rounded-full bg-primary" />
                      </span>
                    ) : (
                      <span aria-hidden>{i + 1}</span>
                    )}
                  </div>
                </div>

                <div className="min-w-0 pt-0">
                  <p
                    className={cn(
                      'font-semibold leading-snug text-foreground',
                      active && 'text-[15px]',
                      !active && !completed && 'text-muted-foreground',
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{item.hint}</p>
                </div>
              </div>

              {!isLast ? (
                <div className={cn(stepperRailGridClass, 'items-stretch')}>
                  <div className="flex h-full min-h-0 w-full flex-col items-center">
                    <div
                      aria-hidden
                      className={cn(
                        'mt-1 w-px min-h-[18px] flex-1 rounded-full sm:min-h-6',
                        i < furthestVisited ? 'bg-primary' : 'bg-muted-foreground/40',
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    {active && activeStepContent ? (
                      <div className="mt-3 min-w-0" data-wizard-step-fields>
                        {activeStepContent}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : active && activeStepContent ? (
                <div className={stepperRailGridClass}>
                  <div className="w-full shrink-0" aria-hidden />
                  <div className="min-w-0">
                    <div className="mt-3 min-w-0" data-wizard-step-fields>
                      {activeStepContent}
                    </div>
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

type RestaurantMenuUploadWizardProps = {
  onExit: () => void
  /** Called when the user completes the final step (Finish). */
  onFinish?: () => void
  /** Hub entry path — adjusts defaults on menu-link step. */
  entryIntent?: 'categories' | 'upload' | 'import' | 'scratch'
}

export function RestaurantMenuUploadWizard({
  onExit,
  onFinish,
  entryIntent,
}: RestaurantMenuUploadWizardProps) {
  const [step, setStep] = useState(0)
  const [furthestVisited, setFurthestVisited] = useState(0)
  const [menuName, setMenuName] = useState('')
  const [channels, setChannels] = useState({ pos: true, online: true })
  const [hours, setHours] = useState<Record<WeekdayKey, DayHours>>(() =>
    Object.fromEntries(WEEKDAYS.map(({ key }) => [key, emptyDay()])) as Record<WeekdayKey, DayHours>,
  )
  const [menuSourceMode, setMenuSourceMode] = useState<'url' | 'upload'>('url')
  const [menuUrl, setMenuUrl] = useState('')
  const [menuUploadFile, setMenuUploadFile] = useState<File | null>(null)
  const [menuNotes, setMenuNotes] = useState('')
  const [draftSavedFeedback, setDraftSavedFeedback] = useState(false)
  const draftFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSaveDraft = useCallback(() => {
    try {
      window.localStorage.setItem(
        MENU_WIZARD_DRAFT_STORAGE_KEY,
        JSON.stringify({
          version: 1,
          savedAt: Date.now(),
          step,
          furthestVisited,
          menuName,
          channels,
          hours,
          menuSourceMode,
          menuUrl,
          menuNotes,
          uploadFileName: menuUploadFile?.name ?? null,
        }),
      )
    } catch {
      /* quota / private mode */
    }
    setDraftSavedFeedback(true)
    if (draftFlashTimerRef.current) clearTimeout(draftFlashTimerRef.current)
    draftFlashTimerRef.current = setTimeout(() => {
      setDraftSavedFeedback(false)
      draftFlashTimerRef.current = null
    }, 2200)
  }, [
    step,
    furthestVisited,
    menuName,
    channels,
    hours,
    menuSourceMode,
    menuUrl,
    menuNotes,
    menuUploadFile,
  ])

  useEffect(() => {
    return () => {
      if (draftFlashTimerRef.current) clearTimeout(draftFlashTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (entryIntent === 'upload') setMenuSourceMode('upload')
    else if (entryIntent === 'import' || entryIntent === 'categories') setMenuSourceMode('url')
  }, [entryIntent])

  useEffect(() => {
    setFurthestVisited((f) => Math.max(f, step))
  }, [step])

  const enabledDayCount = useMemo(
    () => WEEKDAYS.filter(({ key }) => hours[key].enabled).length,
    [hours],
  )
  const masterDayChecked = enabledDayCount === WEEKDAYS.length
  const masterDayIndeterminate = enabledDayCount > 0 && enabledDayCount < WEEKDAYS.length

  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return menuName.trim().length > 0
      case 3:
        return WEEKDAYS.some(({ key }) => hours[key].enabled)
      case 4:
        if (menuSourceMode === 'url') return isProbablyHttpUrl(menuUrl)
        return menuUploadFile !== null
      default:
        return true
    }
  }, [step, menuName, menuUrl, hours, menuSourceMode, menuUploadFile])

  function goNext() {
    if (!canContinue) return
    if (step < furthestVisited) {
      setStep(furthestVisited)
      return
    }
    if (step < STEP_LAST_INDEX) setStep((s) => s + 1)
  }

  function goToPreviousStep() {
    setStep((s) => (s > 0 ? s - 1 : s))
  }

  function toggleDay(key: WeekdayKey, enabled: boolean) {
    setHours((h) => ({ ...h, [key]: { ...h[key], enabled } }))
  }

  function setDayTimes(key: WeekdayKey, field: 'start' | 'end', value: string) {
    setHours((h) => ({ ...h, [key]: { ...h[key], [field]: value } }))
  }

  function toggleAllDays(enabled: boolean) {
    setHours((h) =>
      Object.fromEntries(
        WEEKDAYS.map(({ key }) => [key, { ...h[key], enabled }]),
      ) as Record<WeekdayKey, DayHours>,
    )
  }

  function duplicateDayToAll(source: WeekdayKey) {
    setHours((h) => {
      const row = h[source]
      return Object.fromEntries(WEEKDAYS.map(({ key }) => [key, { ...row }])) as Record<
        WeekdayKey,
        DayHours
      >
    })
  }

  const activeStepContent: ReactNode = (() => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <Input
              id="menu-name"
              aria-label="Menu name"
              placeholder="e.g. Lunch menu, Weekend specials"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              autoComplete="off"
              className={customizationInputClass}
            />
            <Button
              type="button"
              variant="default"
              size="sm"
              className={wizardNavPrimaryButtonClass}
              disabled={!canContinue}
              onClick={goNext}
            >
              Next
            </Button>
          </div>
        )
      case 1:
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-background px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Primary location
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 gap-1.5 rounded-lg px-3 font-semibold"
                  disabled
                  title="Location editing connects to your venue profile in a later release."
                  aria-label="Edit location (coming soon)"
                >
                  <PencilLineIcon className="size-3.5" aria-hidden />
                  Edit
                </Button>
              </div>
              <p className="mt-2 font-heading text-base font-semibold text-foreground">Main restaurant</p>
              <p className="mt-1 text-sm text-muted-foreground">
                123 Demo Street, London — applies to this menu.
              </p>
            </div>
            <WizardStepNavGroup onBack={goToPreviousStep} primaryLabel="Next" onPrimary={goNext} />
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-background px-4 py-4 sm:px-5">
              <ul className="flex flex-col gap-4">
                <li className="flex items-center gap-3">
                  <Checkbox
                    id="channel-pos"
                    checked={channels.pos}
                    onCheckedChange={(v) => setChannels((c) => ({ ...c, pos: v === true }))}
                    className="size-4"
                  />
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted"
                    aria-hidden
                  >
                    <MonitorIcon className="size-[1.125rem] text-foreground" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <Label htmlFor="channel-pos" className="cursor-pointer text-[15px] font-semibold">
                      Points of sale
                    </Label>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Checkbox
                    id="channel-online"
                    checked={channels.online}
                    onCheckedChange={(v) => setChannels((c) => ({ ...c, online: v === true }))}
                    className="size-4"
                  />
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted"
                    aria-hidden
                  >
                    <GlobeIcon className="size-[1.125rem] text-foreground" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <Label htmlFor="channel-online" className="cursor-pointer text-[15px] font-semibold">
                      Online ordering
                    </Label>
                  </div>
                </li>
              </ul>
            </div>
            <WizardStepNavGroup
              onBack={goToPreviousStep}
              primaryLabel="Next"
              onPrimary={goNext}
              primaryDisabled={!channels.pos && !channels.online}
            />
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div className="min-w-0 max-w-full overflow-x-auto">
              <table className="w-full min-w-[520px] table-fixed border-collapse text-left text-sm">
                  <colgroup>
                    <col className="w-14" />
                    <col className="w-14" />
                    <col className="w-[8.5rem]" />
                    <col />
                    <col />
                  </colgroup>
                  <thead>
                    <tr className="[&_th]:py-2.5 [&_th]:align-middle">
                      <th className="pr-2 align-middle" aria-hidden />
                      <th className="pr-2 align-middle">
                        <span className="inline-flex size-4 shrink-0 align-middle">
                          <Checkbox
                            checked={
                              masterDayChecked ? true : masterDayIndeterminate ? 'indeterminate' : false
                            }
                            onCheckedChange={(v) => toggleAllDays(v === true)}
                            aria-label="Select all days"
                            className="size-4"
                          />
                        </span>
                      </th>
                      <th className="pr-4 align-middle font-semibold text-foreground">Days</th>
                      <th className="pr-4 align-middle font-semibold text-foreground">Start time</th>
                      <th className="pr-1 align-middle font-semibold text-foreground">End time</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr]:align-middle [&_td]:py-3">
                  {WEEKDAYS.map(({ key, label }) => {
                    const row = hours[key]
                    return (
                      <tr key={key}>
                        <td className="pr-2 align-middle">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label={`Copy ${label} hours to all days`}
                            onClick={() => duplicateDayToAll(key)}
                          >
                            <CopyIcon className="size-4" strokeWidth={1.75} aria-hidden />
                          </Button>
                        </td>
                        <td className="pr-2 align-middle">
                          <span className="inline-flex size-4 shrink-0 align-middle">
                            <Checkbox
                              checked={row.enabled}
                              onCheckedChange={(v) => toggleDay(key, v === true)}
                              aria-label={`${label} open`}
                              className="size-4"
                            />
                          </span>
                        </td>
                        <td className="pr-4 align-middle font-medium text-foreground">{label}</td>
                        <td className="pr-3 align-middle">
                          <div className="relative min-w-0">
                            {row.enabled ? (
                              <>
                                <Input
                                  type="time"
                                  value={row.start}
                                  onChange={(e) => setDayTimes(key, 'start', e.target.value)}
                                  className={cn(
                                    customizationInputClass,
                                    'pr-9 tabular-nums [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full',
                                  )}
                                />
                                <ClockIcon
                                  className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                                  strokeWidth={1.75}
                                  aria-hidden
                                />
                              </>
                            ) : (
                              <Input
                                disabled
                                placeholder="Closed"
                                value=""
                                className={cn(customizationInputClass, 'text-muted-foreground')}
                              />
                            )}
                          </div>
                        </td>
                        <td className="pr-1 align-middle">
                          <div className="relative min-w-0">
                            {row.enabled ? (
                              <>
                                <Input
                                  type="time"
                                  value={row.end}
                                  onChange={(e) => setDayTimes(key, 'end', e.target.value)}
                                  className={cn(
                                    customizationInputClass,
                                    'pr-9 tabular-nums [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full',
                                  )}
                                />
                                <ClockIcon
                                  className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                                  strokeWidth={1.75}
                                  aria-hidden
                                />
                              </>
                            ) : (
                              <Input
                                disabled
                                placeholder="Closed"
                                value=""
                                className={cn(customizationInputClass, 'text-muted-foreground')}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  </tbody>
              </table>
            </div>
            <WizardStepNavGroup
              onBack={goToPreviousStep}
              primaryLabel="Next"
              onPrimary={goNext}
              primaryDisabled={!canContinue}
            />
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Menu source">
              <button
                type="button"
                className={menuSourcePillClass(menuSourceMode === 'url')}
                aria-pressed={menuSourceMode === 'url'}
                onClick={() => setMenuSourceMode('url')}
              >
                <Link2Icon className="size-4 shrink-0" aria-hidden />
                URL link
              </button>
              <button
                type="button"
                className={menuSourcePillClass(menuSourceMode === 'upload')}
                aria-pressed={menuSourceMode === 'upload'}
                onClick={() => setMenuSourceMode('upload')}
              >
                <UploadIcon className="size-4 shrink-0" aria-hidden />
                Upload PDF / image
              </button>
            </div>

            {menuSourceMode === 'url' ? (
              <Input
                id="menu-url"
                aria-label="Menu URL"
                placeholder="https://example.com/menu.pdf"
                value={menuUrl}
                onChange={(e) => setMenuUrl(e.target.value)}
                autoComplete="off"
                className={customizationInputClass}
              />
            ) : (
              <Field
                orientation="horizontal"
                className="flex-wrap items-center gap-x-3 gap-y-2"
              >
                <FieldLabel htmlFor="menu-upload-wizard" className="sr-only">
                  Upload menu PDF or image
                </FieldLabel>
                <FieldContent className="flex min-w-0 flex-row flex-wrap items-center gap-x-3 gap-y-2">
                  <Input
                    id="menu-upload-wizard"
                    type="file"
                    accept=".pdf,application/pdf,image/*"
                    onChange={(e) => setMenuUploadFile(e.target.files?.[0] ?? null)}
                    className={menuFileInputClassName}
                  />
                  {!menuUploadFile ? (
                    <FieldDescription className="m-0 shrink-0 text-[13px] text-muted-foreground">
                      PDF or image (PNG, JPG, WebP)
                    </FieldDescription>
                  ) : null}
                </FieldContent>
              </Field>
            )}

            <WizardStepNavGroup
              onBack={goToPreviousStep}
              primaryLabel="Next"
              onPrimary={goNext}
              primaryDisabled={!canContinue}
            />
          </div>
        )
      case 5:
        return (
          <div className="space-y-4">
            <Textarea
              id="menu-notes"
              aria-label="Notes for staff"
              placeholder="Allergen callouts, POS quirks, translation needs…"
              value={menuNotes}
              onChange={(e) => setMenuNotes(e.target.value)}
              rows={4}
              className="min-h-[120px] resize-y rounded-lg bg-background"
            />
            <WizardStepNavGroup
              onBack={goToPreviousStep}
              primaryLabel="Finish"
              onPrimary={() => (onFinish ?? onExit)()}
            />
          </div>
        )
      default:
        return null
    }
  })()

  const setStepStable = useCallback((i: number) => setStep(i), [])

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 pb-12 pt-1 md:gap-8 md:pb-16 md:pt-2">
      <div className="flex w-full shrink-0 items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="default"
          className="-ml-2 h-9 w-fit shrink-0 gap-1.5 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
          onClick={onExit}
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          Back
        </Button>
        <div className="flex min-w-0 flex-1 justify-end items-center gap-2 sm:gap-3">
          <span
            className={cn(
              'truncate text-sm text-muted-foreground transition-opacity duration-150',
              draftSavedFeedback ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            role="status"
            aria-live="polite"
          >
            Draft saved
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-2 rounded-lg px-3 font-semibold"
            onClick={handleSaveDraft}
          >
            <SaveIcon className="size-4" aria-hidden />
            Save to draft
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <VerticalDeliveryProgress
          current={step}
          furthestVisited={furthestVisited}
          activeStepContent={activeStepContent}
          onStepSelect={setStepStable}
          className="min-w-0 w-full max-w-3xl shrink-0 lg:sticky lg:top-6"
        />
      </div>
    </div>
  )
}
