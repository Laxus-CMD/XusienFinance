type Item = { label: string; color: string; kind?: 'bar' | 'line' }

/** Legend for charts with two or more series. Always shown, so color is never the only cue. */
export function ChartLegend({ items }: { items: Item[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-mute">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span
            aria-hidden
            className={item.kind === 'line' ? 'h-0.5 w-3.5 rounded-full' : 'size-2.5 rounded-sm'}
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
