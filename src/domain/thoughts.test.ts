import { describe, expect, it } from 'vitest'
import type { Thought } from '../types/models'
import { arrangeThoughts, matchesThought, parseTags, sortThoughts } from './thoughts'

const thought = (values: Partial<Thought> = {}): Thought => ({ id:'a', content:'Neue Pedal-Idee', color:'yellow', tags:['Audio'], x:400, y:300, zIndex:8, createdAt:'2026-01-01', updatedAt:'2026-02-01', ...values })

describe('Thoughts', () => {
  it('sucht ohne Beachtung der Großschreibung in Titel, Inhalt und Tags', () => {
    const value = thought({ title:'Werkstatt' })
    expect(matchesThought(value, 'WERK')).toBe(true); expect(matchesThought(value, 'pedal')).toBe(true); expect(matchesThought(value, 'audio')).toBe(true); expect(matchesThought(value, 'Katze')).toBe(false)
  })
  it('bereinigt und dedupliziert Tags', () => expect(parseTags(' Idee, später,Idee, , Zuhause ')).toEqual(['Idee','später','Zuhause']))
  it('sortiert Einträge ohne Titel hinter betitelte Einträge', () => expect(sortThoughts([thought({ id:'a' }), thought({ id:'b', title:'Beta' }), thought({ id:'c', title:'Alpha' })], 'title').map((item) => item.id)).toEqual(['c','b','a']))
  it('ordnet dauerhaft in einem Raster an, ohne Inhalte zu verändern', () => {
    const arranged = arrangeThoughts([thought({ id:'a' }), thought({ id:'b', updatedAt:'2026-03-01' })], 'updated')
    expect(arranged.map(({ id, x, y, zIndex }) => ({ id, x, y, zIndex }))).toEqual([{ id:'b', x:28, y:28, zIndex:1 }, { id:'a', x:272, y:28, zIndex:2 }])
    expect(arranged[0].content).toBe('Neue Pedal-Idee')
    expect(arranged[0].updatedAt).toBe('2026-03-01')
  })
})
