import { useCallback, useEffect, useEffectEvent, useState } from 'react'
import { errorMessage } from '@/utils/format'

type State<T> = { key: string | null; data: T | undefined; error: string | null }

/**
 * Small data loader. Loads on mount and whenever `key` changes.
 * `reload()` refetches in the background and keeps the old data on screen meanwhile.
 */
export function useResource<T>(fetcher: () => Promise<T>, key = 'default') {
  const [state, setState] = useState<State<T>>({ key: null, data: undefined, error: null })
  const [tick, setTick] = useState(0)
  const run = useEffectEvent(fetcher)

  useEffect(() => {
    let cancelled = false
    run().then(
      (data) => {
        if (!cancelled) setState({ key, data, error: null })
      },
      (error: unknown) => {
        if (!cancelled) {
          setState((prev) => ({
            key,
            data: prev.key === key ? prev.data : undefined,
            error: errorMessage(error),
          }))
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [key, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  const current = state.key === key

  return {
    data: current ? state.data : undefined,
    error: current ? state.error : null,
    loading: !current,
    reload,
  }
}
