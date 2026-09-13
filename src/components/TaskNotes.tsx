import { parseNoteLines, toggleChecklistLine } from '../domain/noteChecklist'

export function TaskNotes({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  return <div className="task-notes">{parseNoteLines(value).map((line, index) => line.checked === undefined
    ? <p key={index}>{line.text || '\u00a0'}</p>
    : <label className={line.checked ? 'checked' : ''} key={index}><input type="checkbox" checked={line.checked} onChange={() => onChange(toggleChecklistLine(value, index))} /><span>{line.text}</span></label>)}</div>
}
