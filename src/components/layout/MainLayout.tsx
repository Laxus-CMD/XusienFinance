import { useState } from 'react'
import type { ReactNode } from 'react'
import { Header } from './Header'
import type { RouteKey } from './nav'
import { Sidebar } from './Sidebar'

type Props = {
  route: RouteKey
  children: ReactNode
}

export function MainLayout({ route, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-dvh">
      {/* A button, not a #main link, because the hash is used for routing. */}
      <button
        type="button"
        onClick={() => document.getElementById('main')?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-control focus:bg-brand focus:px-3 focus:py-2 focus:text-brand-ink"
      >
        Skip to content
      </button>
      <Sidebar route={route} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-60">
        <Header route={route} onMenu={() => setMenuOpen(true)} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}
