import { describe, expect, it } from 'vitest'
import { getBestTaskNow, getRandomTask, getTasksForAvailableTime } from './recommendations'
import type { Task } from '../types/models'

const make = (id: string, urgency: Task['urgency'], minutes: number): Task => ({ id, title:id, categoryId:'c', urgency, duration:minutes < 15 ? 'short' : minutes <= 60 ? 'medium' : 'long', estimatedMinutes:minutes, status:'open', createdAt:'2025-01-01', updatedAt:'2025-01-01' })
const tasks = [make('urgent','urgent',10), make('normal','normal',25), make('later','someday',20), make('long','normal',90)]

describe('Dauerfilter', () => { it('lässt nur ungefähr passende Aufgaben zu', () => expect(getTasksForAvailableTime(tasks, 30).map((t) => t.id)).toEqual(['urgent','normal','later'])) })
describe('Recommendation Engine', () => { it('empfiehlt die höchste sinnvolle Priorität', () => expect(getBestTaskNow(tasks)?.id).toBe('urgent')) })
describe('Zufallsauswahl', () => {
  it('gewichtet wichtige Aufgaben und bleibt deterministisch testbar', () => expect(getRandomTask(tasks,30,'important',undefined,() => 0)?.id).toBe('urgent'))
  it('bevorzugt im Langeweile-Modus Irgendwann-Aufgaben', () => expect(getRandomTask(tasks,30,'boredom',undefined,() => .5)?.id).toBe('later'))
  it('vermeidet die direkt vorherige Aufgabe', () => expect(getRandomTask(tasks,30,'any','urgent',() => 0)?.id).not.toBe('urgent'))
})
