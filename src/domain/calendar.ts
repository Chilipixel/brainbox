export function calendarMonthDays(month: Date) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const leading = (new Date(year, monthIndex, 1).getDay() + 6) % 7
  const count = new Date(year, monthIndex + 1, 0).getDate()
  return [...Array.from({ length: leading }, () => null), ...Array.from({ length: count }, (_, index) => index + 1)]
}
