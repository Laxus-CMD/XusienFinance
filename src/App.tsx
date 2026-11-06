import { Suspense, lazy, useEffect } from 'react'
import type { ComponentType } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import type { RouteKey } from '@/components/layout/nav'
import { LoadingState } from '@/components/shared/StateViews'
import { AuthPage } from '@/features/auth/AuthPage'
import { AuthContext, useAuth, useAuthState } from '@/hooks/useAuth'
import { useRoute } from '@/hooks/useRoute'
import { isSupabaseConfigured } from '@/lib/supabase/client'

// Each page loads on first visit, so charts do not slow down the sign-in screen.
const PAGES: Record<RouteKey, ComponentType> = {
  dashboard: lazy(() => import('@/features/dashboard/Dashboard').then((m) => ({ default: m.Dashboard }))),
  accounts: lazy(() => import('@/features/accounts/Accounts').then((m) => ({ default: m.Accounts }))),
  transactions: lazy(() => import('@/features/transactions/Transactions').then((m) => ({ default: m.Transactions }))),
  bills: lazy(() => import('@/features/bills/Bills').then((m) => ({ default: m.Bills }))),
  categories: lazy(() => import('@/features/categories/Categories').then((m) => ({ default: m.Categories }))),
  budgets: lazy(() => import('@/features/budgets/Budgets').then((m) => ({ default: m.Budgets }))),
  goals: lazy(() => import('@/features/goals/Goals').then((m) => ({ default: m.Goals }))),
  reports: lazy(() => import('@/features/reports/Reports').then((m) => ({ default: m.Reports }))),
  settings: lazy(() => import('@/features/settings/Settings').then((m) => ({ default: m.Settings }))),
}

function SetupNotice() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-card border border-line bg-surface p-7">
        <h1 className="text-xl font-bold">Connect Supabase to get started</h1>
        <p className="mt-2 text-sm text-mute">
          LaxFinance stores your data in your own Supabase project. It takes about five minutes.
        </p>
        <ol className="mt-5 list-decimal space-y-2.5 pl-5 text-sm text-mute marker:text-faint">
          <li>
            Create a project at <span className="font-semibold text-ink">supabase.com</span>.
          </li>
          <li>
            Open the SQL editor and run <code className="rounded bg-raised px-1.5 py-0.5 text-ink">docs/schema.sql</code>.
          </li>
          <li>
            Copy <code className="rounded bg-raised px-1.5 py-0.5 text-ink">.env.example</code> to{' '}
            <code className="rounded bg-raised px-1.5 py-0.5 text-ink">.env</code> and paste your project URL and anon key.
          </li>
          <li>Restart the dev server.</li>
        </ol>
      </div>
    </div>
  )
}

function Shell() {
  const { session, loading } = useAuth()
  const [route] = useRoute()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])

  if (!isSupabaseConfigured) return <SetupNotice />
  if (loading) return <LoadingState className="min-h-dvh" />
  if (!session) return <AuthPage />

  const Page = PAGES[route]
  return (
    <MainLayout route={route}>
      <Suspense fallback={<LoadingState />}>
        <Page key={route} />
      </Suspense>
    </MainLayout>
  )
}

export default function App() {
  const auth = useAuthState()
  return (
    <AuthContext.Provider value={auth}>
      <Shell />
    </AuthContext.Provider>
  )
}
