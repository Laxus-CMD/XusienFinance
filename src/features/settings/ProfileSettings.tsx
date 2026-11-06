import { useState } from 'react'
import type { FormEvent } from 'react'
import { LoadingState } from '@/components/shared/StateViews'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { CURRENCIES } from '@/utils/currency'
import { errorMessage } from '@/utils/format'

export function ProfileSettings() {
  const { user, profile } = useAuth()
  // The form mounts only once the profile is loaded, so its fields start with real values.
  if (!profile) return <LoadingState label="Loading profile" />
  return <ProfileForm key={profile.id} email={user?.email ?? ''} initialName={profile.full_name ?? ''} initialCurrency={profile.currency} />
}

function ProfileForm({ email, initialName, initialCurrency }: { email: string; initialName: string; initialCurrency: string }) {
  const { updateProfile, signOut } = useAuth()
  const [name, setName] = useState(initialName)
  const [currency, setCurrency] = useState(initialCurrency)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage(null)
    try {
      await updateProfile({ full_name: name.trim() || null, currency })
      setMessage({ tone: 'ok', text: 'Saved.' })
    } catch (e) {
      setMessage({ tone: 'error', text: errorMessage(e) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader title="Profile" subtitle="Your name and the currency used across the app." />
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" value={email} disabled readOnly />
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        <Select
          label="Currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          hint="Changes how amounts are shown. Existing amounts are not converted."
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}, {c.label}
            </option>
          ))}
        </Select>

        {message && (
          <p role={message.tone === 'error' ? 'alert' : 'status'} className={message.tone === 'error' ? 'text-sm text-bad' : 'text-sm text-mute'}>
            {message.text}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={() => void signOut()}>
            Sign out
          </Button>
          <Button type="submit" loading={busy}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  )
}
