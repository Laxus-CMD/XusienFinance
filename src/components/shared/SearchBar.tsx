import { Search, X } from 'lucide-react'
import { cn } from '@/utils/format'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search', className }: Props) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-control border border-line bg-raised pl-9 pr-9 text-sm text-ink placeholder:text-faint transition-colors hover:border-faint focus:border-brand focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-faint hover:text-ink"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
