import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@/hooks/useChat'
import { useHealth } from '@/hooks/useHealth'
import { MessageBubble } from './MessageBubble'
import { Sidebar } from './Sidebar'
import { PersonaPanel } from './PersonaPanel'
import { CommandPalette } from './CommandPalette'
import { AdminPanel } from './AdminPanel'
import { useCompletionNotify } from '@/hooks/useCompletionNotify'
import { useModels } from '@/hooks/useModels'
import { ModelSwitchFX } from './ModelSwitchFX'
import { ThinkingBars } from './ThinkingIndicator'
import {
  loadConversations,
  saveConversations,
  emptyConversation,
  deriveTitle,
  downloadConversation,
  type Conversation,
} from '@/lib/conversations'
import { describeModel } from '@/lib/models'
import { getStoredTheme, toggleTheme, type Theme } from '@/lib/theme'
import { ModelIcon, SearchIcon, SlidersIcon, TrashIcon, ChartIcon, BatteryIcon, DropletIcon, SunIcon, MoonIcon, AutoIcon, ExportIcon, FlameIcon, BombIcon, SkullIcon, BanIcon } from './Icons'

// Zanim /api/models odpowie (albo gdy backend jest niedostępny) - awaryjny model,
// zgodny z DEFAULT_MODEL w backend/src/index.ts. Realna lista wyboru to zawsze
// to, co faktycznie pobrane w Ollamie (patrz useModels/`/api/models`).
const FALLBACK_MODEL = 'huihui_ai/qwen3-abliterated:8b'

