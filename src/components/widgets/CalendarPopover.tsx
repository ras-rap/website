import { DAY_NAMES, MONTH_NAMES } from '../../desktopData'
import { buildMonthDays } from '../../desktopUtils'

export function CalendarPopover({ now }: { now: Date }) {
  const monthDays = buildMonthDays(now)

  return (
    <div className="calendar-popover" role="dialog" aria-label="Calendar">
      <div className="calendar-popover__header">
        {MONTH_NAMES[now.getMonth()]} {now.getFullYear()}
      </div>
      <div className="calendar-popover__grid calendar-popover__grid--days">
        {DAY_NAMES.map((dayName) => (
          <span key={dayName}>{dayName}</span>
        ))}
      </div>
      <div className="calendar-popover__grid">
        {monthDays.map((day, index) => (
          <span key={`${day ?? 'empty'}-${index}`} className={day === now.getDate() ? 'is-today' : ''}>
            {day ?? ''}
          </span>
        ))}
      </div>
    </div>
  )
}
