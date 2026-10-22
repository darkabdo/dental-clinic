import React, { useMemo } from 'react'
import '../styles/CalendarPicker.css'

const pad2 = (n) => String(n).padStart(2, '0')
const toKey = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1)
const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)

const CalendarPicker = ({
  monthDate,
  availableDates = [],
  selectedDate,
  onSelect,
  title = 'Select date',
  dateBadges = {},
  badgeAriaLabel = (dateKey, badgeText) => `${dateKey} badge ${badgeText}`,
}) => {
  const availableSet = useMemo(() => new Set(availableDates), [availableDates])

  const grid = useMemo(() => {
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)

    const firstDayIndex = (start.getDay() + 6) % 7 // Monday=0 ... Sunday=6
    const daysInMonth = end.getDate()

    const cells = []
    for (let i = 0; i < firstDayIndex; i += 1) {
      cells.push({ type: 'empty', key: `e-${i}` })
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), d)
      const key = toKey(date)
      const badge = dateBadges[key]
      cells.push({
        type: 'day',
        key,
        label: d,
        dateKey: key,
        isAvailable: availableSet.has(key),
        isSelected: key === selectedDate,
        badge,
      })
    }
    return cells
  }, [availableSet, dateBadges, monthDate, selectedDate])

  const monthLabel = monthDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="calendar-picker">
      <div className="calendar-header">
        <div>
          <div className="calendar-title">{title}</div>
          <div className="calendar-month">{monthLabel}</div>
        </div>
      </div>

      <div className="calendar-weekdays">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((w) => (
          <div className="weekday" key={w}>
            {w}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {grid.map((cell) =>
          cell.type === 'empty' ? (
            <div className="calendar-cell empty" key={cell.key} />
          ) : (
            <button
              key={cell.key}
              type="button"
              className={`calendar-cell day ${cell.isAvailable ? 'available' : 'disabled'} ${
                cell.isSelected ? 'selected' : ''
              } ${cell.badge ? 'has-badge' : ''}`}
              onClick={() => cell.isAvailable && onSelect?.(cell.dateKey)}
              disabled={!cell.isAvailable}
              aria-label={`Select ${cell.dateKey}`}
            >
              <span className="day-number">{cell.label}</span>
              {cell.badge ? (
                <span
                  className={`day-indicator ${cell.badge.variant || 'neutral'}`}
                  aria-label={badgeAriaLabel(cell.dateKey, cell.badge.text)}
                />
              ) : null}
            </button>
          )
        )}
      </div>
    </div>
  )
}

export default CalendarPicker
