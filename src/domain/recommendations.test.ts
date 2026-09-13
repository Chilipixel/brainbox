import { describe, expect, it } from 'vitest'
import { filterTasksByAvailableEnergy, getBestTaskNow, getRandomTask, getTasksForAvailableTime, getTasksForRandomTime } from './recommendations'
import type { Task } from '../types/models'

const make = (id: string, urgency: Task['urgency'], minutes: number): Task => ({ id, title:id, categoryId:'c', urgency, duration:minutes < 15 ? 'short' : minutes <= 60 ? 'medium' : 'long', estimatedMinutes:minutes, status:'open', createdAt:'2025-01-01', updatedAt:'2025-01-01' })
const tasks = [make('urgent','urgent',10), make('normal','normal',25), make('later','someday',20), make('long','normal',90)]

describe('Dauerfilter', () => { it('lässt nur ungefähr passende Aufgaben zu', () => expect(getTasksForAvailableTime(tasks, 30).map((t) => t.id)).toEqual(['urgent','normal','later'])) })
describe('Zeitstufen der Zufallsauswahl', () => {
  it('zeigt bei maximal 15 Minuten nur kurze passende Aufgaben', () => expect(getTasksForRandomTime(tasks, 15).map((task) => task.id)).toEqual(['urgent']))
  it('zeigt bei maximal 60 Minuten auch alle kürzeren Aufgaben', () => expect(getTasksForRandomTime(tasks, 60).map((task) => task.id)).toEqual(['urgent','normal','later']))
  it('wählt bei über 60 Minuten aus allen offenen Aufgaben', () => expect(getTasksForRandomTime(tasks, Number.POSITIVE_INFINITY).map((task) => task.id)).toEqual(['urgent','normal','later','long']))
})
describe('Recommendation Engine', () => { it('empfiehlt die höchste sinnvolle Priorität', () => expect(getBestTaskNow(tasks)?.id).toBe('urgent')) })
describe('Zufallsauswahl', () => {
  it('gewichtet wichtige Aufgaben und bleibt deterministisch testbar', () => expect(getRandomTask(tasks,30,'important',undefined,undefined,() => 0)?.id).toBe('urgent'))
  it('bevorzugt im Langeweile-Modus Irgendwann-Aufgaben', () => expect(getRandomTask(tasks,30,'boredom',undefined,undefined,() => .5)?.id).toBe('later'))
  it('vermeidet die direkt vorherige Aufgabe', () => expect(getRandomTask(tasks,30,'any',undefined,'urgent',() => 0)?.id).not.toBe('urgent'))
  it('berücksichtigt Energielevel und verwendet abgestufte Fallbacks', () => {
    const energyTasks = [make('none','normal',10), { ...make('low','normal',10), energyLevel:'low' as const }, { ...make('medium','normal',10), energyLevel:'medium' as const }]
    expect(filterTasksByAvailableEnergy(energyTasks, 'low').map((task) => task.id)).toEqual(['low'])
    expect(filterTasksByAvailableEnergy(energyTasks, 'high').map((task) => task.id)).toEqual(['medium'])
    expect(getRandomTask(energyTasks,30,'any','medium',undefined,() => 0)?.id).toBe('medium')
  })
  it('verwendet Aufgaben ohne Energieangabe nur als letzten Fallback', () => expect(filterTasksByAvailableEnergy([make('legacy','normal',10)], 'high').map((task) => task.id)).toEqual(['legacy']))
})
