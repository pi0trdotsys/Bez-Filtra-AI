import { useState } from 'react'
import { motion } from 'framer-motion'

interface PersonaPanelProps {
  value: string
  onSave: (text: string) => void
  onClose: () => void
}

const PRESETS = [
  { label: '👨‍💻 Programista', text: 'Jesteś doświadczonym programistą. Odpowiadaj konkretnie, z przykładami kodu i krótkim wyjaśnieniem. Wskazuj pułapki i lepsze rozwiązania.' },
  { label: '✍️ Pisarz', text: 'Jesteś kreatywnym pisarzem. Pisz barwnym, obrazowym językiem, dbaj o styl i rytm zdań.' },
  { label: '🎓 Nauczyciel', text: 'Jesteś cierpliwym nauczycielem. Tłumacz od podstaw, prostymi słowami, krok po kroku, z przykładami z życia.' },
  { label: '🧪 Ekspert', text: 'Jesteś wnikliwym ekspertem. Odpowiadaj szczegółowo i merytorycznie, podawaj niuanse i kontekst.' },
]

export function PersonaPanel({ value, onSave, onClose }: PersonaPanelProps) {
  const [text, setText] = useState(value)

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(28,24,20,0.4)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        onClick={e => e.stopPropagation()}
        className="w-full rounded-xl p-5"
        style={{
          maxWidth: 480,
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)', boxShadow: '0 20px 60px rgba(28,24,20,0.18)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span style={{ fontSize: 18 }}>🎭</span>
          <h2 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>Persona rozmowy</h2>
        </div>
        <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>
          Dodatkowe instrukcje, jak model ma się zachowywać w <strong style={{color:'var(--accent)'}}>tej</strong> rozmowie.
          Dotyczy tylko jej. Zostaw puste, by wrócić do domyślnego zachowania.
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setText(p.text)}
              className="text-xs rounded-full px-2.5 py-1 transition-colors"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--ink-soft)' }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
          rows={5}
          placeholder="Np. Jesteś sarkastycznym ekspertem od historii, który odpowiada zwięźle i z humorem…"
          className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none"
          style={{
            background: 'var(--surface)', border: '1px solid var(--border-strong)',
            color: 'var(--ink)', lineHeight: '1.5', fontFamily: 'inherit',
          }}
        />

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setText('')}
            className="text-xs px-2 py-1"
            style={{ color: 'var(--ink-faint)' }}
          >
            Wyczyść
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-sm px-3 py-1.5 rounded-lg" style={{ color: 'var(--ink-soft)' }}>
              Anuluj
            </button>
            <button
              onClick={() => onSave(text)}
              className="text-sm px-4 py-1.5 rounded-lg font-semibold"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Zapisz
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
