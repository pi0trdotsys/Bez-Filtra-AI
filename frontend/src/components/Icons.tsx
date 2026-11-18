import type { CSSProperties, ReactNode, SVGProps } from 'react'

// ─────────────────────────────────────────────────────────────
// Dedykowane ikony SVG - „tusz + cynobrowy detal" (duotone).
// Kontur dziedziczy kolor tekstu (currentColor), a mały element
// wypełniony var(--accent) jest sygnaturą marki. Działa w obu
// motywach (jasny/ciemny).
// ─────────────────────────────────────────────────────────────

const AC = { fill: 'var(--accent)' } as const
const AS = { stroke: 'var(--accent)' } as const

interface SvgProps extends SVGProps<SVGSVGElement> {
  size?: number
}

function Svg({ size = 16, children, ...rest }: SvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export function SearchIcon({ size = 15 }: { size?: number }) {
  return (
    <Svg size={size}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
      <circle cx="11" cy="11" r="1.6" style={AC} stroke="none" />
    </Svg>
  )
}

export function PlusIcon({ size = 15 }: { size?: number }) {
  return <Svg size={size}><path d="M12 5v14M5 12h14" /></Svg>
}

export function SlidersIcon({ size = 15 }: { size?: number }) {
  return (
    <Svg size={size}>
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
      <circle cx="4" cy="14" r="2" style={AC} stroke="none" />
      <circle cx="12" cy="8" r="2" style={AC} stroke="none" />
      <circle cx="20" cy="16" r="2" style={AC} stroke="none" />
    </Svg>
  )
}

export function ChartIcon({ size = 13 }: { size?: number }) {
  return <Svg size={size}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></Svg>
}

export function BatteryIcon({ size = 13 }: { size?: number }) {
  return (
    <Svg size={size}>
      <rect x="2" y="7" width="16" height="10" rx="2" />
      <path d="M22 11v2" />
      <rect x="4" y="9" width="9" height="6" rx="1" style={AC} stroke="none" />
    </Svg>
  )
}

export function DropletIcon({ size = 13 }: { size?: number }) {
  return <Svg size={size}><path d="M12 2.7l5.66 5.66a8 8 0 1 1-11.31 0z" /><circle cx="12" cy="13" r="1.6" style={AC} stroke="none" /></Svg>
}

export function ClockIcon({ size = 13 }: { size?: number }) {
  return <Svg size={size}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /><circle cx="12" cy="12" r="1.3" style={AC} stroke="none" /></Svg>
}

export function LockIcon({ size = 15 }: { size?: number }) {
  return (
    <Svg size={size}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="15" r="1.4" style={AC} stroke="none" />
    </Svg>
  )
}

export function XIcon({ size = 14 }: { size?: number }) {
  return <Svg size={size}><path d="M18 6L6 18M6 6l12 12" /></Svg>
}

export function TrashIcon({ size = 13 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M10 11v6M14 11v6" />
    </Svg>
  )
}

export function CopyIcon({ size = 12 }: { size?: number }) {
  return <Svg size={size}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Svg>
}

export function RefreshIcon({ size = 12 }: { size?: number }) {
  return <Svg size={size}><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></Svg>
}

export function EditIcon({ size = 12 }: { size?: number }) {
  return <Svg size={size}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" /></Svg>
}

export function CheckIcon({ size = 12 }: { size?: number }) {
  return <Svg size={size}><path d="M20 6L9 17l-5-5" /></Svg>
}

export function ChatIcon({ size = 15 }: { size?: number }) {
  return <Svg size={size}><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" /></Svg>
}

export function LogoutIcon({ size = 14 }: { size?: number }) {
  return <Svg size={size}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></Svg>
}

export function UserIcon({ size = 15 }: { size?: number }) {
  return <Svg size={size}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Svg>
}

export function SunIcon({ size = 15 }: { size?: number }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="4" style={AC} stroke="none" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </Svg>
  )
}

