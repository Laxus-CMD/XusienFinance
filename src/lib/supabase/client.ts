import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** False until both values exist in .env. The app shows a setup screen when false. */
export const isSupabaseConfigured = Boolean(url && anonKey)

// createClient throws on empty values, so fall back to harmless placeholders.
export const supabase = createClient<Database>(
  url || 'http://localhost:54321',
  anonKey || 'missing-anon-key',
)

/** Return the data from a Supabase response or throw its error as a normal Error. */
export function unwrap<T>(response: { data: T | null; error: { message: string } | null }): T {
  if (response.error) throw new Error(response.error.message)
  return response.data as T
}
