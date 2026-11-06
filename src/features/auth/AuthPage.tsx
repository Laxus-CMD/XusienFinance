import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { errorMessage } from '@/utils/format'

type Mode = 'sign-in' | 'sign-up'

export function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('sign-in')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const signingUp = mode === 'sign-up'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      if (signingUp) {
        const { needsConfirmation } = await signUp(email.trim(), password, fullName.trim())
        if (needsConfirmation) {
          setNotice('Check your email for a confirmation link. Then sign in.')
          setMode('sign-in')
        }
      } else {
        await signIn(email.trim(), password)
      }
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="size-10" />
          <span className="text-2xl font-bold tracking-tight">LaxFinance</span>
        </div>

        <h1 className="text-xl font-bold">{signingUp ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mt-1 text-sm text-mute">
          {signingUp
            ? 'Set up in a minute. Your data stays private to you.'
            : 'Sign in to see your accounts, bills and budgets.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {signingUp && (
            <Input
              label="Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              placeholder="Leo"
            />
          )}
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={signingUp ? 'new-password' : 'current-password'}
            hint={signingUp ? 'At least 6 characters.' : undefined}
          />

          {notice && (
            <p role="status" className="rounded-control bg-brand/10 px-3 py-2 text-sm text-brand">
              {notice}
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-control bg-bad/10 px-3 py-2 text-sm text-bad">
              {error}
            </p>
          )}

          <Button type="submit" loading={busy} className="w-full">
            {signingUp ? 'Create account' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-mute">
          {signingUp ? 'Already have an account?' : 'New to LaxFinance?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(signingUp ? 'sign-in' : 'sign-up')
              setError(null)
              setNotice(null)
            }}
            className="font-semibold text-brand hover:underline"
          >
            {signingUp ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </div>
  )
}
