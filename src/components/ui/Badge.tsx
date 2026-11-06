import type { ReactNode } from 'react'
import { cn } from '@/utils/format'

export type BadgeTone = 'neutral' | 'brand' | 'good' | 'warn' | 'serious' | 'bad'

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-raised text-mute',
  brand: 'bg-brand/15 text-brand',
  good: 'bg-good/15 text-good',
  warn: 'bg-warn/15 text-warn',
  serious: 'bg-serious/15 text-serious',
  bad: 'bg-bad/15 text-bad',
}

type Props = { tone?: BadgeTone; children: ReactNode; className?: string }

export function Badge({ tone = 'neutral', children, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
