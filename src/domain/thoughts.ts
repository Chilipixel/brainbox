import type { Thought } from '../types/models'

export const thoughtColors = ['yellow', 'pink', 'purple', 'blue', 'green', 'orange'] as const

export function matchesThought(thought: Thought, query: string) {
  const needle = query.trim().toLocaleLowerCase('de-DE')
  if (!needle) return true
  return [thought.title ?? '', thought.content, ...thought.tags].some((value) => value.toLocaleLowerCase('de-DE').includes(needle))
}

export type ThoughtSort = 'updated' | 'created' | 'title' | 'color'

export function sortThoughts(thoughts: Thought[], sort: ThoughtSort) {
  const palette = new Map(thoughtColors.map((color, index) => [color, index]))
  return [...thoughts].sort((a, b) => {
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
  return sortThoughts(thoughts, sort).map((thought, index) => ({
    ...thought,
    x: 28 + (index % 7) * 244,
    y: 28 + Math.floor(index / 7) * 204,
    zIndex: index + 1
  }))
}

export function parseTags(value: string) {
  return [...new Set(value.split(',').map((tag) => tag.trim()).filter(Boolean))]
}
