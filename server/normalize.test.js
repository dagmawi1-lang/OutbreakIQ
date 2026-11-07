import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeCdcRow, importCsv, parseCsvText, isAggregateLocation, titleCaseLocation } from './analysis.js'

test('CDC Socrata generic columns (states/label/m1/m2/m3) are recognized', () => {
  const r = normalizeCdcRow({ states: 'VIRGINIA', year: '2026', week: '40', label: 'Pertussis', m1: '12', m1_flag: '', m2: '30', m3: '410', sort_order: '1' })
  assert.equal(r.location, 'Virginia'); assert.equal(r.cases, 12); assert.equal(r.previousMax, 30); assert.equal(r.cumulative, 410); assert.equal(r.aggregate, false)
})
test('national and regional rows are flagged as aggregates', () => {
  for (const l of ['U.S. Residents', 'US RESIDENTS', 'NEW ENGLAND', 'South Atlantic', 'Non-U.S. Residents', 'Total']) assert.equal(isAggregateLocation(titleCaseLocation(l)), true, l)
  for (const l of ['Virginia', 'NEW YORK CITY', 'District of Columbia', 'Puerto Rico']) assert.equal(isAggregateLocation(titleCaseLocation(l)), false, l)
  assert.equal(titleCaseLocation('DISTRICT OF COLUMBIA'), 'District of Columbia')
})
test('invalid years/weeks and negative counts are rejected', () => {
  assert.equal(normalizeCdcRow({ label: 'X', states: 'Ohio', year: '25', week: '3', m1: '1' }), null)
  assert.equal(normalizeCdcRow({ label: 'X', states: 'Ohio', year: '2025', week: '60', m1: '1' }), null)
  assert.equal(normalizeCdcRow({ label: 'X', states: 'Ohio', year: '2025', week: '3', m1: '-4' }).cases, null)
  assert.equal(normalizeCdcRow({ label: 'X', states: 'Ohio', year: '2025', week: '3', m1: 'NP' }).cases, null)
})
test('CSV parser handles quotes, commas, newlines in quotes, CRLF, and BOM', () => {
  const t = parseCsvText('﻿a,b\r\n"x, y","he said ""hi"""\r\n"multi\nline",2\r\n')
  assert.deepEqual(t, [['a', 'b'], ['x, y', 'he said "hi"'], ['multi\nline', '2']])
})
test('CSV import reports missing columns and skipped rows', () => {
  assert.match(importCsv('disease,location,year\nA,Ohio,2025').error, /week, cases/)
  const r = importCsv('disease,location,mmwr_year,mmwr_week,current_week\nA,Ohio,2025,1,5\nA,Ohio,abc,2,5\nA,Ohio,2025,3,U\n,Ohio,2025,4,1')
  assert.equal(r.rows.length, 2); assert.equal(r.skipped, 2); assert.deepEqual(r.problemLines, [3, 5]); assert.equal(r.rows[1].cases, null)
  assert.match(importCsv('only header\n').error, /header row and at least one/)
})
