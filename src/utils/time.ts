export function toDbTime(timeStr: string): string | null {
  if (!timeStr) return null
  const [time, mod] = timeStr.split(' ')
  let [h, m] = time.split(':').map(Number)
  if (mod === 'PM' && h !== 12) h += 12
  if (mod === 'AM' && h === 12) h = 0
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

export function toDisplayTime(time: string): string {
  if (!time) return ''
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${m} ${ampm}`
}

export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}
