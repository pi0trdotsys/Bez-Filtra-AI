import { useState } from 'react'
import { motion } from 'framer-motion'
import { fetchToken } from '@/api/chat'

interface LoginScreenProps {
  onLogin: () => void
  notice?: string | null
}

export function LoginScreen({ onLogin, notice }: LoginScreenProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const token = await fetchToken(password)
      localStorage.setItem('token', token)
      onLogin()
    } catch {
      setError('Nieprawidłowe hasło')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--bg)'}}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm mx-4"
      >
        <div className="text-center mb-9">
          <div
            className="inline-flex items-center justify-center mb-6"
            style={{ width: 44, height: 44, borderRadius: 12, border: '2px solid var(--accent)' }}
          >
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)' }} />
          </div>
          <h1 className="serif text-4xl tracking-tight mb-2" style={{ fontWeight: 700, color: 'var(--ink)' }}>
            Bez Filtra
          </h1>
          <p style={{ color: 'var(--ink-soft)' }} className="text-sm">
            Odpowiedź na każde pytanie
          </p>
          <p
            className="mt-5"
            style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}
          >
            bez cenzury · bez tematów tabu
          </p>
        </div>

        {notice && !error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="text-sm text-center mb-4 rounded-lg px-3 py-2"
            style={{ color: '#B7791F', background: '#FBF0D9', border: '1px solid #EFD9A7' }}
          >
            ⏳ {notice}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Hasło"
            className="w-full rounded-lg px-4 py-3 text-sm outline-none"
            style={{
              background:'var(--surface)',
              border:'1px solid var(--border-strong)',
              color:'var(--ink)',
            }}
            autoFocus
          />
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-center" style={{ color: '#C0392B' }}>
              {error}
            </motion.p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-lg py-3 text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{background:'var(--accent)',color:'#fff'}}
          >
            {loading ? 'Logowanie...' : 'Wejdź'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
