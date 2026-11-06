import { clamp, cn } from '@/utils/format'

type Tone = 'brand' | 'good' | 'warn' | 'serious' | 'bad'

const TONES: Record<Tone, string> = {
  brand: 'bg-brand',
  good: 'bg-good',
  warn: 'bg-warn',
  serious: 'bg-serious',
  bad: 'bg-bad',
}

type Props = {
  /** 0 to 100. Values above 100 fill the bar. */
  percent: number
  label: string
  tone?: Tone
  /** Hex color. Wins over `tone`. */
  color?: string
  className?: string
}

export function ProgressBar({ percent, label, tone = 'brand', color, className }: Props) {
  const width = clamp(percent, 0, 100)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-raised', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', !color && TONES[tone])}
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  )
}
