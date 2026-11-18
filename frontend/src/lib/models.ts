// Kuratorskie opisy modeli - krótko, prosto, do czego się nadaje.
// Dopasowanie po prefiksie nazwy (np. "llama3.1:8b" -> "llama3.1").
import { notifyUnauthorized } from './session'

export interface ModelMeta {
  label: string
  desc: string
  tags: string[]
  greeting: string
  icon: string
  // "R,G,B" - używane jako rgba(var(--accent-rgb), alpha) w całym UI,
  // żeby subtelny akcent koloru zmieniał się razem z wybranym modelem.
  accentRgb: string
}

interface ModelRule {
  match: string
  meta: ModelMeta
}

// Kolory rodzin modeli - stonowane, „drukowe" (używane wyłącznie jako mała
// kropka/odznaka modelu, nie jako tint całego UI):
const OCHRA = '204,94,35'   // Qwen
const TEAL = '19,124,110'   // Dolphin
const BRICK = '177,60,45'   // DeepSeek
const GOLD = '178,124,26'   // Bielik
const BROWN = '150,100,60'  // Llama
const STEEL = '58,96,143'   // Mistral

const RULES: ModelRule[] = [
  {
    match: 'huihui_ai/qwen3-abliterated:8b',
    meta: {
      label: 'Qwen 3 (8B)',
      desc: 'Domyślny model - najlepszy balans jakości do szybkości na CPU. Dobrze radzi sobie po polsku.',
      tags: ['polecany', 'bez cenzury'],
      greeting: 'Cześć! Jestem Qwenem 3 - szybkim i bystrym. Pytaj o cokolwiek.',
      icon: 'sparkles',
      accentRgb: OCHRA,
    },
  },
  {
    match: 'huihui_ai/qwen3-abliterated:4b',
    meta: {
      label: 'Qwen 3 (4B)',
      desc: 'Lekki i szybki - awaryjny model, gdy 8B się nie załaduje albo chcesz maksymalnej prędkości.',
      tags: ['szybki', 'bez cenzury'],
      greeting: 'Cześć! Jestem lekkim Qwenem 3 - odpowiadam błyskawicznie.',
      icon: 'bolt',
      accentRgb: OCHRA,
    },
  },
  {
    match: 'huihui_ai/qwen3-abliterated:14b',
    meta: {
      label: 'Qwen 3 (14B)',
      desc: 'Więcej mocy na trudne tematy - wolniejszy, potrzebuje ok. 9 GB RAM.',
      tags: ['najmądrzejszy', 'bez cenzury'],
      greeting: 'Cześć! Jestem najmocniejszym Qwenem 3 - rzucaj trudne pytania.',
      icon: 'cpu',
      accentRgb: OCHRA,
    },
  },
  {
    match: 'huihui_ai/qwen3-abliterated:32b',
    meta: {
      label: 'Qwen 3 (32B)',
      desc: 'Maksimum jakości - wymaga ok. 20 GB RAM i cierpliwości na CPU.',
      tags: ['najmądrzejszy', 'bez cenzury'],
      greeting: 'Cześć! Jestem największym modelem - do najtrudniejszych zadań.',
      icon: 'cpu',
      accentRgb: OCHRA,
    },
  },
  {
    match: 'huihui_ai/qwen3-abliterated',
    meta: {
      label: 'Qwen 3',
      desc: 'Najnowsza generacja Qwena - bystre, naturalne odpowiedzi.',
      tags: ['bez cenzury'],
      greeting: 'Cześć! Jestem Qwenem 3. Pytaj o cokolwiek.',
      icon: 'sparkles',
      accentRgb: OCHRA,
    },
  },
  {
    match: 'huihui_ai/dolphin3-abliterated',
    meta: {
      label: 'Dolphin 3',
      desc: 'Swobodny i bezpośredni, dobrze mówi po polsku. Dobry do każdej rozmowy.',
      tags: ['po polsku', 'bez cenzury'],
      greeting: 'Hej! Odpowiem swobodnie na każdy temat. Zaczynajmy.',
      icon: 'waves',
      accentRgb: TEAL,
    },
  },
  {
    match: 'dolphin3',
    meta: {
      label: 'Dolphin 3',
      desc: 'Swobodny i bezpośredni, dobrze mówi po polsku.',
      tags: ['po polsku', 'bez cenzury'],
      greeting: 'Hej! Odpowiem swobodnie na każdy temat. Zaczynajmy.',
      icon: 'waves',
      accentRgb: TEAL,
    },
  },
  {
    match: 'huihui_ai/deepseek-r1-abliterated',
    meta: {
      label: 'DeepSeek R1',
      desc: 'Rozumujący - myśli krok po kroku przed odpowiedzią. Dobry do logiki, matematyki i zagadek.',
      tags: ['rozumowanie', 'bez cenzury'],
      greeting: 'Cześć! Zanim odpowiem, przemyślę problem krok po kroku. Rzuć mi coś trudnego.',
      icon: 'flame',
      accentRgb: BRICK,
    },
  },
  {
    match: 'huihui_ai/qwen2.5-abliterate:14b',
    meta: {
      label: 'Qwen 2.5 (14B)',
      desc: 'Poprzednia generacja - solidna, ale Qwen 3 jest lepszy w tym samym rozmiarze.',
      tags: ['bez cenzury'],
      greeting: 'Cześć! Jestem Qwenem 2.5 - poprzednią, ale wciąż solidną generacją.',
      icon: 'cpu',
      accentRgb: OCHRA,
    },
  },
  {
    match: 'huihui_ai/qwen2.5-abliterate',
    meta: {
      label: 'Qwen 2.5',
      desc: 'Poprzednia generacja Qwena.',
      tags: ['bez cenzury'],
      greeting: 'Cześć! Jestem Qwenem 2.5.',
      icon: 'cpu',
      accentRgb: OCHRA,
    },
  },
  {
    match: 'speakleash/bielik-4.5b',
    meta: {
      label: 'Bielik 4.5B',
      desc: 'Polski model - lekki i szybki, ze świetną znajomością polskiego. Nie jest abliterowany.',
      tags: ['po polsku', 'szybki'],
      greeting: 'Cześć! Jestem polskim modelem - lekkim i szybkim. Pytaj po polsku.',
      icon: 'feather',
      accentRgb: GOLD,
    },
  },
  {
    match: 'speakleash/bielik',
    meta: {
      label: 'Bielik 11B',
      desc: 'Najlepsza polszczyzna i wiedza o Polsce - model rodzimej produkcji. Nie jest abliterowany.',
      tags: ['po polsku'],
      greeting: 'Dzień dobry! Mówię najlepszą polszczyzną ze wszystkich tutaj.',
      icon: 'feather',
      accentRgb: GOLD,
    },
  },
  {
    match: 'bielik',
    meta: {
      label: 'Bielik',
      desc: 'Polski model z rodzimej produkcji. Nie jest abliterowany.',
      tags: ['po polsku'],
      greeting: 'Dzień dobry! Jestem polskim modelem Bielik.',
      icon: 'feather',
      accentRgb: GOLD,
    },
  },
  {
    match: 'llama3.1',
    meta: {
      label: 'Llama 3.1',
      desc: 'Solidny i rzeczowy - dobry do analiz i konkretów.',
      tags: ['rzeczowy'],
      greeting: 'Cześć! Jestem konkretny i na temat. W czym pomóc?',
      icon: 'layers',
      accentRgb: BROWN,
    },
  },
  {
    match: 'llama3',
    meta: {
      label: 'Llama 3',
      desc: 'Uniwersalny model do ogólnych rozmów.',
      tags: ['ogólny'],
      greeting: 'Hej! Jestem do ogólnych rozmów. W czym mogę pomóc?',
      icon: 'layers',
      accentRgb: BROWN,
    },
  },
  {
    match: 'qwen',
    meta: {
      label: 'Qwen',
      desc: 'Mistrz kodu i matematyki. Po polsku radzi sobie słabiej.',
      tags: ['kod', 'matematyka'],
      greeting: 'Cześć! Najmocniejszy jestem w kodzie i liczbach. Rzuć mi wyzwanie.',
      icon: 'cpu',
      accentRgb: OCHRA,
    },
  },
  {
    match: 'mistral',
    meta: {
      label: 'Mistral',
      desc: 'Szybki i zwięzły - do prostych zadań.',
      tags: ['szybki'],
      greeting: 'Hej! Szybko i na temat - o co chodzi?',
      icon: 'wind',
      accentRgb: STEEL,
    },
  },
]

const FALLBACK_META: ModelMeta = {
  label: '', desc: 'Model lokalny.', tags: [], greeting: 'Cześć! Gotowy do rozmowy.', icon: 'bot', accentRgb: OCHRA,
}

export function describeModel(name: string): ModelMeta {
  const rule = RULES.find(r => name.toLowerCase().startsWith(r.match.toLowerCase()))
  if (rule) return rule.meta
  return { ...FALLBACK_META, label: name }
}

export interface ModelEntry {
  name: string
  sizeMB: number
}

export async function fetchModels(): Promise<{ models: ModelEntry[]; default: string }> {
  const res = await fetch('/api/models', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
  if (res.status === 401) {
    notifyUnauthorized()
    throw new Error('Sesja wygasła - zaloguj się ponownie')
  }
  if (!res.ok) throw new Error('Nie udało się pobrać listy modeli')
  return res.json()
}
