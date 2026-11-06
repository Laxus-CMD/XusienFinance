import type { ReactNode } from 'react'

type Props = {
  /** One line under the page title in the header. */
  description?: string
  /** Buttons shown at the top right of the page. */
  actions?: ReactNode
  children: ReactNode
}

export function PageContainer({ description, actions, children }: Props) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {(description || actions) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-sm text-mute">{description}</p>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="space-y-6">{children}</div>
    </div>
  )
}
