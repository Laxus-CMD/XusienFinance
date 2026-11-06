import { Bell, CircleAlert, TriangleAlert, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { cn } from '@/utils/format'
import type { RouteKey } from './nav'

/** Bell with a list of bill reminders and budget alerts. */
export function NotificationMenu({ route }: { route: RouteKey }) {
  const { alerts, dismiss } = useNotifications(route)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={alerts.length ? `Notifications, ${alerts.length} new` : 'Notifications'}
        aria-expanded={open}
        className="relative flex size-9 items-center justify-center rounded-control text-mute transition-colors hover:bg-raised hover:text-ink"
      >
        <Bell className="size-[18px]" />
        {alerts.length > 0 && (
          <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-4 text-brand-ink">
            {alerts.length > 9 ? '9+' : alerts.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] origin-top-right animate-[pop-in_.14s_ease-out] overflow-hidden rounded-card border border-line bg-surface shadow-xl">
          <div className="border-b border-line px-4 py-3 text-sm font-semibold">Notifications</div>
          {alerts.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-mute">You are all caught up.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-line overflow-y-auto">
              {alerts.map((alert) => {
                const Icon = alert.severity === 'bad' ? CircleAlert : TriangleAlert
                return (
                  <li key={alert.id} className="flex items-start gap-3 px-4 py-3">
                    <Icon
                      className={cn('mt-0.5 size-4 shrink-0', alert.severity === 'bad' ? 'text-bad' : 'text-warn')}
                      aria-hidden
                    />
                    <a href={`#/${alert.target}`} onClick={() => setOpen(false)} className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{alert.title}</p>
                      <p className="mt-0.5 text-[13px] text-mute">{alert.detail}</p>
                    </a>
                    <button
                      type="button"
                      onClick={() => dismiss(alert.id)}
                      aria-label={`Dismiss: ${alert.title}`}
                      className="flex size-6 shrink-0 items-center justify-center rounded text-faint hover:text-ink"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
