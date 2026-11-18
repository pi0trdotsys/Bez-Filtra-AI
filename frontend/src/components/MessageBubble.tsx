import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { Message } from '@/types/chat'
import { Markdown } from './Markdown'
import { ThinkingBars } from './ThinkingIndicator'
import {
  UserIcon, SparkGlyph, ChartIcon, BoltGlyph, ClockIcon, BatteryIcon, DropletIcon,
  CopyIcon, RefreshIcon, EditIcon, CheckIcon, ModelIcon,
} from './Icons'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
  isLast?: boolean
  onRegenerate?: () => void
  onRegenerateWithModel?: (model: string) => void
  models?: { name: string; label: string }[]
  onEdit?: (id: string, content: string) => void
  highlighted?: boolean
}

const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })

function IconButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors"
      style={{ color: 'var(--ink-faint)', fontSize: 10 }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-faint)')}
    >
      {children}
    </button>
  )
}

function ThinkingBlock({ text, live }: { text: string; live: boolean }) {
  const [open, setOpen] = useState(false)
  const show = live || open
  return (
    <div className="thinking">
      <button type="button" className="thinking-toggle" onClick={() => setOpen(o => !o)}>
        <span className="thinking-caret">{show ? '▾' : '▸'}</span> rozumowanie
      </button>
      {show && <div className="thinking-body">{text}</div>}
    </div>
  )
}

export function MessageBubble({ message, isStreaming, isLast, onRegenerate, onRegenerateWithModel, models, onEdit, highlighted }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(message.content)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* brak schowka */ }
  }

  const startEdit = () => { setDraft(message.content); setEditing(true) }
  const saveEdit = () => {
    const text = draft.trim()
    setEditing(false)
    if (text && text !== message.content) onEdit?.(message.id, text)
  }

  return (
    <motion.div
      id={`msg-${message.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`group flex gap-2 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={highlighted ? { outline: '2px solid var(--accent)', outlineOffset: '3px', borderRadius: 10 } : undefined}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-full text-base"
        style={{
          width: 28, height: 28,
          background: isUser ? 'var(--surface-2)' : 'var(--surface)',
          border: isUser ? '1px solid var(--border-strong)' : '1px solid rgba(var(--accent-rgb),0.5)',
          color: isUser ? 'var(--ink-soft)' : 'rgb(var(--accent-rgb))',
        }}
      >
        {isUser ? <UserIcon size={15} /> : <SparkGlyph size={14} />}
      </div>

      <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className="px-3 py-2 text-sm leading-relaxed w-full"
          style={{
            borderRadius: isUser ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
            background: 'var(--surface)',
            border: isUser ? '1px solid var(--border-strong)' : '1px solid var(--border)',
            color: 'rgba(var(--ink-rgb),0.9)',
          }}
        >
          {editing ? (
            <div className="flex flex-col gap-2" style={{ minWidth: 220 }}>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit() }
                  if (e.key === 'Escape') setEditing(false)
                }}
                autoFocus
                rows={Math.min(8, draft.split('\n').length + 1)}
                className="bg-transparent border-none outline-none text-sm resize-none w-full"
                style={{ color: 'var(--ink)', lineHeight: '1.5', fontFamily: 'inherit' }}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditing(false)} className="text-xs px-2 py-1 rounded-md" style={{ color: 'var(--ink-soft)' }}>
                  Anuluj
                </button>
                <button
                  onClick={saveEdit}
                  className="text-xs px-2.5 py-1 rounded-md"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  Zapisz i wyślij
                </button>
              </div>
            </div>
          ) : isStreaming && !message.content ? (
            <>
              {message.thinking && <ThinkingBlock text={message.thinking} live={!!isStreaming} />}
              <span className="flex items-center py-0.5">
                <ThinkingBars />
              </span>
            </>
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : isStreaming ? (
            <>
              {message.thinking && <ThinkingBlock text={message.thinking} live={!!isStreaming} />}
              <Markdown content={message.content} />
            </>
          ) : (
            <>
              {message.thinking && <ThinkingBlock text={message.thinking} live={!!isStreaming} />}
              <Markdown content={message.content} />

              {/* Statystyki */}
              {message.stats && (() => {
                const s = message.stats
                const interrupted = (s as any).interrupted === true
                const parts: { icon: ReactNode; value: string; title: string }[] = [
                  { icon: <ChartIcon size={11} />, value: `${s.promptTok} → ${s.genTok} tok`, title: 'tokeny wejściowe → wygenerowane' },
                  { icon: <BoltGlyph size={10} />, value: `${s.tps.toString().replace('.', ',')} tok/s`, title: 'prędkość generowania' },
                ]
                if (s.responseTimeMs != null)
                  parts.push({ icon: <ClockIcon size={11} />, value: `${(s.responseTimeMs / 1000).toFixed(1)} s`, title: 'czas odpowiedzi' })
                if (s.energyKWh != null)
                  parts.push({ icon: <BatteryIcon size={11} />, value: `${(s.energyKWh * 1000).toFixed(2)} Wh`, title: 'zużycie energii' })
                if (s.waterL != null)
                  parts.push({ icon: <DropletIcon size={11} />, value: `${(s.waterL * 1000).toFixed(1)} ml`, title: 'zużycie wody (chłodzenie)' })
                return (
                  <div className="mt-2 pt-1.5 flex flex-wrap gap-x-3 gap-y-1 items-center" style={{ borderTop: '1px solid var(--border)' }}>
                    {interrupted && (
                      <span style={{ fontSize: 10, color: '#C0392B', letterSpacing: '0.04em' }}>
                        przerwano
                      </span>
                    )}
                    {parts.map((p, i) => (
                      <span
                        key={i}
                        title={p.title}
                        className="flex items-center gap-1"
                        style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.01em' }}
                      >
                        <span style={{ display: 'inline-flex' }}>{p.icon}</span>
                        <span>{p.value}</span>
                      </span>
                    ))}
                  </div>
                )
              })()}
            </>
          )}
        </div>

        {/* Pasek akcji */}
        {!editing && !isStreaming && (
          <div
            className={`hover-actions flex items-center gap-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <span style={{ fontSize: 10, color: 'var(--ink-faint)' }}>{fmtTime(message.createdAt)}</span>
            {!isUser && message.content && (
              <IconButton onClick={copy} label={copied ? 'Skopiowano' : 'Kopiuj odpowiedź'}>
                {copied ? <><CheckIcon size={11} /> skopiowano</> : <><CopyIcon size={11} /> kopiuj</>}
              </IconButton>
            )}
            {!isUser && isLast && onRegenerate && (
              <IconButton onClick={onRegenerate} label="Wygeneruj odpowiedź od nowa"><RefreshIcon size={11} /> ponów</IconButton>
            )}
            {!isUser && isLast && onRegenerateWithModel && models && models.length > 1 && (
              <details className="regen-models">
                <summary title="Regeneruj innym modelem"><ModelIcon name="bot" size={11} /></summary>
                <div className="regen-list">
                  {models.map(m => (
                    <button key={m.name} type="button" onClick={() => onRegenerateWithModel(m.name)}>{m.label}</button>
                  ))}
                </div>
              </details>
            )}
            {isUser && onEdit && (
              <IconButton onClick={startEdit} label="Edytuj i wyślij ponownie"><EditIcon size={11} /> edytuj</IconButton>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
