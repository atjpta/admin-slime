export function formatDate(value: unknown): string {
  if (!value) return '-'
  const d = new Date(value as string)
  return isNaN(d.getTime()) ? '-' : d.toLocaleString()
}