export function MoonIcon({ size = 15 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      <path d="M18.5 4.5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" style={AC} stroke="none" />
    </Svg>
  )
}

export function BanIcon({ size = 15 }: { size?: number }) {
  return <Svg size={size}><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" style={AS} /></Svg>
}

export function FlameGlyph() {
  return <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
}

export function FlameIcon({ size = 15 }: { size?: number }) {
  return <Svg size={size}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /><path d="M12 17a2 2 0 0 0 2-2" style={AS} /></Svg>
}

export function SkullIcon({ size = 15 }: { size?: number }) {
  return (
    <Svg size={size}>
      <circle cx="9" cy="12" r="1.2" style={AC} stroke="none" /><circle cx="15" cy="12" r="1.2" style={AC} stroke="none" />
      <path d="M8 20v2h8v-2" /><path d="m12.5 17-.5-1-.5 1h1z" />
      <path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20" />
    </Svg>
  )
}

export function BombIcon({ size = 15 }: { size?: number }) {
  return (
    <Svg size={size}>
      <circle cx="11" cy="13" r="9" />
      <path d="M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-3.95 3.95" />
      <path d="m22 2-1.5 1.5" />
      <path d="M11 10l2.5 2.5" style={AS} />
    </Svg>
  )
}

// ── Glify modeli ─────────────────────────────────────────────

export function CpuGlyph() {
  return <><rect x="5" y="5" width="14" height="14" rx="2" /><rect x="10" y="10" width="4" height="4" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></>
}

export function WavesGlyph() {
  return <><path d="M2 8c2 0 2 1.5 4 1.5S8 8 10 8s2 1.5 4 1.5S16 8 18 8s2 1.5 4 1.5" /><path d="M2 14c2 0 2 1.5 4 1.5s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5" /></>
}

export function FeatherGlyph() {
  return <><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" /><path d="M16 8L2 22" /><path d="M17.5 15H9" /></>
}

export function WindGlyph() {
  return <><path d="M9.6 4.6A2 2 0 1 1 11 8H2" /><path d="M12.6 19.4A2 2 0 1 0 14 16H2" /><path d="M17.7 7.7A2.5 2.5 0 1 1 19.5 12H2" /></>
}

export function LayersGlyph() {
  return <><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>
}

export function SparklesGlyph() {
  return <><path d="M12 3l2 4.5L18.5 9.5 14 11.5 12 16l-2-4.5L5.5 9.5 10 7.5z" /><path d="M19 15l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z" /></>
}

export function BotGlyph() {
  return <><rect x="5" y="7" width="14" height="12" rx="3" /><path d="M12 7V4M8 4h8" /><circle cx="9" cy="12" r="0.8" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="0.8" fill="currentColor" stroke="none" /><path d="M9 16h6" /></>
}

export function BoltGlyph({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
}

export function SparkGlyph({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z" /></svg>
}

export function AutoIcon({ size = 15 }: { size?: number }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 0 18z" style={AC} stroke="none" />
    </Svg>
  )
}

export function PinIcon({ size = 12 }: { size?: number }) {
  return <Svg size={size}><path d="M12 17v5" /><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z" /></Svg>
}

export function ExportIcon({ size = 13 }: { size?: number }) {
  return <Svg size={size}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></Svg>
}

const MODEL_GLYPHS: Record<string, ReactNode> = {
  cpu: <CpuGlyph />,
  waves: <WavesGlyph />,
  bolt: <BoltGlyph />,
  sparkles: <SparklesGlyph />,
  feather: <FeatherGlyph />,
  flame: <FlameGlyph />,
  layers: <LayersGlyph />,
  wind: <WindGlyph />,
  bot: <BotGlyph />,
}

export function ModelIcon({ name, size = 18, color = 'currentColor', style }: { name: string; size?: number; color?: string; style?: CSSProperties }) {
  return (
    <Svg size={size} color={color} strokeWidth={1.7} style={{ flexShrink: 0, ...style }}>
      {MODEL_GLYPHS[name] ?? <BotGlyph />}
    </Svg>
  )
}
