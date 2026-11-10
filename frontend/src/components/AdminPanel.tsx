import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  adminLogin, hasAdminSession, clearAdminSession,
  fetchAdminConversations, fetchAdminStats,
  type ConversationLogRow, type AdminStats,
} from '@/lib/admin'

const PAGE_SIZE = 25

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [authed, setAuthed] = useState(hasAdminSession())
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'stats' | 'logs'>('stats')

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setPinError('')
    try {
      await adminLogin(pin)
      setAuthed(true)
    } catch (err) {
      setPinError(err instanceof Error ? err.message : 'Błąd')
    } finally {
      setLoading(false)
    }
  }

  const handleLock = () => {
    clearAdminSession()
    setAuthed(false)
    setPin('')
  }

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: 'rgba(28,24,20,0.45)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full flex flex-col overflow-hidden rounded-xl"
        style={{
          maxWidth: authed ? 900 : 380,
          maxHeight: '85vh',
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)', boxShadow: '0 24px 70px rgba(28,24,20,0.2)',
        }}
      >
        {!authed ? (
          <form onSubmit={handlePinSubmit} className="p-6 flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>🔒 Panel statystyk</p>
              <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                Podaj PIN, żeby zobaczyć wszystkie rozmowy i statystyki.
              </p>
            </div>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="PIN"
              autoFocus
              className="w-full rounded-lg px-4 py-3 text-sm outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--ink)' }}
            />
            {pinError && <p className="text-xs" style={{ color: '#C0392B' }}>{pinError}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={onClose} className="text-sm px-3 py-1.5 rounded-lg" style={{ color: 'var(--ink-soft)' }}>
                Anuluj
              </button>
              <button
                type="submit"
                disabled={loading || !pin}
                className="text-sm px-4 py-1.5 rounded-lg font-semibold disabled:opacity-40"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {loading ? 'Sprawdzam…' : 'Wejdź'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1">
                <TabButton active={tab === 'stats'} onClick={() => setTab('stats')}>📊 Statystyki</TabButton>
                <TabButton active={tab === 'logs'} onClick={() => setTab('logs')}>💬 Rozmowy</TabButton>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={handleLock} className="text-xs" style={{ color: 'var(--ink-faint)' }}>🔒 Zablokuj</button>
                <button onClick={onClose} className="text-xs" style={{ color: 'var(--ink-faint)' }}>✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {tab === 'stats' ? <StatsTab /> : <LogsTab />}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-3 py-1.5 rounded-lg transition-colors"
      style={{
        background: active ? 'var(--accent-soft)' : 'transparent',
        color: active ? 'var(--ink)' : 'var(--ink-soft)',
      }}
    >
      {children}
    </button>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg px-4 py-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>{label}</p>
      <p className="mt-1" style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', fontFamily: 'ui-monospace,monospace' }}>
        {value}
      </p>
    </div>
  )
}

function StatsTab() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdminStats().then(setStats).catch(err => setError(err instanceof Error ? err.message : 'Błąd'))
  }, [])

  if (error) return <p className="text-sm" style={{ color: '#C0392B' }}>{error}</p>
  if (!stats) return <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Ładowanie…</p>

  const { totals, perModel } = stats
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Rozmowy" value={totals.conversations.toLocaleString('pl-PL')} />
        <StatCard label="Tokeny" value={(totals.promptTok + totals.genTok).toLocaleString('pl-PL')} />
        <StatCard label="Energia" value={`${(totals.energyKWh * 1000).toFixed(1)} Wh`} />
        <StatCard label="Woda" value={`${(totals.waterL * 1000).toFixed(0)} ml`} />
      </div>

      <div>
        <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>Per model</p>
        <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border)' }}>
          <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {['Model', 'Rozmowy', 'Śr. tok/s', 'Tokeny', 'Energia'].map(h => (
                  <th key={h} className="text-left px-3 py-2" style={{ color: 'var(--ink-faint)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perModel.map(m => (
                <tr key={m.model} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="px-3 py-2" style={{ color: 'var(--ink)' }}>{m.model}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--ink-soft)' }}>{m.count}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--ink-soft)' }}>{m.avgTps ?? '–'}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--ink-soft)' }}>{m.totalTokens.toLocaleString('pl-PL')}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--ink-soft)' }}>{(m.energyKWh * 1000).toFixed(1)} Wh</td>
                </tr>
              ))}
              {perModel.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-4 text-center" style={{ color: 'var(--ink-faint)' }}>Brak danych</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {stats.daily.length > 0 && (
        <div>
          <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>Ostatnie 14 dni</p>
          <div className="flex items-end gap-1" style={{ height: 60 }}>
            {stats.daily.map(d => {
              const max = Math.max(...stats.daily.map(x => x.count), 1)
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1" title={`${d.date}: ${d.count}`}>
                  <div
                    className="w-full rounded-sm"
                    style={{ height: `${Math.max(4, (d.count / max) * 48)}px`, background: 'var(--accent)' }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function LogsTab() {
  const [rows, setRows] = useState<ConversationLogRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [q, setQ] = useState('')
  const [qDraft, setQDraft] = useState('')
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1)

  useEffect(() => {
    fetchAdminConversations({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, q: q || undefined })
      .then(d => { setRows(d.rows); setTotal(d.total) })
      .catch(err => setError(err instanceof Error ? err.message : 'Błąd'))
  }, [page, q])

  const search = () => { setPage(0); setQ(qDraft.trim()) }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          value={qDraft}
          onChange={e => setQDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') search() }}
          placeholder="Szukaj w pytaniach/odpowiedziach…"
          className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--ink)' }}
        />
        <button onClick={search} className="text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}>
          Szukaj
        </button>
      </div>

      {error && <p className="text-sm" style={{ color: '#C0392B' }}>{error}</p>}
      <p style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{total.toLocaleString('pl-PL')} rozmów</p>

      <div className="flex flex-col gap-1.5">
        {rows.map(r => {
          const expanded = expandedId === r.id
          return (
            <div key={r.id} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button
                onClick={() => setExpandedId(expanded ? null : r.id)}
                className="w-full text-left px-3 py-2 flex items-center gap-2"
                style={{ background: 'var(--surface-2)' }}
              >
                <span style={{ fontSize: 10, color: 'var(--ink-faint)', fontFamily: 'ui-monospace,monospace', whiteSpace: 'nowrap' }}>
                  {r.ts.replace('T', ' ').replace(/\..*/, '')}
                </span>
                <span style={{ fontSize: 10, color: 'rgb(var(--accent-rgb))', whiteSpace: 'nowrap' }}>{r.model}</span>
                <span className="truncate flex-1" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{r.question}</span>
                {r.tps != null && <span style={{ fontSize: 10, color: 'var(--ink-faint)', flexShrink: 0 }}>{r.tps} tok/s</span>}
              </button>
              {expanded && (
                <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 11, color: 'var(--ink-faint)', marginBottom: 4 }}>❓ Pytanie</p>
                  <p className="whitespace-pre-wrap" style={{ fontSize: 12, color: 'var(--ink)', marginBottom: 10 }}>{r.question}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-faint)', marginBottom: 4 }}>💬 Odpowiedź</p>
                  <p className="whitespace-pre-wrap" style={{ fontSize: 12, color: 'var(--ink)' }}>
                    {r.answer || (r.error ? `[BŁĄD: ${r.error}]` : '(brak)')}
                  </p>
                  {r.tps != null && (
                    <p className="mt-3" style={{ fontSize: 10, color: 'var(--ink-faint)', fontFamily: 'ui-monospace,monospace' }}>
                      {r.promptTok}→{r.genTok} tok · {r.tps} tok/s
                      {r.wallMs != null && ` · ${(r.wallMs / 1000).toFixed(1)}s`}
                      {r.energyKWh != null && ` · ⚡ ${(r.energyKWh * 1000).toFixed(2)} Wh`}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {rows.length === 0 && !error && (
          <p className="text-xs text-center py-6" style={{ color: 'var(--ink-faint)' }}>Brak wyników</p>
        )}
      </div>

      {maxPage > 0 && (
        <div className="flex items-center justify-center gap-3 mt-1">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="text-xs px-2 py-1 disabled:opacity-30" style={{ color: 'var(--ink-soft)' }}>
            ← Poprzednia
          </button>
          <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{page + 1} / {maxPage + 1}</span>
          <button disabled={page >= maxPage} onClick={() => setPage(p => p + 1)} className="text-xs px-2 py-1 disabled:opacity-30" style={{ color: 'var(--ink-soft)' }}>
            Następna →
          </button>
        </div>
      )}
    </div>
  )
}
