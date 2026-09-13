import { describe, expect, it } from 'vitest'
import { categoryEmoji, withCategoryEmoji } from './categoryDisplay'
import type { Category } from '../types/models'

const category: Category = { id:'c', name:'Werkstatt', icon:'🛠️', color:'#000', createdAt:'2026-01-01', sortOrder:0 }

describe('Kategorie-Emoji', () => {
  it('unterstützt bestehende Kategorien ohne neues Emoji-Feld', () => expect(categoryEmoji(category)).toBe('🛠️'))
  it('kann ein Emoji speichern und ändern', () => expect(withCategoryEmoji(category, '🎸').emoji).toBe('🎸'))
  it('kann ein Emoji entfernen', () => expect(withCategoryEmoji(category, '').emoji).toBeUndefined())
})
