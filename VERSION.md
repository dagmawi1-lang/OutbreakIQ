# OutbreakIQ 0.3.0 (November 7, 2026)

## Fixes
- **Live CDC mapping:** CDC's Socrata dataset uses generic columns (`states`, `label`, `m1` current week, `m2` 52-week max, `m3` cumulative YTD). The old mapping didn't recognize `states` or `m1`, so live rows would have had no location or case counts. These are now mapped. Upper-case area names are title-cased so map markers match.
- **Double counting:** national, regional, and residency total rows (e.g. "U.S. Residents", "New England") are flagged as aggregates and excluded from "All locations" totals by default. A checkbox includes them.
- **Live fetch** asks for the newest rows first (`$order=:id DESC`). Network failures now show a plain-language message.
- **CSV import** uses the same normalization as the server. It handles quoted newlines and BOM, rejects years like `0` or `20x6` (previously `Number(null)` became year 0), reports missing columns, and reports skipped rows by line number.
- **AI assistant:** 20-second timeout, configurable `OPENAI_BASE_URL`, and bounded answer length.

## New
- `npm run verify:cdc` checks the live CDC schema against the mapping and prints a PASS/FAIL report.
- 5 new tests (9 total).

## Verified (Nov 7, 2026)
- `node --test server/*.test.js`: 9/9 pass.
- Headless Chrome against the real server code: demo dashboard, condition filter, CDC-unavailable error state, local assistant explanation, CSV import with an invalid row and aggregate rows, aggregate toggle, methodology modal, and mobile layout. No JavaScript errors.

## Not verified here (run on your computer)
- `npm install && npm run build`. Package downloads were blocked in this environment, so charts (Recharts) and the map (Leaflet) were stubbed during browser QA.
- `npm run verify:cdc` needs internet access. **Run this before the demo.** If it prints FAIL, send me the column list it shows.
- The real OpenAI path (needs your key in `.env`).
