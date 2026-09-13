import { X } from 'lucide-react'

const commonEmoji = ['🏠', '💡', '🛠️', '💼', '🛒', '❤️', '🎸', '🐾', '🌿', '📚', '🎨', '💻', '⚡', '🚗', '✈️', '📦']

export function EmojiPicker({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  return <div className="emoji-picker">
    <div className="emoji-options" aria-label="Häufige Emojis">{commonEmoji.map((emoji) => <button type="button" key={emoji} className={value === emoji ? 'selected' : ''} onClick={() => onChange(emoji)} aria-label={`Emoji ${emoji} wählen`} aria-pressed={value === emoji}>{emoji}</button>)}</div>
    <div className="emoji-custom"><label>Anderes Emoji<input value={value} onChange={(event) => onChange(event.target.value)} maxLength={8} inputMode="text" placeholder="z. B. 🧰" /></label>{value && <button type="button" onClick={() => onChange('')} aria-label="Kategorie-Emoji entfernen"><X /></button>}</div>
  </div>
}
