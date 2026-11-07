// Shared by the browser (CSV import) and the server (CDC API). Keep this file dependency-free.

// Column aliases. CDC's Socrata dataset x9gk-5huc publishes generic measure columns:
// states = reporting area, label = condition, m1 = current week, m2 = previous 52-week max,
// m3 = cumulative YTD (current year). Verify with `npm run verify:cdc` if CDC changes its schema.
export const aliases = {
  disease: ['disease', 'condition', 'label', 'disease_name', 'condition_name'],
  location: ['location', 'reporting_area', 'jurisdiction', 'state', 'states', 'area', 'location1'],
  year: ['mmwr_year', 'year', 'reporting_year', 'current_mmwr_year'],
  week: ['mmwr_week', 'week', 'reporting_week'],
  cases: ['current_week', 'current_week_count', 'cases', 'case_count', 'count', 'm1'],
  cumulative: ['current_year', 'cumulative_ytd', 'year_to_date', 'cum', 'cum_current', 'm3'],
  previousMax: ['previous_52_week_max', 'prev_52_week_max', 'max_52_week', 'm2'],
  previousTotal: ['previous_52_week_total', 'prev_52_week_total'],
}
export const SUPPRESSION_MARKERS = ['u', '-', 'n', 'nn', 'np', 'nc', 'na', 'n/a']

export const STATES = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'New York City', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'American Samoa', 'Guam', 'Northern Mariana Islands', 'Puerto Rico', 'U.S. Virgin Islands']
// Rows that sum other rows (national, census regions/divisions, residency groupings). Including them in
// "All locations" totals would double-count cases.
const AGGREGATE_PATTERNS = [/^u\.?s\.?( residents)?$/i, /^united states/i, /^total/i, /^non-?u\.?s\.? residents/i, /^us territories/i, /^u\.s\. territories/i, /^(new england|middle atlantic|mid\.? atlantic|east north central|west north central|south atlantic|east south central|west south central|mountain|pacific)$/i, /\bregion\b/i]

const SMALL = new Set(['of', 'and', 'the'])
export function titleCaseLocation(value) {
  const raw = String(value ?? '').trim().replace(/\s+/g, ' ')
  if (!raw) return ''
  if (raw !== raw.toUpperCase()) return raw // already mixed case: keep the source spelling
  const known = STATES.find((s) => s.toUpperCase() === raw)
  if (known) return known
  if (/^U\.?S\.? RESIDENTS$/.test(raw)) return 'U.S. Residents'
  return raw.toLowerCase().split(' ').map((w, i) => (i > 0 && SMALL.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ')
}
export function isAggregateLocation(location) {
  const l = String(location || '').trim()
  return AGGREGATE_PATTERNS.some((re) => re.test(l))
}

const normKey = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '')
function findField(row, names) {
  const keys = Object.keys(row)
  for (const alias of names) {
    const k = keys.find((key) => normKey(key) === normKey(alias))
    if (k !== undefined && row[k] !== '' && row[k] !== null && row[k] !== undefined) return row[k]
  }
  return null
}
export function numberOrNull(value) {
  if (value === null || value === undefined || value === '' || SUPPRESSION_MARKERS.includes(String(value).trim().toLowerCase())) return null
  const n = Number(String(value).replaceAll(',', '').trim())
  return Number.isFinite(n) ? n : null
}
export function normalizeRow(row, source = 'CDC NNDSS Weekly Data', provisional = true) {
  if (!row || typeof row !== 'object') return null
  const disease = findField(row, aliases.disease), locationRaw = findField(row, aliases.location)
  const year = numberOrNull(findField(row, aliases.year)), week = numberOrNull(findField(row, aliases.week))
  if (!disease || !locationRaw || year === null || week === null) return null
  if (!Number.isInteger(year) || year < 1990 || year > 2100 || !Number.isInteger(week) || week < 1 || week > 53) return null
  const location = titleCaseLocation(locationRaw)
  const cases = numberOrNull(findField(row, aliases.cases))
  return {
    id: `${disease}-${location}-${year}-${week}`, disease: String(disease).trim().slice(0, 200), location, year, week,
    cases: cases !== null && cases < 0 ? null : cases,
    cumulative: numberOrNull(findField(row, aliases.cumulative)), previousMax: numberOrNull(findField(row, aliases.previousMax)), previousTotal: numberOrNull(findField(row, aliases.previousTotal)),
    aggregate: isAggregateLocation(location), source, provisional,
  }
}
export const normalizeCdcRow = (row) => normalizeRow(row)

/** RFC-4180-ish CSV parser (quoted fields, escaped quotes, newlines inside quotes, BOM). */
export function parseCsvText(text) {
  const src = String(text || '').replace(/^﻿/, '')
  const rows = []; let row = [], cur = '', quote = false
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quote) {
      if (c === '"' && src[i + 1] === '"') { cur += '"'; i++ } else if (c === '"') quote = false; else cur += c
    } else if (c === '"') quote = true
    else if (c === ',') { row.push(cur); cur = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && src[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = '' }
    else cur += c
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row) }
  return rows.filter((r) => r.some((x) => String(x).trim() !== ''))
}

/** Converts CSV text into normalized observations and a validation report. */
export function importCsv(text, maxRows = 50000) {
  const table = parseCsvText(text)
  if (table.length < 2) return { rows: [], skipped: 0, error: 'The file needs a header row and at least one data row.' }
  const headers = table[0].map((h) => h.trim())
  const missing = []
  for (const field of ['disease', 'location', 'year', 'week']) if (!headers.some((h) => aliases[field].some((a) => normKey(a) === normKey(h)))) missing.push(field)
  const hasCases = headers.some((h) => aliases.cases.some((a) => normKey(a) === normKey(h)))
  if (missing.length || !hasCases) return { rows: [], skipped: 0, error: `Missing required column${missing.length + !hasCases > 1 ? 's' : ''}: ${[...missing, ...(hasCases ? [] : ['cases'])].join(', ')}. Expected e.g. disease, location, mmwr_year, mmwr_week, current_week.` }
  const rows = []; const problems = []
  for (let i = 1; i < table.length && rows.length < maxRows; i++) {
    const obj = Object.fromEntries(headers.map((h, j) => [h, table[i][j] ?? '']))
    const r = normalizeRow(obj, 'User-imported CSV', true)
    if (r) rows.push({ ...r, id: `upload-${i}-${r.id}` }); else if (problems.length < 5) problems.push(i + 1)
  }
  const skipped = table.length - 1 - rows.length
  return { rows, skipped, problemLines: problems, truncated: table.length - 1 > maxRows, error: rows.length ? '' : 'No valid rows were found. Check years (4 digits) and MMWR weeks (1–53).' }
}
