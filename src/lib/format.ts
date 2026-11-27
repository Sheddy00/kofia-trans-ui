const integer = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const decimal = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })

export const formatAriary = (value: number) => `${integer.format(value)} Ar`

export function formatCompactAriary(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${decimal.format(value / 1_000_000)} M Ar`
  if (Math.abs(value) >= 1_000) return `${decimal.format(value / 1_000)} k Ar`
  return formatAriary(value)
}

export const formatKm = (value: number) => `${integer.format(value)} km`

export const formatNumber = (value: number) => integer.format(value)

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}
