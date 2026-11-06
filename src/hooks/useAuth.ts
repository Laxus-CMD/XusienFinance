import type { Session, User } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase, unwrap } from '@/lib/supabase/client'
import type { ProfileRow } from '@/lib/supabase/database.types'

export type ProfilePatch = { full_name?: string | null; currency?: string }

export type AuthState = {
  session: Session | null
  user: User | null
  profile: ProfileRow | null
  /** True until the first session check finishes. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<{ needsConfirmation: boolean }>
  signOut: () => Promise<void>
  updateProfile: (patch: ProfilePatch) => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

/** Read the signed-in user. Must be used under the provider in App.tsx. */
export function useAuth(): AuthState {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside the auth provider')
  return value
}

/** Owns the Supabase session. Called once, by the provider in App.tsx. */
export function useAuthState(): AuthState {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [loadedProfile, setLoadedProfile] = useState<ProfileRow | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const userId = session?.user.id

  useEffect(() => {
    if (!userId) return
    let active = true
    void (async () => {
      const existing = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      if (existing.data) {
        if (active) setLoadedProfile(existing.data)
        return
      }
      // No profile yet (account made before the schema trigger existed). Create one.
      const created = await supabase.from('profiles').insert({ id: userId }).select().maybeSingle()
      if (active && created.data) setLoadedProfile(created.data)
    })()
    return () => {
      active = false
    }
  }, [userId])

  const profile = loadedProfile && loadedProfile.id === userId ? loadedProfile : null

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw new Error(error.message)
    return { needsConfirmation: !data.session }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
    setLoadedProfile(null)
  }, [])

  const updateProfile = useCallback(
    async (patch: ProfilePatch) => {
      if (!userId) return
      const updated = unwrap(await supabase.from('profiles').update(patch).eq('id', userId).select().single())
      setLoadedProfile(updated)
    },
    [userId],
  )

  return useMemo(
    () => ({ session, user: session?.user ?? null, profile, loading, signIn, signUp, signOut, updateProfile }),
    [session, profile, loading, signIn, signUp, signOut, updateProfile],
  )
}
