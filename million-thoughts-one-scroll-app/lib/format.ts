export function formatThoughtId(n: number) {
  return `#${formatPadded(n)}`
}

export function formatPadded(n: number) {
  return Math.max(0, n)
    .toString()
    .padStart(6, '0')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatTimestamp(iso: string | Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(new Date(iso))
}
