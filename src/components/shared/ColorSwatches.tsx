import { SWATCHES } from '@/utils/palette'
import { cn } from '@/utils/format'

type Props = {
  label?: string
  value: string
  onChange: (value: string) => void
}

export function ColorSwatches({ label = 'Color', value, onChange }: Props) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-[13px] font-medium text-mute">{label}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {SWATCHES.map((color) => (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={value === color}
            aria-label={color}
            onClick={() => onChange(color)}
            className={cn(
              'size-7 rounded-full ring-offset-2 ring-offset-surface transition-shadow',
              value === color ? 'ring-2 ring-ink' : 'hover:ring-2 hover:ring-line',
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </fieldset>
  )
}
