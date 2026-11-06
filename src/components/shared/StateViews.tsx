import { CircleAlert, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/format'

export function LoadingState({ label = 'Loading', className }: { label?: string; className?: string }) {
  return (
    <div
      role="status"
      className={cn('flex items-center justify-center gap-2.5 py-16 text-sm text-mute', className)}
    >
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      {label}
    </div>
  )
}

type ErrorProps = { message: string; onRetry?: () => void; className?: string }

export function ErrorNotice({ message, onRetry, className }: ErrorProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-card border border-bad/30 bg-bad/10 p-4 text-sm text-bad',
        className,
      )}
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p className="flex-1">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
