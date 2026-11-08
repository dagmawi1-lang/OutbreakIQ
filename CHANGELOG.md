# Changelog

## 0.3.0 - 2026-11-07

### Fixes
- **Live CDC mapping:** CDC's Socrata dataset uses generic columns (`states`, `label`, `m1` current week, `m2` 52-week max, `m3` cumulative YTD). The old mapping didn't recognize `states` or `m1`, so live rows would have had no location or case counts. These are now mapped. Upper-case area names are title-cased so map markers match.
- **Double counting:** national, regional, and residency total rows (e.g. "U.S. Residents", "New England") are flagged as aggregates and excluded from "All locations" totals by default. A checkbox includes them.
- **Live fetch** asks for the newest rows first (`$order=:id DESC`). Network failures now show a plain-language message.
- **CSV import** uses the same normalization as the server. It handles quoted newlines and BOM, rejects years like `0` or `20x6` (previously `Number(null)` became year 0), reports missing columns, and reports skipped rows by line number.
- **AI assistant:** 20-second timeout, configurable `OPENAI_BASE_URL`, and bounded answer length.

### Added
- `npm run verify:cdc` checks the live CDC schema against the mapping and prints a PASS/FAIL report.
- 5 new tests (9 total).

## 0.2.0 and earlier
- Dashboard, trend chart, map, rolling-baseline anomaly screening, CSV import and export, CDC connector, synthetic demo data, and the explanation assistant.
