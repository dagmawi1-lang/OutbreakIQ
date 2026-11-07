// Checks that the live CDC NNDSS dataset still matches OutbreakIQ's column mapping.
// Usage: npm run verify:cdc   (needs internet access)
import { normalizeCdcRow } from '../server/analysis.js'
const url = new URL('https://data.cdc.gov/resource/x9gk-5huc.json')
url.searchParams.set('$limit', '200'); url.searchParams.set('$order', ':id DESC')
const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) }).catch((e) => { console.error('Network error:', e.message); process.exit(2) })
if (!res.ok) { console.error(`CDC returned HTTP ${res.status}`); process.exit(2) }
const raw = await res.json()
console.log(`Fetched ${raw.length} rows. Columns: ${Object.keys(raw[0] || {}).join(', ')}`)
const rows = raw.map(normalizeCdcRow).filter(Boolean)
const withCases = rows.filter((r) => r.cases !== null)
console.log(`Recognized ${rows.length}/${raw.length} rows; ${withCases.length} have a numeric weekly count; ${rows.filter((r) => r.aggregate).length} flagged as national/regional totals.`)
console.log('Sample:', JSON.stringify(rows.slice(0, 3), null, 2))
const latest = rows.sort((a, b) => b.year - a.year || b.week - a.week)[0]
if (latest) console.log(`Latest reporting period in sample: MMWR week ${latest.week}, ${latest.year}`)
if (!rows.length || !withCases.length) { console.error('FAIL: column mapping needs updating in src/data/normalize.js (aliases).'); process.exit(1) }
console.log('PASS: live CDC data maps correctly.')
