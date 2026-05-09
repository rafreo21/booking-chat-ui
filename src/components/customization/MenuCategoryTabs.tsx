import type { MenuCategoryId } from '../../types/bookingCustomization'

type Props = {
  categories: { id: MenuCategoryId; label: string }[]
  activeId: MenuCategoryId
  onChange: (id: MenuCategoryId) => void
}

const tab =
  'shrink-0 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-[colors,box-shadow,border-color,transform] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1'

export function MenuCategoryTabs({ categories, activeId, onChange }: Props) {
  return (
    <div className="min-w-0">
      <h3 className="text-[15px] font-bold text-neutral-950">Menu</h3>
      <div
        className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Course category"
      >
        {categories.map((c) => {
          const on = c.id === activeId
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={on}
              className={
                tab +
                (on
                  ? ' border-neutral-950 bg-neutral-950 text-white shadow-sm press:bg-neutral-800 active:scale-[0.98]'
                  : ' border-neutral-200 bg-white text-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.06)] press:border-neutral-400 press:bg-neutral-200 active:scale-[0.98]')
              }
              onClick={() => onChange(c.id)}
            >
              {c.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
