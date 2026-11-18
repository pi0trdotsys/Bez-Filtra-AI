// Tryb jasny/ciemny - zapamiętywany w localStorage, aplikowany na <html data-theme>.
export type Theme = 'light' | 'dark'

const KEY = 'bf-theme'

export function getStoredTheme(): Theme {
  try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light' } catch { return 'light' }
}

export function applyTheme(t: Theme) {
  document.documentElement.setAttribute('data-theme', t)
  try { localStorage.setItem(KEY, t) } catch { /* brak dostępu */ }
}

export function toggleTheme(): Theme {
  const next: Theme = getStoredTheme() === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  return next
}
