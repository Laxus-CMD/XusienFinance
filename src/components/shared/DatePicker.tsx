import { Input } from '@/components/ui/Input'

type Props = {
  label?: string
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  required?: boolean
  error?: string | null
  className?: string
}

/** Native date input styled to match. Values are "YYYY-MM-DD". */
export function DatePicker({ label, value, onChange, min, max, required, error, className }: Props) {
  return (
    <Input
      type="date"
      label={label}
      value={value}
      min={min}
      max={max}
      required={required}
      error={error}
      className={className}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
