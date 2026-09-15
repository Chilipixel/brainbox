export interface NoteLine {
  text: string
  checked?: boolean
}

const checklistLine = /^([☐☑])\s+(.*)$/u

export function parseNoteLines(value: string): NoteLine[] {
  return value.split('\n').map((line) => {
    const match = line.match(checklistLine)
    return match ? { text: match[2], checked: match[1] === '☑' } : { text: line }
  })
}

export function toggleChecklistLine(value: string, lineIndex: number) {
  return value.split('\n').map((line, index) => {
    if (index !== lineIndex) return line
    const match = line.match(checklistLine)
    if (!match) return line
    return `${match[1] === '☑' ? '☐' : '☑'} ${match[2]}`
  }).join('\n')
}

export function appendChecklistLine(value: string) {
  return `${value}${value && !value.endsWith('\n') ? '\n' : ''}☐ `
}

/** Toggle whole touched lines, with an exclusive textarea selection end. */
export function toggleChecklistSelection(value: string, start: number, end: number) {
  const from = Math.max(0, Math.min(value.length, Math.min(start, end)))
  const to = Math.max(from, Math.min(value.length, Math.max(start, end)))
  if (from === to) {
    const next = appendChecklistLine(value)
    return { value: next, selectionStart: next.length, selectionEnd: next.length }
  }

  const lineStart = from === 0 ? 0 : value.lastIndexOf('\n', from - 1) + 1
  const nextNewline = value.indexOf('\n', to - 1)
  const lineEnd = nextNewline === -1 ? value.length : nextNewline
  const lines = value.slice(lineStart, lineEnd).split('\n')
  const nonEmpty = lines.filter((line) => line.trim())
  const remove = nonEmpty.length > 0 && nonEmpty.every((line) => checklistLine.test(line))
  const replacement = lines.map((line) => {
    if (!line.trim()) return line
    const match = line.match(checklistLine)
    if (remove) return match ? match[2] : line
    return match ? line : `☐ ${line}`
  }).join('\n')

  return {
    value: value.slice(0, lineStart) + replacement + value.slice(lineEnd),
    selectionStart: lineStart,
    selectionEnd: lineStart + replacement.length
  }
}
