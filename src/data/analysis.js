export function analyzeRows(rows) {
  const groups = new Map()
  for (const row of rows) {
    if (row.cases === null || row.cases === undefined || !Number.isFinite(Number(row.cases))) continue
    const key = `${row.disease}||${row.location}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }
  const anomalies = []
  for (const series of groups.values()) {
    series.sort((a, b) => Number(a.year) - Number(b.year) || Number(a.week) - Number(b.week))
    for (let i = 4; i < series.length; i++) {
      const current = series[i], history = series.slice(Math.max(0, i - 8), i).map(x => Number(x.cases)).filter(Number.isFinite)
      if (history.length < 4) continue
      const baseline = history.reduce((a, b) => a + b, 0) / history.length
      const variance = history.reduce((a, b) => a + (b - baseline) ** 2, 0) / history.length
      const sd = Math.sqrt(variance), zScore = sd === 0 ? (Number(current.cases) > baseline ? 4 : 0) : (Number(current.cases) - baseline) / sd
      if (zScore >= 2 && Number(current.cases) > baseline) anomalies.push({ ...current, baseline: +baseline.toFixed(2), zScore: +zScore.toFixed(2), ratio: baseline > 0 ? +(Number(current.cases) / baseline).toFixed(2) : null, level: zScore >= 3 ? 'High signal' : 'Review', method: 'Rolling 8-observation baseline' })
    }
  }
  return anomalies.sort((a, b) => b.zScore - a.zScore)
}
export function summarize(rows, anomalies) {
  const diseases = new Set(rows.map(r => r.disease)), locations = new Set(rows.map(r => r.location))
  const valid = rows.filter(r => r.cases !== null && r.cases !== undefined && Number.isFinite(Number(r.cases)))
  const latest = [...valid].sort((a, b) => Number(b.year) - Number(a.year) || Number(b.week) - Number(a.week))[0]
  return { observations: rows.length, diseases: diseases.size, locations: locations.size, anomalies: anomalies.length, latest }
}
