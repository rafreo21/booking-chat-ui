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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 pb-[env(safe-area-inset-bottom)] sm:items-center sm:p-4"
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
      <div className="relative flex max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-bottom)))] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-neutral-300 bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3.5">
          <h2
            id="bookings-log-title"
            className="text-lg font-bold tracking-tight text-neutral-950"
          >
            Saved bookings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-[14px] font-semibold text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
          >
            Close
          </button>
        </div>
        <p className="shrink-0 border-b border-neutral-200 bg-neutral-50 px-4 py-2.5 text-[13px] leading-relaxed text-neutral-700">
          Stored in this browser (localStorage). Export JSON and commit{' '}
          <code className="rounded-md bg-neutral-200/80 px-1.5 py-0.5 text-[12px] font-medium text-neutral-900">
            public/bookings.json
          </code>{' '}
          to back up on GitHub; redeploy so new visitors can hydrate from that file.
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {bookings.length === 0 ? (
            <p className="px-2 py-8 text-center text-[15px] leading-relaxed text-neutral-600">
              No bookings yet. Complete a chat booking to save one here.
            </p>
          ) : (
            <ul className="space-y-2">
              {bookings.map((b) => (
                <li
                  key={b.id}
                  className="rounded-xl border-2 border-neutral-200 bg-neutral-50 px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-[15px] font-bold text-neutral-950">{b.service}</p>
                      <p className="text-[14px] font-medium text-neutral-700">
                        {b.guests > 0 ? `${b.guests} guests · ` : ''}
                        {b.dateIso
                          ? `${formatDay(new Date(b.dateIso))} · ${b.time}`
                          : b.time}
                      </p>
                      <p className="truncate text-[13px] text-neutral-600">
                        {b.name}
                        {b.email ? ` · ${b.email}` : ''}
                        {b.phone ? ` · ${b.phone}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDelete(b.id)}
                      className="shrink-0 text-[13px] font-semibold text-red-700 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="shrink-0 space-y-2 border-t border-neutral-200 bg-neutral-100/90 px-4 py-3">
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
              className="min-h-[44px] rounded-xl bg-neutral-950 px-4 text-[14px] font-semibold text-white transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
            >
              Download JSON
            </button>
            <button
              type="button"
              onClick={() => onPickImportFile('merge')}
              className="min-h-[44px] rounded-xl border-2 border-neutral-300 bg-white px-4 text-[14px] font-semibold text-neutral-950 transition hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            >
              Import (merge)
            </button>
            <button
              type="button"
              onClick={() => onPickImportFile('replace')}
              className="min-h-[44px] rounded-xl border-2 border-neutral-300 bg-white px-4 text-[14px] font-semibold text-neutral-950 transition hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            >
              Replace from file
            </button>
            <button
              type="button"
              onClick={onClear}
              className="min-h-[44px] rounded-xl border-2 border-red-200 bg-white px-4 text-[14px] font-semibold text-red-800 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Clear all
            </button>
          </div>
          {importMsg && (
            <p className="text-[13px] font-medium text-neutral-700" role="status">
              {importMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
