import type { Category } from '../types/models'

export function categoryEmoji(category?: Category) {
  return category?.emoji ?? (category?.icon && category.icon !== '◌' ? category.icon : '')
}

export function withCategoryEmoji(category: Category, emoji: string): Category {
  return { ...category, emoji: emoji.trim() || undefined, icon: '◌' }
}
