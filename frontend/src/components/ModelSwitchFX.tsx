import { motion } from 'framer-motion'

// Subtelny sygnał zmiany modelu: cienka cynobrowa linia pulsująca wzdłuż
// górnej krawędzi okna. Bez efektów HUD/sci-fi - jedynie czytelny „puls" zmiany.
export function ModelSwitchFX({ triggerKey }: { triggerKey: string }) {
  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
      <motion.div
        key={triggerKey}
        className="absolute inset-x-0 top-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.7, times: [0, 0.35, 1], ease: 'easeInOut' }}
        style={{ height: 2, background: 'var(--accent)' }}
      />
    </div>
  )
}
