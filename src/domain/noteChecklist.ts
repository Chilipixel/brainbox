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
