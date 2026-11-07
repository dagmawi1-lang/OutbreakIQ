import express from 'express'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const app = express()
const PORT = Number(process.env.PORT || 3001)
const CDC_URL = 'https://data.cdc.gov/resource/x9gk-5huc.json'
const cache = { at: 0, rows: null }
const CACHE_MS = 15 * 60 * 1000

app.disable('x-powered-by')
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID()
  res.setHeader('X-Request-ID', req.requestId)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
})
app.use(express.json({ limit: '300kb' }))
const buckets = new Map()
app.use('/api', (req, res, next) => {
  const now = Date.now(), key = req.ip || 'local', entry = buckets.get(key)
  if (!entry || now - entry.start > 60_000) buckets.set(key, { start: now, count: 1 })
  else if (++entry.count > 90) return res.status(429).json({ error: 'Rate limit reached. Please wait a minute.' })
  next()
})

import { normalizeCdcRow, detectAnomalies } from './analysis.js'
async function getCdcRows(force = false) {
  if (!force && cache.rows && Date.now() - cache.at < CACHE_MS) return cache.rows
  const url = new URL(CDC_URL)
  url.searchParams.set('$limit', '50000')
  url.searchParams.set('$order', ':id DESC') // newest rows first; :id is a Socrata system column
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'OutbreakIQ-student-research-prototype/0.3' }, signal: AbortSignal.timeout(18000) })
  if (!response.ok) throw new Error(`CDC data service returned ${response.status}`)
  const raw = await response.json(), rows = raw.map(normalizeCdcRow).filter(Boolean)
  if (!rows.length) throw new Error('CDC response received, but its columns were not recognized. Use CSV import or update the field mapping.')
  cache.rows = rows; cache.at = Date.now(); return rows
}
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'OutbreakIQ API', version: '0.3.0' }))
app.get('/api/surveillance', async (req, res) => {
  try {
    const rows = await getCdcRows(req.query.refresh === 'true')
    const filtered = rows.filter(r => (!req.query.disease || r.disease === req.query.disease) && (!req.query.location || r.location === req.query.location))
    res.json({ source: 'CDC NNDSS Weekly Data', sourceUrl: 'https://data.cdc.gov/d/x9gk-5huc', fetchedAt: new Date(cache.at).toISOString(), provisional: true, count: filtered.length, rows: filtered })
  } catch (error) {
    const message = error.name === 'TimeoutError' ? 'The CDC data service took too long to respond.' : error.message === 'fetch failed' ? 'Could not reach data.cdc.gov (no internet connection, or a network/firewall block).' : error.message
    res.status(502).json({ error: message, sourceUrl: 'https://data.cdc.gov/d/x9gk-5huc' })
  }
})
app.post('/api/analyze', (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows.slice(0, 20000) : []
  if (!rows.length) return res.status(400).json({ error: 'Provide at least one normalized observation.' })
  res.json({ anomalies: detectAnomalies(rows), method: 'rolling-baseline-zscore', disclaimer: 'Statistical signals are not confirmed outbreaks or diagnoses.' })
})
app.post('/api/assistant', async (req, res) => {
  const question = String(req.body?.question || '').slice(0, 1200)
  const context = req.body?.context && typeof req.body.context === 'object' ? req.body.context : {}
  if (!question.trim()) return res.status(400).json({ error: 'Enter a question.' })
  if (process.env.OPENAI_API_KEY) {
    try {
      const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
      const upstream = await fetch(`${base}/chat/completions`, {
        method: 'POST', signal: AbortSignal.timeout(20000), headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', temperature: 0.2, messages: [
          { role: 'system', content: 'You are OutbreakIQ, a cautious public-health data explainer. Only interpret supplied dataset context. Never diagnose, predict an outbreak, recommend treatment, or imply causation. Distinguish reported counts from population rates. State when evidence is insufficient.' },
          { role: 'user', content: `Question: ${question}\nDataset context: ${JSON.stringify(context).slice(0, 7000)}` }
        ] })
      })
      if (!upstream.ok) throw new Error(`AI provider returned ${upstream.status}`)
      const data = await upstream.json()
      const content = data.choices?.[0]?.message?.content
      return res.json({ answer: typeof content === 'string' && content.trim() ? content.slice(0, 4000) : 'No explanation was returned.', mode: 'AI-assisted', grounded: true })
    } catch (error) { return res.status(502).json({ error: `AI request failed: ${error.message}` }) }
  }
  const anomalies = Array.isArray(context.anomalies) ? context.anomalies : [], rows = Array.isArray(context.rows) ? context.rows : [], top = anomalies[0]
  const answer = top
    ? `The strongest statistical signal in this view is ${top.disease} in ${top.location}, reporting week ${top.week} of ${top.year}. The reported count is ${top.cases ?? 'unavailable'}, compared with a rolling baseline of ${top.baseline}; its z-score is ${top.zScore}. This is an unusual value relative to selected historical observations, not confirmation of an outbreak. Check reporting completeness, revisions, population context, and local public-health notices before drawing conclusions.`
    : `This view contains ${rows.length} observations and no values met the prototype's anomaly threshold. This does not mean there is no disease activity. Limited history, missing reports, small counts, or the selected threshold may affect detection.`
  res.json({ answer, mode: 'Evidence-based local explanation', grounded: true, note: 'No external language model is configured; this explanation is generated from the supplied analysis context.' })
})
app.use(express.static(path.join(root, 'dist')))
app.get('/{*splat}', (_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')))
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => console.log(`OutbreakIQ API running at http://localhost:${PORT}`))
}
