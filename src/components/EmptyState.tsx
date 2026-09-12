import { Sparkles } from 'lucide-react'

export function EmptyState({ title, text }: { title: string, text: string }) {
  return <div className="empty-state"><Sparkles aria-hidden="true" /><strong>{title}</strong><p>{text}</p></div>
}
