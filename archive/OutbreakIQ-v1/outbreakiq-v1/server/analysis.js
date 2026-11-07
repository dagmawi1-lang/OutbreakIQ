const aliases = {
  disease: ['disease', 'condition', 'label', 'disease_name', 'condition_name'],
  location: ['location', 'reporting_area', 'jurisdiction', 'state', 'area'],
  year: ['mmwr_year', 'year', 'reporting_year', 'current_mmwr_year'],
  week: ['mmwr_week', 'week', 'reporting_week'],
  cases: ['current_week', 'current_week_count', 'cases', 'case_count', 'count'],
  cumulative: ['current_year', 'cumulative_ytd', 'year_to_date', 'cum'],
  previousMax: ['previous_52_week_max', 'prev_52_week_max', 'max_52_week'],
  previousTotal: ['previous_52_week_total', 'prev_52_week_total']
}
const normKey = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '')
function findField(row, names) {
  for (const alias of names) {
    const found = Object.entries(row).find(([key]) => normKey(key) === normKey(alias))
    if (found) return found[1]
  }
  return null
}
export function numberOrNull(value) {
  if (value === null || value === undefined || value === '' || ['u', '-', 'n', 'nn', 'np', 'nc'].includes(String(value).toLowerCase())) return null
  const n = Number(String(value).replaceAll(',', ''))
  return Number.isFinite(n) ? n : null
}
export function normalizeCdcRow(row) {
  const disease = findField(row, aliases.disease), location = findField(row, aliases.location)
  const year = numberOrNull(findField(row, aliases.year)), week = numberOrNull(findField(row, aliases.week))
  if (!disease || !location || year === null || week === null) return null
  return { id: `${disease}-${location}-${year}-${week}`, disease: String(disease), location: String(location), year, week, cases: numberOrNull(findField(row, aliases.cases)), cumulative: numberOrNull(findField(row, aliases.cumulative)), previousMax: numberOrNull(findField(row, aliases.previousMax)), previousTotal: numberOrNull(findField(row, aliases.previousTotal)), source: 'CDC NNDSS Weekly Data', provisional: true }
}
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
