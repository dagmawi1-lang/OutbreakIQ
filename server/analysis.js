export { aliases, numberOrNull, normalizeRow, normalizeCdcRow, importCsv, parseCsvText, isAggregateLocation, titleCaseLocation } from '../src/data/normalize.js'

export function detectAnomalies(rows) {
  const groups = new Map()
  for (const row of rows) {
    if (row.cases === null || !Number.isFinite(Number(row.cases))) continue
    const key = `${row.disease}||${row.location}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }
  const output = []
  for (const series of groups.values()) {
    series.sort((a, b) => a.year - b.year || a.week - b.week)
    for (let i = 4; i < series.length; i++) {
      const current = series[i], history = series.slice(Math.max(0, i - 8), i).map(x => Number(x.cases)).filter(Number.isFinite)
      if (history.length < 4) continue
      const mean = history.reduce((a, b) => a + b, 0) / history.length
      const variance = history.reduce((a, b) => a + (b - mean) ** 2, 0) / history.length
      const sd = Math.sqrt(variance), z = sd === 0 ? (current.cases > mean ? 4 : 0) : (current.cases - mean) / sd
      if (z >= 2 && current.cases > mean) output.push({ ...current, baseline: +mean.toFixed(2), zScore: +z.toFixed(2), ratio: mean > 0 ? +(current.cases / mean).toFixed(2) : null, level: z >= 3 ? 'High signal' : 'Review', method: 'Rolling 8-observation baseline; minimum 4 prior observations' })
    }
  }
  return output.sort((a, b) => b.zScore - a.zScore).slice(0, 100)
}
