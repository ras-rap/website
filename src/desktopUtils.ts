import { DAY_NAMES, MONTH_NAMES, type LanyardData } from './desktopData'

export const formatClock = (date: Date): string => {
  let hours = date.getHours()
  const minutes = date.getMinutes()
  const suffix = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12 || 12

  return `${hours}:${String(minutes).padStart(2, '0')} ${suffix}`
}

export function buildMonthDays(date: Date) {
  const days: Array<number | null> = Array.from({ length: new Date(date.getFullYear(), date.getMonth(), 1).getDay() }, () => null)
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(day)
  }

  while (days.length % 7 !== 0) {
    days.push(null)
  }

  return days
}

export function formatDiscordStatus(status: LanyardData['discord_status']) {
  switch (status) {
    case 'online':
      return 'Online'
    case 'idle':
      return 'Idle'
    case 'dnd':
      return 'Do Not Disturb'
    default:
      return 'Offline'
  }
}

export function formatDuration(milliseconds: number) {
  const safeMilliseconds = Math.max(0, milliseconds)
  const totalSeconds = Math.floor(safeMilliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export { MONTH_NAMES, DAY_NAMES }
