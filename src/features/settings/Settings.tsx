import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { cn } from '@/utils/format'
import { DataSettings } from './DataSettings'
import { ProfileSettings } from './ProfileSettings'

type Tab = 'profile' | 'data'

const TABS: { key: Tab; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'data', label: 'Data' },
]

export function Settings() {
  const [tab, setTab] = useState<Tab>('profile')

  return (
    <PageContainer description="Your profile, currency and data.">
      <div role="tablist" aria-label="Settings sections" className="flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`panel-${t.key}`}
            onClick={() => setTab(t.key)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
              tab === t.key ? 'border-brand text-ink' : 'border-transparent text-mute hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'profile' ? <ProfileSettings /> : <DataSettings />}
      </div>
    </PageContainer>
  )
}
