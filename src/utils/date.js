import dayjs from 'dayjs'
import 'dayjs/locale/id'
import relativeTime from 'dayjs/plugin/relativeTime'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'

dayjs.locale('id')
dayjs.extend(relativeTime)
dayjs.extend(isToday)
dayjs.extend(isYesterday)

export { dayjs }

/**
 * Format date to Indonesian format
 */
export function formatDate(date, format = 'DD MMM YYYY') {
  if (!date) return '-'
  return dayjs(date).format(format)
}

/**
 * Format date for transaction grouping
 */
export function formatDateGroup(date) {
  const d = dayjs(date)
  if (d.isToday()) return 'Hari Ini'
  if (d.isYesterday()) return 'Kemarin'
  return d.format('DD MMMM YYYY')
}

/**
 * Get relative time string
 */
export function timeAgo(date) {
  if (!date) return ''
  return dayjs(date).fromNow()
}

/**
 * Get start and end of current month
 */
export function getCurrentMonthRange() {
  const start = dayjs().startOf('month').format('YYYY-MM-DD')
  const end = dayjs().endOf('month').format('YYYY-MM-DD')
  return { start, end }
}

/**
 * Get month name
 */
export function getMonthName(month) {
  return dayjs().month(month - 1).format('MMMM')
}

/**
 * Format date for input[type="date"]
 */
export function toDateInputValue(date) {
  return dayjs(date || undefined).format('YYYY-MM-DD')
}

/**
 * Get days remaining until a date
 */
export function daysRemaining(targetDate) {
  if (!targetDate) return null
  const diff = dayjs(targetDate).diff(dayjs(), 'day')
  return Math.max(0, diff)
}
