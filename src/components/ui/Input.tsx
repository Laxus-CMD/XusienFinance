import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/format'

const CONTROL =
  'w-full rounded-control border border-line bg-raised px-3 text-sm text-ink placeholder:text-faint ' +
  'transition-colors hover:border-faint focus:border-brand focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-bad'

type FieldProps = {
  label?: string
  hint?: string
  error?: string | null
}

function Shell({ id, label, hint, error, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-mute">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-bad">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-faint">{hint}</p>
      )}
    </div>
  )
}

export function Input({
  label,
  hint,
  error,
  className,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & FieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <Shell id={fieldId} label={label} hint={hint} error={error}>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(CONTROL, 'h-10', className)}
        {...rest}
      />
    </Shell>
  )
}

export function Select({
  label,
  hint,
  error,
  className,
  id,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & FieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <Shell id={fieldId} label={label} hint={hint} error={error}>
      <select
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(CONTROL, 'h-10', className)}
        {...rest}
      >
        {children}
      </select>
    </Shell>
  )
}

export function Textarea({
  label,
  hint,
  error,
  className,
  id,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <Shell id={fieldId} label={label} hint={hint} error={error}>
      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(CONTROL, 'min-h-20 resize-y py-2', className)}
        {...rest}
      />
    </Shell>
  )
}
