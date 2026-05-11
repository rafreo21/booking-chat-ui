import { useEffect } from 'react'
import { Loader2Icon } from 'lucide-react'

type MenuSyncingLoadingProps = {
  onComplete: () => void
}

/**
 * Placeholder full-screen sync — swap for real menu ingestion / API polling later.
 */
export function MenuSyncingLoading({ onComplete }: MenuSyncingLoadingProps) {
  useEffect(() => {
    const id = window.setTimeout(onComplete, 2600)
    return () => window.clearTimeout(id)
  }, [onComplete])

  return (
    <div className="flex min-h-[min(70vh,560px)] flex-col items-center justify-center gap-5 px-6 py-16">
      <Loader2Icon className="size-12 animate-spin text-muted-foreground" aria-hidden />
      <div className="max-w-md text-center">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          Syncing your menu
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground md:text-base">
          We&apos;re gathering information about your menu. This usually only takes a moment.
        </p>
      </div>
      <p className="sr-only" role="status">
        Loading
      </p>
    </div>
  )
}
