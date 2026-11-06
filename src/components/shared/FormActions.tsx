import { Button } from '@/components/ui/Button'

type Props = {
  submitLabel: string
  busy?: boolean
  error?: string | null
  onCancel: () => void
}

/** Error line plus Cancel and Save buttons. Goes at the bottom of every form. */
export function FormActions({ submitLabel, busy = false, error, onCancel }: Props) {
  return (
    <div className="pt-2">
      {error && (
        <p role="alert" className="mb-3 rounded-control bg-bad/10 px-3 py-2 text-sm text-bad">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
