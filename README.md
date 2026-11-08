# OutbreakIQ 🧬

## AI-assisted public-health surveillance and disease-trend exploration

## My role & contributions

**Solo developer · AI-assisted**

- Chose the CDC NNDSS dataset and the statistical screening approach
- Fixed the live-data column mapping and double counting of national totals

OutbreakIQ is a student-built platform for exploring public disease-reporting data, identifying unusual reporting patterns, and explaining the evidence behind those patterns.

> **An anomaly is a statistical signal for human review. It is not proof of an outbreak, a diagnosis, or a causal explanation.**

### Core capabilities
- Interactive disease-reporting dashboard and filters
- Weekly trend visualization and geographic exploration
- Rolling-baseline statistical anomaly screening
- CSV import/export
- CDC NNDSS data connector and synthetic demo data
- Evidence-grounded explanations, with responsible-AI limitations

### Statistical screening
For a current observation `x`, historical mean `μ`, and historical standard deviation `σ`, the prototype uses a standardized deviation:

`z = (x - μ) / σ`

The rolling baseline uses recent prior observations and requires a minimum history. A high score is a prompt for review, not an outbreak confirmation. Reporting delays, revisions, seasonality, surveillance changes, missing data, and random variation can all affect results.

### Data
The live connector is designed around [CDC NNDSS Weekly Data](https://data.cdc.gov/d/x9gk-5huc). Bundled demo observations are synthetic and must not be described as real case reports.

### Run locally
```bash
npm install
npm run dev
```
In another terminal:
```bash
npm run server
```
Build and run checks:
```bash
npm run build
npm run check
npm run verify:cdc   # confirms the live CDC schema still matches (needs internet)
```
Production-style run: `npm run build && npm start`, then open http://localhost:3001 (the API also serves `dist/`).

See `VERSION.md` for the 0.3.0 changes and verification status.
If a script name differs in your local copy, use the scripts listed by `npm run`.

### Optional AI configuration
If the optional AI provider integration is enabled in this version, configure credentials locally using environment variables. Never commit API keys or secrets.

### Responsible use
OutbreakIQ is an educational prototype. It does not diagnose, recommend treatment, confirm outbreaks, predict individual health outcomes, or replace public-health professionals. Geographic views are exploratory, not individual or neighborhood risk assessments. Verify important findings with authoritative sources.

### Competition
**DSH Hacks V2 — AI × Healthcare**

See `docs/METHODOLOGY.md` and `docs/RELEASE_CHECKLIST.md` for interpretation and release preparation.

### License
See `LICENSE`.

## License

**Permission required.** © 2026 Dagmawi Melaku. You need my written permission before using, copying, or modifying this code, and any approved use must credit me with a link to this repository. Viewing, forking on GitHub, and running it to judge or review a submission are allowed without asking. To ask, [open an issue](../../issues/new). See [LICENSE](LICENSE) for the full terms.

## Earlier versions

Previous uploads of this project are kept unchanged in [`archive/`](archive/).
