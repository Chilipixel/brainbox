import type { Category, Duration, Task, Urgency } from '../types/models'
import { db } from './localDatabase'

const categoryData = [
  ['cat', 'Katze', '🐈', '#e58b45'], ['home', 'Wohnung', '🏠', '#5778d3'],
  ['work', 'Arbeit', '💻', '#8357c5'], ['electronics', 'Elektronik', '⚡', '#289b91'],
  ['pedals', 'Pedale', '🎛️', '#d05c73'], ['print', '3D-Druck', '⬡', '#597a8f'], ['private', 'Privat', '◌', '#74845e']
]

const taskData: Array<[string, string, Urgency, Duration, number?]> = [
  ['Tierarzt anrufen', 'cat', 'urgent', 'short', 5], ['Katzenstreu bestellen', 'cat', 'normal', 'short', 10],
  ['Kratzbaum reparieren', 'cat', 'normal', 'medium', 30], ['Kartenspielzeug bauen', 'cat', 'someday', 'medium', 45],
  ['Katzenregal bauen', 'cat', 'someday', 'long', 120], ['Platine bestellen', 'work', 'urgent', 'short', 5],
  ['Pedal-Layout überarbeiten', 'pedals', 'urgent', 'long', 90], ['3D-Drucker warten', 'print', 'someday', 'medium', 40]
]

export async function seedDevelopmentData() {
  if (!import.meta.env.DEV || await db.categories.count() > 0 || await db.tasks.count() > 0) return
  const now = new Date().toISOString()
  const categories: Category[] = categoryData.map(([id, name, icon, color], index) => ({ id, name, icon, color, createdAt: now, sortOrder: index }))
  const tasks: Task[] = taskData.map(([title, categoryId, urgency, duration, estimatedMinutes], index) => ({
    id: `seed-${index}`, title, categoryId, urgency, duration, estimatedMinutes,
    description: title === 'Kartenspielzeug bauen' ? 'Ein einfaches Spielzeug aus Pappe und Sisal basteln.' : undefined,
    createdAt: now, updatedAt: now, status: 'open'
  }))
  await db.transaction('rw', db.categories, db.tasks, async () => { await db.categories.bulkPut(categories); await db.tasks.bulkPut(tasks) })
}
