import type { ReactNode } from 'react'
import {
  ArrowLeftRightIcon,
  FileTextIcon,
  LayoutGridIcon,
  PlusIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type MenuHubChoice = 'categories' | 'upload' | 'import' | 'scratch'

type RestaurantMenuHubProps = {
  onChoose: (choice: MenuHubChoice) => void
}

function CategoriesIcon({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex size-6 text-foreground', className)} aria-hidden>
      <LayoutGridIcon className="size-6" strokeWidth={1.75} />
      <PlusIcon
        className="absolute -bottom-px -right-px size-3 rounded-[3px] bg-muted p-px ring-2 ring-muted"
        strokeWidth={3}
      />
    </span>
  )
}

export function RestaurantMenuHub({ onChoose }: RestaurantMenuHubProps) {
  const rows: {
    id: MenuHubChoice
    title: string
    description: string
    icon: ReactNode
    recommended?: boolean
  }[] = [
    {
      id: 'upload',
      title: 'Upload a file or photo of your existing menu',
      description: "We'll guide you through turning it into structured menu items.",
      icon: <FileTextIcon className="size-6" strokeWidth={1.75} aria-hidden />,
      recommended: true,
    },
    {
      id: 'import',
      title: 'Import your menu from another platform',
      description: 'Import from other platforms, such as another POS or delivery service.',
      icon: <ArrowLeftRightIcon className="size-6" strokeWidth={1.75} aria-hidden />,
    },
    {
      id: 'categories',
      title: 'Use your existing categories',
      description: "Select categories you'd like to add to your menu.",
      icon: <CategoriesIcon />,
    },
    {
      id: 'scratch',
      title: 'Start from scratch',
      description: 'Add and organise items as you build a menu.',
      icon: <PlusIcon className="size-6" strokeWidth={1.75} aria-hidden />,
    },
  ]

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-xl flex-col gap-8 pb-12 pt-1 md:max-w-2xl md:gap-10 md:pb-16 md:pt-2">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[26px]">
          How would you like to start?
        </h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
          Create menus to display and organise food and beverages on your Point of Sale for multiple locations.
        </p>
      </header>

      <ul className="m-0 flex list-none flex-col gap-2.5 p-0 sm:gap-3">
        {rows.map(({ id, title, description, icon, recommended }) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onChoose(id)}
              className={cn(
                'flex w-full items-start gap-3 rounded-2xl border border-border bg-background px-3 py-3.5 text-left shadow-none ring-0 transition-colors sm:gap-4 sm:px-4 sm:py-4',
                'hover:border-foreground hover:bg-muted/35',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted sm:size-12">
                {icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-col items-start gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <span className="min-w-0 text-pretty text-[15px] font-semibold leading-snug text-foreground">
                    {title}
                  </span>
                  {recommended ? (
                    <Badge
                      variant="outline"
                      className="h-6 w-fit shrink-0 rounded-full border-blue-200 bg-blue-50 px-2.5 text-[11px] font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/80 dark:text-blue-300 sm:mt-0.5"
                    >
                      Recommended
                    </Badge>
                  ) : null}
                </span>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground sm:mt-2">
                  {description}
                </p>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
