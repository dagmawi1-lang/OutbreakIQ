import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeCdcRow, detectAnomalies } from './analysis.js'

test('normalizes common NNDSS fields', () => {
  const row = normalizeCdcRow({ label: 'Pertussis', location: 'Virginia', mmwr_year: '2025', mmwr_week: '12', current_week: '18', current_year: '91' })
  assert.equal(row.disease, 'Pertussis'); assert.equal(row.location, 'Virginia'); assert.equal(row.year, 2025); assert.equal(row.week, 12); assert.equal(row.cases, 18)
})
test('suppression markers remain null, not zero', () => {
  const row = normalizeCdcRow({ label: 'Condition', location: 'Area', mmwr_year: '2025', mmwr_week: '3', current_week: 'U' })
  assert.equal(row.cases, null)
})
test('rejects rows missing required fields', () => assert.equal(normalizeCdcRow({ label: 'Pertussis', current_week: '2' }), null))
test('flags a large increase against a rolling baseline', () => {
  const rows = [1,2,3,4,5,6,7,8,40].map((cases, i) => ({ disease: 'Test', location: 'Virginia', year: 2025, week: i + 1, cases }))
  assert.ok(detectAnomalies(rows).some(x => x.week === 9))
})
