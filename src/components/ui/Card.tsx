import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/format'

type CardProps = HTMLAttributes<HTMLDivElement> & { padded?: boolean }

export function Card({ padded = true, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn('rounded-card border border-line bg-surface', padded && 'p-5', className)}
      {...rest}
    >
      {children}
    </div>
  )
}

type CardHeaderProps = {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>
      <div>
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[13px] text-mute">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
