import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/format'

type Props = {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-card border border-dashed border-line px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-raised text-mute">
        <Icon className="size-5" aria-hidden />
      </div>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-mute">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
