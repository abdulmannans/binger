export const DISCOVER_FILTERS = [
  { slug: 'mcu', label: 'MCU', hint: 'Marvel Studios' },
  { slug: 'dc', label: 'DC', hint: 'DC Comics movies' },
  { slug: 'animated', label: 'Animated', hint: 'Feature animation' },
  { slug: 'dc-animated', label: 'DC Animated', hint: 'DCU originals & more' },
] as const

export type DiscoverFilterSlug = typeof DISCOVER_FILTERS[number]['slug']

export function isDiscoverFilter(value: unknown): value is DiscoverFilterSlug {
  return DISCOVER_FILTERS.some(filter => filter.slug === value)
}
