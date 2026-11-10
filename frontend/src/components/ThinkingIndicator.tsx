import { motion } from 'framer-motion'

// Wskaźnik „odpowiedź w toku" - solidne słupki w kolorze modelu (--accent-rgb),
// bez gradientów. Spójne z jasnym, edytorskim motywem.
export function ThinkingBars({ height = 15 }: { height?: number }) {
  const bars = [0, 1, 2, 3, 4]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, height }}>
      {bars.map(i => (
        <motion.span
          key={i}
          animate={{ scaleY: [0.35, 1, 0.35], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.95,
            repeat: Infinity,
            delay: i * 0.11,
            ease: 'easeInOut',
          }}
          style={{
            width: 3,
            height,
            borderRadius: 2,
            transformOrigin: 'center',
            background: 'rgb(var(--accent-rgb))',
          }}
        />
      ))}
    </span>
  )
}
