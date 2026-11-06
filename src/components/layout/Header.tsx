import { Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { initials } from '@/utils/format'
import { NAV_ITEMS, type RouteKey } from './nav'
import { NotificationMenu } from './NotificationMenu'

type Props = {
  route: RouteKey
  onMenu: () => void
}

export function Header({ route, onMenu }: Props) {
  const { user, profile } = useAuth()
  const title = NAV_ITEMS.find((item) => item.key === route)?.label ?? 'LaxFinance'
  const name = profile?.full_name || user?.email

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="flex size-9 items-center justify-center rounded-control text-mute hover:bg-raised hover:text-ink lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      <h1 className="text-lg font-bold tracking-tight">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <NotificationMenu route={route} />
        <div
          className="flex size-9 items-center justify-center rounded-full bg-raised text-[13px] font-bold text-mute"
          title={name ?? undefined}
          aria-hidden
        >
          {initials(name)}
        </div>
      </div>
    </header>
  )
}
