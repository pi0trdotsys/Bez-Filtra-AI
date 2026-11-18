import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { describeModel, type ModelEntry } from '@/lib/models'
import type { Conversation } from '@/lib/conversations'
import { SearchIcon, SlidersIcon, PlusIcon, ChatIcon, ModelIcon } from './Icons'

interface CommandPaletteProps {
  onClose: () => void
  conversations: Conversation[]
  models: ModelEntry[]
  selectedModel: string
  defaultModel: string
  onNewChat: () => void
  onSelectConversation: (id: string) => void
  onSelectModel: (name: string) => void
  onOpenPersona: () => void
  onJumpTo?: (convId: string, messageId: string) => void
}

interface Item {
  key: string
  icon: ReactNode
  label: string
  sub?: string
  run: () => void
}

const snippet = (content: string, q: string): string => {
  const idx = content.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return content.replace(/\s+/g, ' ').trim().slice(0, 70)
  const start = Math.max(0, idx - 30)
  const end = Math.min(content.length, idx + q.length + 50)
  return (start > 0 ? '…' : '') + content.slice(start, end).replace(/\s+/g, ' ').trim() + (end < content.length ? '…' : '')
}

export function CommandPalette({
  onClose, conversations, models, selectedModel, defaultModel,
  onNewChat, onSelectConversation, onSelectModel, onOpenPersona, onJumpTo,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [sel, setSel] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const q = query.trim().toLowerCase()
  const current = selectedModel || defaultModel

  const items = useMemo<Item[]>(() => {
    const out: Item[] = []
    const match = (s: string) => s.toLowerCase().includes(q)

    // Akcje
    const actions: Item[] = [
      { key: 'new', icon: <PlusIcon size={15} />, label: 'Nowa rozmowa', run: onNewChat },
      { key: 'persona', icon: <SlidersIcon size={15} />, label: 'Ustaw personę rozmowy', run: onOpenPersona },
    ]
    out.push(...actions.filter(a => !q || match(a.label)))

    // Modele
    for (const m of models) {
      const meta = describeModel(m.name)
      if (q && !match(meta.label) && !match(m.name)) continue
      out.push({
        key: 'model:' + m.name,
        icon: <ModelIcon name={meta.icon} size={15} color={`rgb(${meta.accentRgb})`} />,
        label: `Model: ${meta.label}`,
        sub: m.name === current ? 'aktywny' : meta.tags.join(' · '),
        run: () => onSelectModel(m.name),
      })
    }

    // Rozmowy (po tytule i treści) + przeskok do konkretnej wiadomości
    const convs = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)
    for (const c of convs) {
      const inTitle = !q || match(c.title)
      const hits = q ? c.messages.filter(m => match(m.content)) : []
      if (q && !inTitle && hits.length === 0) continue
      if (q && onJumpTo) {
        for (const m of hits.slice(0, 3)) {
          out.push({
            key: `msg:${c.id}:${m.id}`,
            icon: <SearchIcon size={15} />,
            label: c.title,
            sub: snippet(m.content, q),
            run: () => onJumpTo(c.id, m.id),
          })
        }
      }
      if (inTitle || hits.length === 0) {
        out.push({
          key: 'conv:' + c.id,
          icon: <ChatIcon size={15} />,
          label: c.title,
          sub: `${c.messages.length} wiadomości`,
          run: () => onSelectConversation(c.id),
        })
      }
    }

    return out
  }, [q, models, conversations, current, onNewChat, onOpenPersona, onSelectModel, onSelectConversation, onJumpTo])

  useEffect(() => { setSel(0) }, [q])

  const activate = (i: number) => {
    const it = items[i]
    if (it) { it.run(); onClose() }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); activate(sel) }
    else if (e.key === 'Escape') { e.preventDefault(); onClose() }
  }

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${sel}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [sel])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center p-4"
      style={{ background: 'rgba(28,24,20,0.4)', paddingTop: '12vh' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        onClick={e => e.stopPropagation()}
        className="w-full rounded-xl overflow-hidden"
        style={{
          maxWidth: 520,
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)', boxShadow: '0 24px 70px rgba(28,24,20,0.2)',
        }}
      >
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--ink-faint)', display: 'inline-flex' }}><SearchIcon size={15} /></span>
          <input
            value={query}
            autoFocus
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Szukaj rozmów, zmień model, wykonaj akcję…"
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: 'var(--ink)' }}
          />
          <kbd style={{ fontSize: 10, color: 'var(--ink-faint)', border: '1px solid var(--border-strong)', borderRadius: 4, padding: '1px 5px' }}>Esc</kbd>
        </div>

        <div ref={listRef} className="overflow-y-auto p-1.5" style={{ maxHeight: '50vh' }}>
          {items.length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: 'var(--ink-faint)' }}>Brak wyników</p>
          )}
          {items.map((it, i) => (
            <button
              key={it.key}
              data-idx={i}
              onMouseEnter={() => setSel(i)}
              onClick={() => activate(i)}
              className="w-full flex items-center gap-2.5 text-left rounded-xl px-3 py-2"
              style={{ background: i === sel ? 'var(--accent-soft)' : 'transparent' }}
            >
              <span style={{ width: 20, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>{it.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm truncate" style={{ color: 'var(--ink)' }}>{it.label}</span>
                {it.sub && <span className="block text-xs truncate" style={{ color: 'var(--ink-faint)' }}>{it.sub}</span>}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
