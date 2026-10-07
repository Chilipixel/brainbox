import type { QuickItem } from '../types/models'

export function createQuickItem(text: string, now = new Date(), id: string = crypto.randomUUID(), sortOrder = 0): QuickItem | undefined {
  const cleanText = text.trim()
  return cleanText ? { id, text: cleanText, completed: false, createdAt: now.toISOString(), sortOrder } : undefined
}

export function reorderQuickItems(items: QuickItem[], activeId: string, targetId: string) {
  const ordered = [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.createdAt.localeCompare(b.createdAt))
  const from = ordered.findIndex((item) => item.id === activeId)
  const to = ordered.findIndex((item) => item.id === targetId)
  if (from < 0 || to < 0 || from === to) return ordered
  const [moved] = ordered.splice(from, 1)
  ordered.splice(to, 0, moved)
  return ordered.map((item, sortOrder) => ({ ...item, sortOrder }))
}

export function toggleQuickItemState(item: QuickItem): QuickItem {
  return { ...item, completed: !item.completed }
}

export function removeCompletedQuickItems(items: QuickItem[]) {
  return items.filter((item) => !item.completed)
}
