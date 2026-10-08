import type { Thought } from '../types/models'

export const thoughtColors = ['yellow', 'red', 'pink', 'purple', 'blue', 'green', 'orange'] as const
export const thoughtSizePresets = [
  { id:'large', label:'Groß', width:220, height:180 },
  { id:'medium', label:'Mittel', width:190, height:150 },
  { id:'small', label:'Klein', width:160, height:125 }
] as const
export const defaultThoughtSize = thoughtSizePresets[0]
export const collapsedThoughtHeight = 60

export function matchesThought(thought: Thought, query: string) {
  const needle = query.trim().toLocaleLowerCase('de-DE')
  if (!needle) return true
  return [thought.title ?? '', thought.content, ...thought.tags].some((value) => value.toLocaleLowerCase('de-DE').includes(needle))
}

export type ThoughtSort = 'manual' | 'updated' | 'created' | 'title' | 'color'

export function sortThoughts(thoughts: Thought[], sort: ThoughtSort) {
  const palette = new Map(thoughtColors.map((color, index) => [color, index]))
  return [...thoughts].sort((a, b) => {
    if (sort === 'manual') return 0
    if (sort === 'updated') return b.updatedAt.localeCompare(a.updatedAt)
    if (sort === 'created') return b.createdAt.localeCompare(a.createdAt)
    if (sort === 'color') return (palette.get(a.color) ?? 0) - (palette.get(b.color) ?? 0) || a.createdAt.localeCompare(b.createdAt)
    const aTitle = a.title?.trim(); const bTitle = b.title?.trim()
    if (!aTitle && bTitle) return 1
    if (aTitle && !bTitle) return -1
    return (aTitle ?? '').localeCompare(bTitle ?? '', 'de-DE') || a.createdAt.localeCompare(b.createdAt)
  })
}

export function arrangeThoughts(thoughts: Thought[], sort: ThoughtSort) {
  const remembered = thoughts.map((thought) => ({
    ...thought,
    manualX: thought.manualX ?? thought.x,
    manualY: thought.manualY ?? thought.y,
    manualZIndex: thought.manualZIndex ?? thought.zIndex
  }))
  if (sort === 'manual') return remembered.map((thought) => ({ ...thought, x:thought.manualX!, y:thought.manualY!, zIndex:thought.manualZIndex! }))
  let x = 28; let y = 28; let rowHeight = 0
  return sortThoughts(remembered, sort).map((thought, index) => {
    const width = thought.width ?? defaultThoughtSize.width
    const height = thought.collapsed ? collapsedThoughtHeight : thought.height ?? defaultThoughtSize.height
    if (x > 28 && x + width > 1772) { x = 28; y += rowHeight + 24; rowHeight = 0 }
    const arranged = { ...thought, x, y, zIndex:index + 1 }
    x += width + 24; rowHeight = Math.max(rowHeight, height)
    return arranged
  })
}

export function parseTags(value: string) {
  return [...new Set(value.split(',').map((tag) => tag.trim()).filter(Boolean))]
}
