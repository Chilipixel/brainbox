import { describe, expect, it } from 'vitest'
import { compareByPriority, sortTasks, taskMinutes } from './ranking'
import type { Task } from '../types/models'

const make = (id: string, urgency: Task['urgency'], duration: Task['duration'], extras: Partial<Task> = {}): Task => ({ id, title:id, categoryId:'c', urgency, duration, status:'open', createdAt:'2025-01-01T00:00:00Z', updatedAt:'2025-01-01T00:00:00Z', ...extras })

describe('Prioritätssortierung', () => {
  it('sortiert Dringendes und dann kurze Aufgaben zuerst', () => {
    const tasks = [make('someday','someday','short'), make('long','urgent','long'), make('short','urgent','short')].sort((a,b) => compareByPriority(a,b,new Date('2025-01-10')))
    expect(tasks.map((task) => task.id)).toEqual(['short','long','someday'])
  })
  it('priorisiert überfällige Aufgaben sinnvoll', () => {
    const overdue = make('overdue','normal','long',{dueDate:'2025-01-05'})
    const urgent = make('urgent','urgent','short')
    expect(compareByPriority(overdue, urgent, new Date('2025-01-10'))).toBeLessThan(0)
  })
  it('nutzt konkrete Minuten vor der Dauerstufe', () => expect(taskMinutes(make('x','normal','medium',{estimatedMinutes:32}))).toBe(32))
  it('sortiert nach Energie in beide Richtungen und lässt alte Aufgaben ohne Angabe zu', () => {
    const tasks = [make('none','normal','short'), make('high','normal','short',{energyLevel:'high'}), make('low','normal','short',{energyLevel:'low'}), make('medium','normal','short',{energyLevel:'medium'})]
    expect(sortTasks(tasks, 'energyAsc').map((task) => task.id)).toEqual(['low','medium','high','none'])
    expect(sortTasks(tasks, 'energyDesc').map((task) => task.id)).toEqual(['high','medium','low','none'])
  })
})
