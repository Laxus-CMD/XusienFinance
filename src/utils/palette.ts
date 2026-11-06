/**
 * Chart and swatch colors. The eight categorical hues are used in this fixed order
 * and never cycled. They are validated for the dark surface.
 */
export const CATEGORICAL = [
  '#3987e5', // blue
  '#d95926', // orange
  '#199e70', // aqua
  '#c98500', // yellow
  '#d55181', // magenta
  '#008300', // green
  '#9085e9', // violet
  '#e66767', // red
] as const

export const NEUTRAL = '#6b7487'

/** Swatches offered in the color pickers. */
export const SWATCHES: string[] = [...CATEGORICAL, NEUTRAL]

export const CHART = {
  income: CATEGORICAL[0],
  expense: CATEGORICAL[1],
  net: '#e9ebf1',
  grid: '#252c3a',
  axis: '#6b7487',
  other: NEUTRAL,
} as const
