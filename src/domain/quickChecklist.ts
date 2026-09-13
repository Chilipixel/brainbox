import type { QuickItem } from '../types/models'

export function createQuickItem(text: string, now = new Date(), id: string = crypto.randomUUID()): QuickItem | undefined {
  const cleanText = text.trim()
  return cleanText ? { id, text: cleanText, completed: false, createdAt: now.toISOString() } : undefined
}

export function toggleQuickItemState(item: QuickItem): QuickItem {
  return { ...item, completed: !item.completed }
}

export function removeCompletedQuickItems(items: QuickItem[]) {
  return items.filter((item) => !item.completed)
}