const formatTime = (ms: number) => {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const formatTokens = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`)

// Polska odmiana słowa "token"
const plTokens = (n: number) => {
  if (n === 1) return 'token'
  const d = n % 10, h = n % 100
  return d >= 2 && d <= 4 && !(h >= 12 && h <= 14) ? 'tokeny' : 'tokenów'
}

// Komunikaty statusu - eskalują z czasem jak u Claude'a
const THINKING_STEPS: { t: number; msg: string }[] = [
  { t: 4,   msg: 'Przetwarzam pytanie…' },
  { t: 10,  msg: 'Analizuję temat…' },
  { t: 22,  msg: 'Szukam najlepszej odpowiedzi…' },
  { t: 45,  msg: 'Składam myśli w całość…' },
  { t: 80,  msg: 'Zagłębiam się w szczegóły…' },
  { t: 130, msg: 'Finalizuję odpowiedź…' },
  { t: 200, msg: 'Już prawie gotowe…' },
]
const WRITING_STEPS: { t: number; msg: string }[] = [
  { t: 5,   msg: 'Piszę odpowiedź…' },
  { t: 20,  msg: 'Rozwijam myśl…' },
  { t: 50,  msg: 'Dobieram słowa…' },
  { t: 100, msg: 'Kończę odpowiedź…' },
]
const thinkingStatus = (elapsedMs: number, writing: boolean) => {
  const s = elapsedMs / 1000
  const steps = writing ? WRITING_STEPS : THINKING_STEPS
  for (const step of steps) if (s < step.t) return step.msg
  return writing ? 'Zaraz skończę…' : 'Głęboka analiza w toku…'
}

const EXAMPLE_PROMPTS = [
  { icon: <FlameIcon size={16} />, text: 'Powiedz bez politycznej poprawności, co naprawdę sądzisz o mediach społecznościowych' },
  { icon: <BombIcon size={16} />, text: 'Podaj najmocniejsze argumenty przeciwko powszechnej opinii w wybranym kontrowersyjnym temacie' },
  { icon: <SkullIcon size={16} />, text: 'Napisz mroczne opowiadanie z brutalnym zakończeniem' },
  { icon: <SlidersIcon size={16} />, text: 'Wciel się w cynicznego, bezkompromisowego rozmówcę i przywitaj się' },
  { icon: <BanIcon size={16} />, text: 'Wyjaśnij jakiś temat tabu, który większość AI zwykle omija' },
]

export function ChatWindow({ onLogout }: { onLogout: () => void }) {
  const [boot] = useState(loadConversations)
  const [conversations, setConversations] = useState<Conversation[]>(boot.conversations)
  const [activeId, setActiveId] = useState<string>(boot.activeId)
  const initialMessages = boot.conversations.find(c => c.id === boot.activeId)!.messages

  const { models, defaultModel } = useModels()
  const effectiveDefault = defaultModel || FALLBACK_MODEL

  const [selectedModel, setSelectedModel] = useState(
    () => boot.conversations.find(c => c.id === boot.activeId)?.model || localStorage.getItem('ai-chat-model') || FALLBACK_MODEL
  )

  // Gdy dojedzie realna lista pobranych modeli: jeśli zapisany wybór już nie
  // istnieje w Ollamie (usunięty/nigdy nie pobrany), wróć do domyślnego.
  useEffect(() => {
    if (models.length === 0) return
    if (!models.some(m => m.name === selectedModel)) {
      setSelectedModel(effectiveDefault)
      localStorage.setItem('ai-chat-model', effectiveDefault)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models])

  const activeConv = conversations.find(c => c.id === activeId)
  const {
    messages, setMessages, isStreaming, error, sendMessage, regenerate,
    editMessage, stop, clearMessages, elapsedMs, estimateMs,
    sessionTokens, sessionEnergyKWh, sessionWaterL,
  } = useChat(initialMessages, selectedModel, activeConv?.systemPrompt, activeId)

  const handleSelectModel = (model: string) => {
    setSelectedModel(model)
    localStorage.setItem('ai-chat-model', model)
    setConversations(prev => prev.map(c => (c.id === activeId ? { ...c, model } : c)))
  }

  // Subtelny akcent koloru zależny od wybranego modelu (fiolet=Qwen, róż=Dolphin,
  // czerwień=DeepSeek, bursztyn=Bielik...) - patrz accentRgb w lib/models.ts.
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-rgb', describeModel(selectedModel).accentRgb)
  }, [selectedModel])

  const health = useHealth()
  useCompletionNotify(isStreaming)

  const [input, setInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('ai-chat-sidebar-collapsed') === '1')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [modelPickerOpen, setModelPickerOpen] = useState(false)
  const [atBottom, setAtBottom] = useState(true)
  const [theme, setTheme] = useState<Theme>(getStoredTheme)

  const handleToggleTheme = () => setTheme(toggleTheme())

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev
      localStorage.setItem('ai-chat-sidebar-collapsed', next ? '1' : '0')
      return next
    })
  }

  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isNearBottom = () => {
    const el = scrollRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior })
    setAtBottom(true)
  }

  const liveTokens = isStreaming && messages[messages.length - 1]?.role === 'assistant'
    ? Math.max(1, Math.round((messages[messages.length - 1].content?.length ?? 0) / 4))
    : 0

  useEffect(() => {
    if (isNearBottom()) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(o => !o)
      } else if (e.key === 'Escape' && isStreaming) {
        stop()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isStreaming, stop])

  useEffect(() => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== activeId) return c
        const changed =
          c.messages.length !== messages.length ||
          (messages.length > 0 && c.messages[c.messages.length - 1]?.content !== messages[messages.length - 1]?.content)
        return {
          ...c,
          messages,
          title: c.title === 'Nowa rozmowa' ? deriveTitle(messages) : c.title,
          updatedAt: changed ? Date.now() : c.updatedAt,
        }
      })
    )
  }, [messages, activeId])

  useEffect(() => {
    if (!isStreaming) saveConversations(conversations, activeId)
  }, [conversations, activeId, isStreaming])

  const handleSelect = (id: string) => {
    if (id === activeId) return
    const conv = conversations.find(c => c.id === id)
    if (!conv) return
    setActiveId(id)
    setMessages(conv.messages)
    setSelectedModel(conv.model || localStorage.getItem('ai-chat-model') || FALLBACK_MODEL)
    setSidebarOpen(false)
  }

  const handleRename = (id: string, title: string) => {
    setConversations(prev => prev.map(c => (c.id === id ? { ...c, title } : c)))
  }

  const handleTogglePin = (id: string) => {
    setConversations(prev => prev.map(c => (c.id === id ? { ...c, pinned: !c.pinned } : c)))
  }

  const handleExport = () => {
    if (activeConv) downloadConversation(activeConv)
  }

  const [showPersona, setShowPersona] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const handlePersonaChange = (text: string) => {
    setConversations(prev => prev.map(c => (c.id === activeId ? { ...c, systemPrompt: text.trim() || undefined } : c)))
  }

  const handleNew = () => {
    const conv = { ...emptyConversation(), model: selectedModel }
    setConversations(prev => [conv, ...prev])
    setActiveId(conv.id)
    setMessages([])
    setSidebarOpen(false)
  }

  const handleDelete = (id: string) => {
    const remaining = conversations.filter(c => c.id !== id)
    const list = remaining.length > 0 ? remaining : [emptyConversation()]
    setConversations(list)
    if (id === activeId) {
      const next = list[0]
      setActiveId(next.id)
      setMessages(next.messages)
    }
  }

  const requestNotifyOnce = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try { Notification.requestPermission() } catch { /* ignorujemy */ }
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    requestNotifyOnce()
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await sendMessage(text)
  }

  const handleExample = (text: string) => {
    if (isStreaming) return
    requestNotifyOnce()
    sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const handleInputNative = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget
    setInput(ta.value)
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  const statusColor =
    health.status === 'checking' ? '#9ca3af'
    : health.ollama === 'down' ? '#ef4444'
    : !health.modelLoaded ? '#f59e0b'
    : '#22c55e'

  return (
    <div className="relative flex h-screen w-screen overflow-hidden" style={{background:'var(--bg)'}}>
      {/* Subtelny sygnał zmiany modelu (patrz ModelSwitchFX.tsx). */}
      <ModelSwitchFX triggerKey={selectedModel} />

      <motion.div
        className="hidden md:flex h-full overflow-hidden"
        initial={false}
        animate={{ width: sidebarCollapsed ? 0 : 220 }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        style={{ flexShrink: 0 }}
      >
        <Sidebar
          isOpen={true}
          onClose={() => {}}
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onNew={handleNew}
          onDelete={handleDelete}
          onRename={handleRename}
          onTogglePin={handleTogglePin}
          onLogout={onLogout}
          onOpenAdmin={() => setShowAdmin(true)}
        />
      </motion.div>

      <div className="md:hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onNew={handleNew}
          onDelete={handleDelete}
          onRename={handleRename}
          onTogglePin={handleTogglePin}
          onLogout={onLogout}
          onOpenAdmin={() => setShowAdmin(true)}
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        {/* ── Nagłówek ── */}
        <div
          className="flex items-center justify-between gap-2 px-3 sm:px-4 py-3 flex-shrink-0"
          style={{borderBottom:'1px solid var(--border)',background:'var(--surface)'}}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex flex-col gap-1 p-1"
              aria-label="Menu"
            >
              {[0,1,2].map(i => (
                <span key={i} style={{display:'block',width:18,height:1.5,borderRadius:2,background:'var(--ink-soft)'}} />
              ))}
            </button>
            <button
              onClick={toggleSidebar}
              className="hidden md:flex items-center justify-center rounded-lg"
              style={{width:30,height:30,color:'var(--ink-soft)',border:'1px solid var(--border)'}}
              title={sidebarCollapsed ? 'Pokaż panel' : 'Ukryj panel'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="9" y1="4" x2="9" y2="20" />
              </svg>
            </button>
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden md:flex items-center gap-1.5 rounded-lg px-2.5 h-[30px]"
              style={{color:'var(--ink-soft)',border:'1px solid var(--border)',fontSize:11}}
            >
              <SearchIcon size={13} /> <span>Szukaj</span><kbd style={{fontSize:10,opacity:0.6}}>⌘K</kbd>
            </button>
          </div>

          {/* Picker modelu */}
          <div className="relative">
            {/* Puls potwierdzenia - pierścień wychodzi z przycisku i gaśnie,
                dokładnie stąd bierze się reszta efektu (ModelSwitchFX). */}
            <motion.span
              key={selectedModel + '-ring'}
              className="absolute inset-0 rounded-full pointer-events-none"
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 1.9 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              style={{ border: '1.5px solid var(--accent)' }}
            />
            <button
              onClick={() => setModelPickerOpen(o => !o)}
              className="flex items-center gap-2 text-xs rounded-full pl-3 pr-2.5 py-1.5"
              style={{background:'var(--surface)',border:'1px solid var(--border-strong)',color:'var(--ink)',transition:'border-color 0.3s ease'}}
            >
              <motion.span
                animate={health.status === 'checking' ? { opacity: [0.4,1,0.4] } : { opacity: 1 }}
                transition={{ duration: 1.2, repeat: health.status === 'checking' ? Infinity : 0 }}
                style={{display:'inline-block',width:7,height:7,borderRadius:'50%',background:statusColor,flexShrink:0}}
              />
              <span style={{fontWeight:500,whiteSpace:'nowrap',display:'inline-flex',alignItems:'center',gap:6}}><ModelIcon name={describeModel(selectedModel).icon} size={16} color={`rgb(${describeModel(selectedModel).accentRgb})`} /> {describeModel(selectedModel).label}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.5,flexShrink:0}}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <AnimatePresence>
              {modelPickerOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setModelPickerOpen(false)} />
                  <motion.div
                    initial={{opacity:0,y:-6,scale:0.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-6,scale:0.97}}
                    transition={{type:'spring',stiffness:340,damping:28}}
                    className="absolute left-1/2 z-40 mt-2 rounded-xl overflow-hidden"
                    style={{
                      top:'100%', transform:'translateX(-50%)', minWidth:260,
                      background:'var(--surface)',
                      border:'1px solid var(--border-strong)', boxShadow:'0 16px 48px rgba(28,24,20,0.18)',
                    }}
                  >
                    <div className="px-4 pt-3 pb-2" style={{borderBottom:'1px solid var(--border)'}}>
                      <p style={{fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--ink-faint)'}}>Wybierz model</p>
                    </div>
                    {models.length === 0 && (
                      <p className="px-4 py-4 text-center" style={{fontSize:12,color:'var(--ink-faint)'}}>
                        Ładowanie listy modeli…
                      </p>
                    )}
                    {models.map(({ name }) => {
                      const m = describeModel(name)
                      const active = name === selectedModel
                      return (
                        <button
                          key={name}
                          onClick={() => { handleSelectModel(name); setModelPickerOpen(false) }}
                          className="w-full flex items-start gap-3 px-4 py-3 text-left"
                          style={{background: active ? 'var(--accent-soft)' : 'transparent', borderBottom:'1px solid var(--border)'}}
                        >
                          <span style={{marginTop:3,display:'inline-flex'}}><ModelIcon name={m.icon} size={20} color={`rgb(${m.accentRgb})`} /></span>
                          <span className="flex-1 min-w-0">
                            <span className="flex items-center gap-2">
                              <span style={{fontSize:13,fontWeight:600,color:'var(--ink)'}}>{m.label}</span>
                              {active && <span style={{fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--accent-ink)',background:'var(--accent-soft)',borderRadius:4,padding:'1px 5px'}}>aktywny</span>}
                            </span>
                            <span style={{fontSize:12,color:'var(--ink-faint)',lineHeight:1.4,display:'block',marginTop:2}}>{m.desc}</span>
                          </span>
                        </button>
                      )
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleTheme}
              className="flex items-center justify-center rounded-lg"
              style={{ width: 30, height: 30, color: 'var(--ink-soft)', border: '1px solid var(--border)' }}
              title={theme === 'light' ? 'Motyw: jasny (kliknij: ciemny)' : theme === 'dark' ? 'Motyw: ciemny (kliknij: auto)' : 'Motyw: auto (kliknij: jasny)'}
              aria-label="Przełącz motyw"
            >
              {theme === 'light' ? <MoonIcon size={15} /> : theme === 'dark' ? <AutoIcon size={15} /> : <SunIcon size={15} />}
            </button>
            {sessionTokens > 0 && (
              <span
                className="hidden sm:flex items-center gap-2 text-xs"
                style={{color:'var(--ink-faint)',fontFamily:'ui-monospace,monospace'}}
                title={`Sesja: ${formatTokens(sessionTokens)} tok · ${(sessionEnergyKWh*1000).toFixed(1)} Wh · ${(sessionWaterL*1000).toFixed(0)} ml`}
              >
                <span style={{display:'inline-flex',alignItems:'center',gap:4}}><ChartIcon size={12} /> {formatTokens(sessionTokens)} tok</span>
                <span style={{display:'inline-flex',alignItems:'center',gap:4}}><BatteryIcon size={12} /> {(sessionEnergyKWh*1000).toFixed(1)} Wh</span>
                <span style={{display:'inline-flex',alignItems:'center',gap:4}}><DropletIcon size={12} /> {(sessionWaterL*1000).toFixed(0)} ml</span>
              </span>
            )}
            {health.gpuPercent !== null && (
              <span
                className="hidden md:flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1"
                style={{background:'var(--surface-2)',border:'1px solid var(--border)',fontFamily:'ui-monospace,monospace'}}
                title={`GPU: ${health.vramMB} MB · CPU: ${health.cpuPercent}%`}
              >
                <span style={{color:'var(--ink-soft)',fontWeight:600}}>GPU {health.gpuPercent}%</span>
                <span style={{color:'var(--border-strong)'}}>·</span>
                <span style={{color:'var(--ink-faint)'}}>CPU {health.cpuPercent}%</span>
              </span>
            )}
            {health.modelLoading && (
              <motion.span
                animate={{opacity:[0.5,1,0.5]}} transition={{duration:1.4,repeat:Infinity}}
                className="hidden md:flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1"
                style={{background:'#FBF0D9',border:'1px solid #EFD9A7',color:'#B7791F'}}
              >
                Ładowanie modelu…
              </motion.span>
            )}
            <button
              onClick={handleExport}
              className="text-xs flex items-center gap-1"
              style={{color:'var(--ink-faint)'}}
              title="Eksportuj rozmowę do Markdown"
            >
              <ExportIcon size={13} /> Eksport
            </button>
            <button
              onClick={() => setShowPersona(true)}
              className="text-xs flex items-center gap-1"
              style={{color: activeConv?.systemPrompt ? 'var(--accent)' : 'var(--ink-faint)'}}
              title="Ustaw personę"
            >
              <SlidersIcon size={13} /> Persona{activeConv?.systemPrompt ? ' •' : ''}
            </button>
            <button onClick={clearMessages} className="text-xs flex items-center gap-1" style={{color:'var(--ink-faint)'}}>
              <TrashIcon size={13} /> Wyczyść
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showPersona && (
            <PersonaPanel
              value={activeConv?.systemPrompt ?? ''}
              onSave={(text) => { handlePersonaChange(text); setShowPersona(false) }}
              onClose={() => setShowPersona(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
        </AnimatePresence>

        <AnimatePresence>
          {paletteOpen && (
            <CommandPalette
              onClose={() => setPaletteOpen(false)}
              conversations={conversations}
              models={models}
              selectedModel={selectedModel}
              defaultModel={effectiveDefault}
              onNewChat={handleNew}
              onSelectConversation={handleSelect}
              onSelectModel={handleSelectModel}
              onOpenPersona={() => setShowPersona(true)}
            />
          )}
        </AnimatePresence>

        <div
          ref={scrollRef}
          onScroll={() => setAtBottom(isNearBottom())}
          className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-5 flex flex-col gap-3.5 sm:gap-4 relative"
        >
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex items-center justify-center flex-1 min-h-48 px-2"
              >
                <div
                  className="max-w-md w-full text-center rounded-2xl px-5 sm:px-7 py-7 sm:py-8"
                  style={{
                    background:'var(--surface)',
                    border:'1px solid var(--border)',
                    boxShadow:'0 8px 40px rgba(28,24,20,0.06)',
                  }}
                >
                  <motion.div
                    animate={{ y: [0,-5,0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-flex items-center justify-center mb-5"
                    style={{width:44,height:44,borderRadius:12,border:'2px solid var(--accent)'}}
                  >
                    <div style={{width:12,height:12,borderRadius:'50%',background:'var(--accent)'}} />
                  </motion.div>
                  <h2 className="serif text-2xl tracking-tight mb-2.5" style={{fontWeight:700,color:'var(--ink)'}}>
                    Bez Filtra
                  </h2>
                  <p className="text-sm leading-relaxed mx-auto" style={{color:'var(--ink-soft)',maxWidth:340}}>
                    Odpowiem na każde pytanie i rozwieję każdą wątpliwość - bez tematów tabu, bez ostrzeżeń, bez oceniania.
                  </p>
                  <p className="mt-4" style={{fontSize:10,letterSpacing:'0.22em',color:'var(--ink-faint)',textTransform:'uppercase'}}>
                    bez cenzury · bez tematów tabu
                  </p>
                  <div className="flex flex-col gap-1.5 mt-7">
                    {EXAMPLE_PROMPTS.map((p, idx) => (
                      <motion.button
                        key={p.text}
                        onClick={() => handleExample(p.text)}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + idx * 0.06 }}
                        whileHover={{ x: 3, color: 'var(--ink)' }}
                        className="text-left text-sm rounded-lg px-3 py-2 flex items-start gap-2"
                        style={{color:'var(--ink-soft)'}}
                      >
                        <span>{p.icon}</span><span>{p.text}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
                isLast={i === messages.length - 1}
                onRegenerate={regenerate}
                onEdit={editMessage}
              />
            ))}
          </AnimatePresence>

          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-1.5 py-1"
            >
              <div
                className="flex items-center gap-2.5 text-xs rounded-full pl-3 pr-3.5 py-2"
                style={{background:'var(--surface)',border:'1px solid var(--border-strong)',color:'var(--ink-soft)'}}
              >
                <ThinkingBars height={13} />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={thinkingStatus(elapsedMs, liveTokens > 0)}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    style={{ fontWeight: 500 }}
                  >
                    {thinkingStatus(elapsedMs, liveTokens > 0)}
                  </motion.span>
                </AnimatePresence>
                <span style={{color:'var(--border-strong)'}}>·</span>
                <span style={{fontFamily:'ui-monospace,monospace',fontVariantNumeric:'tabular-nums',color:'var(--ink-faint)'}}>
                  {formatTime(elapsedMs)}
                </span>
                {liveTokens > 0 && (
                  <>
                    <span style={{color:'var(--border-strong)'}}>·</span>
                    <span style={{fontVariantNumeric:'tabular-nums'}}>
                      <span style={{fontWeight:600,color:'var(--accent)'}}>{liveTokens}</span>{' '}
                      <span style={{color:'var(--ink-soft)'}}>{plTokens(liveTokens)}</span>
                    </span>
                  </>
                )}
              </div>
              <p style={{fontSize:10,color:'var(--ink-faint)'}}>
                {estimateMs > 0
                  ? `Zwykle zajmuje ~${formatTime(estimateMs)} · odpowiedź na pewno przyjdzie`
                  : 'Trudniejsze pytania mogą potrwać dłużej - odpowiedź na pewno przyjdzie'}
              </p>
            </motion.div>
          )}

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-center" style={{ color: '#C0392B' }}>
              {error}
            </motion.p>
          )}
          <div ref={bottomRef} />
        </div>

        <AnimatePresence>
          {!atBottom && (
            <motion.button
              type="button"
              onClick={() => scrollToBottom()}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Przewiń na dół"
              className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center rounded-full"
              style={{bottom:88,width:36,height:36,background:'var(--surface)',border:'1px solid var(--border-strong)',boxShadow:'0 6px 20px rgba(28,24,20,0.15)',color:'var(--ink)'}}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        <div
          className="px-3 sm:px-4 pt-2 flex-shrink-0 safe-bottom"
          style={{borderTop:'1px solid var(--border)',background:'var(--surface)'}}
        >
          <div
            className="flex gap-2 items-end rounded-xl px-3 py-2"
            style={{background:'var(--surface)',border:'1px solid var(--border-strong)'}}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onInput={handleInputNative}
              onKeyDown={handleKeyDown}
              placeholder="Zapytaj o cokolwiek, bez ograniczeń…"
              rows={1}
              disabled={isStreaming}
              className="flex-1 bg-transparent border-none outline-none text-sm resize-none"
              style={{color:'var(--ink)',lineHeight:'1.5',maxHeight:120,fontFamily:'inherit'}}
            />
            {isStreaming ? (
              <motion.button
                onClick={stop}
                aria-label="Zatrzymaj generowanie"
                title="Zatrzymaj (Esc)"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="flex-shrink-0 flex items-center justify-center rounded-xl"
                style={{width:34,height:34,background:'var(--ink)',border:'none'}}
              >
                <span style={{display:'block',width:11,height:11,borderRadius:3,background:'#fff'}} />
              </motion.button>
            ) : (
              <button
                onClick={() => handleSubmit()}
                disabled={!input.trim()}
                className="flex-shrink-0 flex items-center justify-center rounded-xl transition-opacity disabled:opacity-40"
                style={{width:34,height:34,background:'var(--accent)',border:'none'}}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                </svg>
              </button>
            )}
          </div>
          <p className="text-center mt-1.5" style={{fontSize:10,color:'var(--ink-faint)'}}>
            {isStreaming ? 'Esc = zatrzymaj generowanie' : 'Enter = wyślij · Shift+Enter = nowa linia'}
          </p>
        </div>
      </div>
    </div>
  )
}
