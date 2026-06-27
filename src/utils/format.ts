export function formatDate(value: unknown): string {
  if (!value) return '-'
  const d = new Date(value as string)
  return isNaN(d.getTime()) ? '-' : d.toLocaleString()
}

export function formatOnlyDate(value: unknown): string {
  if (!value) return ''
  const [y, m, d] = (value as string).split('-')
  return `${d}/${m}/${y}`
}

export function displayStatValue(value: number, type: string, prefix: string = '+'): string {
  if (type === 'percent') return `${prefix}${+(value * 100).toFixed(2)}%`
  return `${prefix}${value.toLocaleString()}`
}
