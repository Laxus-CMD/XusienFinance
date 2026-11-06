export const CURRENCIES = [
  { code: 'PHP', label: 'Philippine peso' },
  { code: 'USD', label: 'US dollar' },
  { code: 'EUR', label: 'Euro' },
  { code: 'GBP', label: 'British pound' },
  { code: 'JPY', label: 'Japanese yen' },
  { code: 'SGD', label: 'Singapore dollar' },
  { code: 'AUD', label: 'Australian dollar' },
  { code: 'CAD', label: 'Canadian dollar' },
  { code: 'KRW', label: 'South Korean won' },
  { code: 'INR', label: 'Indian rupee' },
] as const

export type FormatOptions = {
  /** 1,250,000 -> 1.3M. Good for chart axes and tight cards. */
  compact?: boolean
  /** Always show + or - for non-zero values. */
  sign?: boolean
}

const cache = new Map<string, Intl.NumberFormat>()

function formatterFor(currency: string, opts: FormatOptions): Intl.NumberFormat {
  const key = `${currency}|${opts.compact ? 'c' : 's'}|${opts.sign ? '+' : ''}`
  let fmt = cache.get(key)
  if (!fmt) {
    fmt = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: opts.compact ? 'compact' : 'standard',
      maximumFractionDigits: opts.compact ? 1 : undefined,
      signDisplay: opts.sign ? 'exceptZero' : 'auto',
    })
    cache.set(key, fmt)
  }
  return fmt
}

export function formatCurrency(amount: number, currency = 'PHP', opts: FormatOptions = {}): string {
  return formatterFor(currency, opts).format(amount)
}

/** Round to cents. Avoids 0.1 + 0.2 style drift. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** Parse user input like "1,250.50". Returns null when it is not a number. */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[^\d.-]/g, '')
  if (!cleaned) return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}
