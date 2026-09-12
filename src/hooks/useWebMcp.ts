import { useEffect } from 'react'
import { useAppData } from './useAppData'
import type { Duration, Urgency } from '../types/models'

export function useWebMcp() {
  const { saveTask, tasks, categories } = useAppData()
  useEffect(() => {
    const context = document.modelContext
    if (!context?.registerTool) return
    const lifecycle = new AbortController()
    const register = async () => {
      await context.registerTool({
        name: 'list_open_tasks', title: 'Offene Aufgaben auflisten', description: 'Liest die offenen Aufgaben aus Sinnvoll.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: () => tasks.filter((task) => task.status === 'open').map((task) => ({ id: task.id, title: task.title, urgency: task.urgency, duration: task.duration }))
      }, { signal: lifecycle.signal })
      await context.registerTool({
        name: 'create_task', title: 'Aufgabe erstellen', description: 'Erstellt eine neue offene Aufgabe in Sinnvoll.',
        inputSchema: { type: 'object', properties: { title: { type: 'string' }, categoryId: { type: 'string' }, urgency: { type: 'string', enum: ['urgent','normal','someday'] }, duration: { type: 'string', enum: ['short','medium','long'] } }, required: ['title','categoryId','urgency','duration'], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: true },
        execute: async (raw: unknown) => {
          const input = raw as { title?: string, categoryId?: string, urgency?: Urgency, duration?: Duration }
          if (!input.title?.trim() || !categories.some((category) => category.id === input.categoryId)) throw new Error('Titel oder Kategorie ungültig.')
          const now = new Date().toISOString(); const id = crypto.randomUUID()
          await saveTask({ id, title: input.title.trim(), categoryId: input.categoryId!, urgency: input.urgency!, duration: input.duration!, status: 'open', createdAt: now, updatedAt: now })
          return { id, status: 'created' }
        }
      }, { signal: lifecycle.signal })
    }
    void register().catch(() => undefined)
    return () => lifecycle.abort()
  }, [saveTask, tasks, categories])
}
