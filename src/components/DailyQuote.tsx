import { useEffect, useState } from 'react'
import { getDailyQuote } from '../utils/dailyQuote'

function millisecondsUntilTomorrow() {
  const now = new Date()
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return tomorrow.getTime() - now.getTime()
}

export function DailyQuote() {
  const [quote, setQuote] = useState(getDailyQuote)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    const update = () => {
      clearTimeout(timeout)
      setQuote(getDailyQuote())
      timeout = setTimeout(update, millisecondsUntilTomorrow() + 1_000)
    }
    timeout = setTimeout(update, millisecondsUntilTomorrow() + 1_000)
    document.addEventListener('visibilitychange', update)
    return () => {
      clearTimeout(timeout)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return quote ? <p className="daily-quote">{quote}</p> : null
}
