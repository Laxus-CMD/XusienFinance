import { Archive, ArchiveRestore, Banknote, Landmark, Pencil, Smartphone } from 'lucide-react'
import { IconButton } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useCurrency } from '@/hooks/useCurrency'
import type { Account, AccountType } from '@/types/account'
import { ACCOUNT_TYPE_LABELS } from '@/types/account'
import { cn } from '@/utils/format'

const ICONS = { cash: Banknote, bank: Landmark, ewallet: Smartphone } satisfies Record<AccountType, unknown>

type Props = {
  account: Account
  balance: number
  onEdit: () => void
  onToggleArchive: () => void
  busy?: boolean
}

export function AccountCard({ account, balance, onEdit, onToggleArchive, busy }: Props) {
  const { fmt } = useCurrency()
  const Icon = ICONS[account.type]

  return (
    <Card className={cn('flex flex-col gap-5', account.is_archived && 'opacity-60')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${account.color}26`, color: account.color }}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold">{account.name}</h3>
            <p className="text-[13px] text-mute">{ACCOUNT_TYPE_LABELS[account.type]}</p>
          </div>
        </div>
        <div className="-mr-1.5 -mt-1 flex shrink-0">
          <IconButton label={`Edit ${account.name}`} onClick={onEdit}>
            <Pencil className="size-4" />
          </IconButton>
          <IconButton
            label={account.is_archived ? `Restore ${account.name}` : `Archive ${account.name}`}
            onClick={onToggleArchive}
            disabled={busy}
          >
            {account.is_archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
          </IconButton>
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight tabular-nums">{fmt(balance)}</p>
    </Card>
  )
}
