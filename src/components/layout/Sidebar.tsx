import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/format'
import { NAV_ITEMS, type RouteKey } from './nav'

type Props = {
  route: RouteKey
  /** Mobile drawer state. On large screens the sidebar is always visible. */
  open: boolean
  onClose: () => void
}

export function Sidebar({ route, open, onClose }: Props) {
  const { user, profile, signOut } = useAuth()

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/55 lg:hidden" onClick={onClose} aria-hidden />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-line bg-surface',
          'transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Main navigation"
      >
        <a href="#/dashboard" onClick={onClose} className="flex items-center gap-2.5 px-5 py-5">
          <img src="/favicon.svg" alt="" className="size-8" />
          <span className="text-[17px] font-bold tracking-tight">LaxFinance</span>
        </a>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
              const active = key === route
              return (
                <li key={key}>
                  <a
                    href={`#/${key}`}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors',
                      active ? 'bg-raised text-ink' : 'text-mute hover:bg-raised/60 hover:text-ink',
                    )}
                  >
                    <Icon className={cn('size-[18px]', active && 'text-brand')} aria-hidden />
                    {label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3 border-t border-line px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{profile?.full_name || 'Your account'}</p>
            <p className="truncate text-xs text-faint">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            aria-label="Sign out"
            title="Sign out"
            className="flex size-8 shrink-0 items-center justify-center rounded-control text-mute transition-colors hover:bg-raised hover:text-ink"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>
    </>
  )
}
