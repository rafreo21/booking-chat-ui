import type { Menu, MenuCategoryId, MenuId } from '../../types/bookingCustomization'

type Props = {
  menus: Menu[]
  activeMenuId: MenuId
  onMenuChange: (id: MenuId) => void
  categories: { id: MenuCategoryId; label: string }[]
  activeId: MenuCategoryId
  onChange: (id: MenuCategoryId) => void
}

const tab =
  'shrink-0 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-[colors,box-shadow,border-color,transform] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1'

const selectCls =
  "mt-2 w-full max-w-xs appearance-none rounded-xl border-2 border-neutral-200 bg-white bg-[length:14px_14px] bg-[right_0.85rem_center] bg-no-repeat px-3 py-2.5 pr-9 text-[14px] font-semibold text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors duration-200 ease-out press:border-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-4 focus:ring-neutral-950/10 [background-image:url(\"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2714%27%20height%3D%2714%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%23404040%27%20stroke-width%3D%272.5%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%2F%3E%3C%2Fsvg%3E\")]"

export function MenuCategoryTabs({
  menus,
  activeMenuId,
  onMenuChange,
  categories,
  activeId,
  onChange,
}: Props) {
  const showMenuPicker = menus.length > 1
  return (
    <div className="min-w-0">
      <h3 className="text-[15px] font-bold text-neutral-950">Menu</h3>
      {showMenuPicker ? (
        <label className="mt-1 block">
          <span className="sr-only">Choose a menu</span>
          <select
            className={selectCls}
            value={activeMenuId}
            onChange={(e) => onMenuChange(e.target.value)}
          >
            {menus.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div
        className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
