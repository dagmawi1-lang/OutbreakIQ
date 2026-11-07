// Synthetic observations are for interface testing only; they are NOT CDC data.
const diseases = ['Pertussis', 'Salmonellosis', 'West Nile virus disease', 'Legionellosis']
const places = ['Virginia', 'Maryland', 'North Carolina', 'California', 'New York', 'Texas', 'Florida', 'Ohio']
const rows = []
for (const [di, disease] of diseases.entries()) for (const [pi, location] of places.entries()) for (let week = 1; week <= 24; week++) {
  const base = 7 + di * 4 + pi * 2
  const wave = Math.round(3 * Math.sin((week + pi) / 3) + 2 * Math.cos(week / 5))
  let cases = Math.max(0, base + wave + ((week * (pi + 2) + di * 7) % 5))
  if (week === 23 && (pi === 0 || pi === 3) && di === 0) cases += 22
  if (week === 24 && (pi === 0 || pi === 3) && di === 0) cases += 30
  rows.push({ id: `${disease}-${location}-2025-${week}`, disease, location, year: 2025, week, cases, cumulative: null, previousMax: null, previousTotal: null, source: 'Synthetic demonstration data', provisional: false })
}
export const demoRows = rows
export const demoMetadata = { source: 'Synthetic demonstration data', sourceUrl: null, provisional: false, fetchedAt: null }
