import { useCallback, useSyncExternalStore } from 'react'
import { NAV_ITEMS, type RouteKey } from '@/components/layout/nav'

const KNOWN = new Set<string>(NAV_ITEMS.map((item) => item.key))

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

const getHash = () => window.location.hash

/** Tiny hash router. "#/bills" shows the Bills page. Unknown hashes fall back to the dashboard. */
export function useRoute(): [RouteKey, (route: RouteKey) => void] {
  const hash = useSyncExternalStore(subscribe, getHash, () => '')
  const segment = hash.replace(/^#\/?/, '').split('/')[0]
  const route = (KNOWN.has(segment) ? segment : 'dashboard') as RouteKey
  const navigate = useCallback((next: RouteKey) => {
    window.location.hash = `/${next}`
  }, [])
  return [route, navigate]
}
