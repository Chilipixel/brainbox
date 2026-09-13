import { dailyQuotes } from '../data/dailyQuotes'

function localDayNumber(date: Date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = seed + 0x6d2b79f5 | 0
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed)
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value
    return ((value ^ value >>> 14) >>> 0) / 4_294_967_296
  }
}

function shuffledIndexes(length: number, seed: number) {
  const indexes = Array.from({ length }, (_, index) => index)
  const random = mulberry32(Math.imul(seed, 0x9e3779b1) ^ 0x42524149)

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1))
    ;[indexes[index], indexes[other]] = [indexes[other], indexes[index]]
  }

  return indexes
}

export function getQuoteIndexForDate(date: Date, quoteCount: number = dailyQuotes.length) {
  if (!Number.isInteger(quoteCount) || quoteCount < 1) return -1
  const dayNumber = localDayNumber(date)
  if (quoteCount === 1) return 0
  if (quoteCount === 2) return ((dayNumber % 2) + 2) % 2

  const block = Math.floor(dayNumber / quoteCount)
  const position = dayNumber - block * quoteCount
  const order = shuffledIndexes(quoteCount, block)
  const previousOrder = shuffledIndexes(quoteCount, block - 1)

  if (order[0] === previousOrder[quoteCount - 1]) {
    ;[order[0], order[1]] = [order[1], order[0]]
  }

  return order[position]
}

export function getQuoteForDate(date: Date, quotes: readonly string[] = dailyQuotes) {
  const index = getQuoteIndexForDate(date, quotes.length)
  return index === -1 ? '' : quotes[index]
}

export function getDailyQuote() {
  return getQuoteForDate(new Date())
}
