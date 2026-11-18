// Tryb jasny/ciemny/auto - zapamiętywany w localStorage, aplikowany na <html data-theme>.
export type Theme = 'light' | 'dark' | 'auto'

const KEY = 'bf-theme'
const ORDER: Theme[] = ['light', 'dark', 'auto']

let cleanup: (() => void) | null = null

function systemDark(): boolean {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches } catch { return false }
}

function resolve(t: Theme): 'light' | 'dark' {
  return t === 'auto' ? (systemDark() ? 'dark' : 'light') : t
}

export function getStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'dark' || v === 'light' || v === 'auto' ? v : 'light'
  } catch { return 'light' }
}

export function applyTheme(t: Theme) {
  document.documentElement.setAttribute('data-theme', resolve(t))
  try { localStorage.setItem(KEY, t) } catch { /* brak dostępu */ }
  if (cleanup) { cleanup(); cleanup = null }
  if (t === 'auto') {
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const onChange = () => document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light')
      mq.addEventListener?.('change', onChange)
      cleanup = () => mq.removeEventListener?.('change', onChange)
    } catch { /* starsza przeglądarka */ }
  }
}

export function toggleTheme(): Theme {
  const cur = getStoredTheme()
  const next = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length]
  applyTheme(next)
  return next
}
