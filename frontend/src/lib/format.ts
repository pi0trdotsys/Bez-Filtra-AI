// Formatowanie energii: Wh dla małych wartości, kWh dla dużych.
export function formatEnergy(kWh: number): string {
  if (kWh >= 1) return `${kWh.toFixed(2)} kWh`
  return `${(kWh * 1000).toFixed(1)} Wh`
}
