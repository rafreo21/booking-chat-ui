import type { RefObject } from 'react'
import type { SavedBooking } from '../storage'

function formatDay(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function BookingsLog({
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
  fileInputRef: RefObject<HTMLInputElement | null>
  onClose: () => void
  onDelete: (id: string) => void
  onClear: () => void
  onExport: () => void
  onPickImportFile: (mode: 'merge' | 'replace') => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 pb-[env(safe-area-inset-bottom)] sm:items-center sm:p-3 sm:pb-4"
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
      <div className="relative max-h-[min(88dvh,calc(100dvh-env(safe-area-inset-bottom)-0.5rem))] w-full max-w-[min(28rem,calc(100vw-1rem))] overflow-hidden rounded-t-xl border border-neutral-200 bg-white shadow-xl sm:max-h-[85dvh] sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2 sm:px-4 sm:py-2.5">
          <h2
            id="bookings-log-title"
            className="text-sm font-semibold text-neutral-900 sm:text-base"
          >
            Saved bookings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 sm:text-sm"
          >
            Close
          </button>
        </div>
        <p className="border-b border-neutral-200 px-3 py-1.5 text-[11px] leading-snug text-neutral-500 sm:px-4 sm:py-2 sm:text-xs">
          Stored in this browser (localStorage). Export JSON and commit{' '}
          <code className="rounded bg-neutral-100 px-1 text-[11px] text-neutral-800">
            public/bookings.json
          </code>{' '}
          to back up on GitHub; redeploy so new visitors can hydrate from that file.
        </p>
        <div className="max-h-[min(42dvh,50vh)] overflow-y-auto px-2 py-1.5 sm:max-h-[40dvh] sm:py-2">
          {bookings.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-neutral-500 sm:py-6 sm:text-sm">
              No bookings yet. Complete a chat booking to save one here.
            </p>
          ) : (
            <ul className="space-y-1.5 sm:space-y-2">
              {bookings.map((b) => (
                <li
                  key={b.id}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900">{b.service}</p>
                      <p className="text-neutral-600">
                        {b.guests > 0 ? `${b.guests} guests · ` : ''}
                        {b.dateIso
                          ? `${formatDay(new Date(b.dateIso))} · ${b.time}`
                          : b.time}
                      </p>
                      <p className="truncate text-neutral-500">
                        {b.name}
                        {b.email ? ` · ${b.email}` : ''}
                        {b.phone ? ` · ${b.phone}` : ''}
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
        <div className="space-y-1.5 border-t border-neutral-200 bg-neutral-50/80 px-3 py-2 sm:space-y-2 sm:px-4 sm:py-3">
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
              className="rounded-lg bg-[#303030] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#252525] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              Download JSON
            </button>
            <button
              type="button"
              onClick={() => onPickImportFile('merge')}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            >
              Import file (merge)
            </button>
            <button
              type="button"
              onClick={() => onPickImportFile('replace')}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            >
              Replace from file
            </button>
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-800 transition hover:bg-red-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Clear all
            </button>
          </div>
          {importMsg && (
            <p className="text-xs text-neutral-600" role="status">
              {importMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
