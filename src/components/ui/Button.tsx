import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/format'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-brand-ink hover:bg-brand/90',
  secondary: 'border border-line bg-raised text-ink hover:border-faint',
  ghost: 'text-mute hover:bg-raised hover:text-ink',
  danger: 'bg-bad/15 text-bad hover:bg-bad/25',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 gap-1.5 px-3 text-[13px]',
  md: 'h-10 gap-2 px-4 text-sm',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-control font-semibold transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
}

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & {
  label: string
  danger?: boolean
  children: ReactNode
}

/** Square icon-only button. The label is read by screen readers and shown as a tooltip. */
export function IconButton({ label, danger = false, className, children, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-control text-mute transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        danger ? 'hover:bg-bad/15 hover:text-bad' : 'hover:bg-raised hover:text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
