export const accentOptions = [
  { id:'default', label:'Brainbox', color:'#2f8f83' },
  { id:'blue', label:'Blau', color:'#4c7fe6' },
  { id:'purple', label:'Lila', color:'#8e63dc' },
  { id:'pink', label:'Rosa', color:'#d65c91' },
  { id:'orange', label:'Orange', color:'#d38332' },
  { id:'red', label:'Rot', color:'#d75a61' },
  { id:'green', label:'Grün', color:'#45a067' }
] as const

export const boardOptions = [
  { id:'cork', label:'Kork', color:'#c9915b', edge:'#b98554', dot:'#5b351d' },
  { id:'sand', label:'Sand', color:'#bda67d', edge:'#aa9167', dot:'#655438' },
  { id:'sage', label:'Salbei', color:'#78947e', edge:'#667f6c', dot:'#304c38' },
  { id:'ocean', label:'Ozean', color:'#5d8494', edge:'#4e7180', dot:'#274552' },
  { id:'slate', label:'Schiefer', color:'#647180', edge:'#535f6d', dot:'#2b3540' },
  { id:'plum', label:'Pflaume', color:'#806781', edge:'#6d586f', dot:'#453447' }
] as const

export type AccentId = typeof accentOptions[number]['id']
export type BoardId = typeof boardOptions[number]['id']

const accentKey = 'appearance-accent'
const boardKey = 'appearance-thought-board'

export function getAccentId(): AccentId {
  const value = localStorage.getItem(accentKey)
  return accentOptions.some((option) => option.id === value) ? value as AccentId : 'default'
}

export function getBoardId(): BoardId {
  const value = localStorage.getItem(boardKey)
  return boardOptions.some((option) => option.id === value) ? value as BoardId : 'cork'
}

export function applyAccent(id: AccentId, persist = true) {
  const root = document.documentElement
  if (id === 'default') {
    root.style.removeProperty('--accent')
    root.style.removeProperty('--accent-soft')
  } else {
    const option = accentOptions.find((item) => item.id === id)!
    root.style.setProperty('--accent', option.color)
    root.style.setProperty('--accent-soft', `color-mix(in srgb, ${option.color} 19%, transparent)`)
  }
  if (persist) localStorage.setItem(accentKey, id)
}

export function applyBoard(id: BoardId, persist = true) {
  const option = boardOptions.find((item) => item.id === id)!
  const root = document.documentElement
  root.style.setProperty('--thought-board', option.color)
  root.style.setProperty('--thought-board-edge', option.edge)
  root.style.setProperty('--thought-board-dot', option.dot)
  if (persist) localStorage.setItem(boardKey, id)
}

export function applyStoredAppearance() {
  applyAccent(getAccentId(), false)
  applyBoard(getBoardId(), false)
}
