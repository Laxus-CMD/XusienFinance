import {
  ArrowLeftRight,
  CalendarClock,
  ChartColumn,
  Gauge,
  LayoutDashboard,
  Settings,
  Tags,
  Target,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export type RouteKey =
  | 'dashboard'
  | 'accounts'
  | 'transactions'
  | 'bills'
  | 'categories'
  | 'budgets'
  | 'goals'
  | 'reports'
  | 'settings'

export const NAV_ITEMS: { key: RouteKey; label: string; icon: LucideIcon }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'accounts', label: 'Accounts', icon: Wallet },
  { key: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { key: 'bills', label: 'Bills', icon: CalendarClock },
  { key: 'budgets', label: 'Budgets', icon: Gauge },
  { key: 'goals', label: 'Goals', icon: Target },
  { key: 'categories', label: 'Categories', icon: Tags },
  { key: 'reports', label: 'Reports', icon: ChartColumn },
  { key: 'settings', label: 'Settings', icon: Settings },
]
