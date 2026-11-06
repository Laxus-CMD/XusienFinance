import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/format'
import { IconButton } from './Button'

type Size = 'sm' | 'md' | 'lg'

const SIZES: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

type Props = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  size?: Size
  children: ReactNode
}

/**
 * Built on the native <dialog>. The browser handles focus trapping, Escape and the backdrop.
 * Children only mount while open, so forms reset every time the modal opens.
 */
export function Modal({ open, onClose, title, description, size = 'md', children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className={cn(
        'm-auto w-[calc(100%-2rem)] rounded-card border border-line bg-surface p-0 text-ink',
        'backdrop:bg-black/60 backdrop:backdrop-blur-[2px] open:animate-[pop-in_.16s_ease-out]',
        SIZES[size],
      )}
    >
      {open && (
        <div className="flex max-h-[88dvh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">{title}</h2>
              {description && <p className="mt-0.5 text-sm text-mute">{description}</p>}
            </div>
            <IconButton label="Close" onClick={onClose} className="-mr-1.5 -mt-1">
              <X className="size-4" />
            </IconButton>
          </div>
          <div className="overflow-y-auto px-5 py-5">{children}</div>
        </div>
      )}
    </dialog>
  )
}
