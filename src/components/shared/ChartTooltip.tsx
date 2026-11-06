type Entry = {
  name?: string | number
  value?: number | string | readonly (number | string)[]
  color?: string
  fill?: string
  stroke?: string
}

type Props = {
  active?: boolean
  payload?: readonly Entry[]
  label?: string | number
  /** How to print each value. */
  format: (value: number) => string
  /** Heading override. Defaults to the axis label. */
  title?: string
}

/** Dark tooltip card for Recharts. Pass as <Tooltip content={<ChartTooltip format={fmt} />} />. */
export function ChartTooltip({ active, payload, label, format, title }: Props) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-36 rounded-control border border-line bg-raised px-3 py-2.5 text-[13px] shadow-lg">
      {(title ?? label) !== undefined && <p className="mb-1.5 font-semibold text-ink">{title ?? label}</p>}
      <ul className="space-y-1">
        {payload.map((entry, i) => (
          <li key={`${entry.name}-${i}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-mute">
              <span
                className="size-2.5 rounded-sm"
                style={{ backgroundColor: entry.color ?? entry.fill ?? entry.stroke }}
                aria-hidden
              />
              {entry.name}
            </span>
            <span className="font-semibold tabular-nums text-ink">{format(Number(entry.value))}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
