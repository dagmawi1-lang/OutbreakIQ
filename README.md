# OutbreakIQ

**Explore public disease-reporting data and spot unusual patterns, with the evidence shown.** OutbreakIQ is a public-health surveillance dashboard. It loads CDC weekly disease data, screens it for statistically unusual reports, and includes an assistant that explains each signal using only the data on screen.

Built for [DSH Hacks V2](https://dsh-hacks-v2.devpost.com/) (AI × Healthcare).

> An anomaly is a statistical signal for human review. It is not proof of an outbreak, a diagnosis, or a causal explanation.

## My role & contributions

**Solo developer · AI-assisted**

- Chose the CDC NNDSS dataset and the statistical screening approach
- Fixed the live-data column mapping and double counting of national totals

## Features

- **Dashboard** with condition, reporting-area, and time-window filters, a weekly trend chart, and a map.
- **Anomaly screening** with a rolling baseline and a minimum-history requirement.
- **Live CDC data** from the [NNDSS Weekly Data](https://data.cdc.gov/d/x9gk-5huc) catalog, proxied and cached by the API. National and regional total rows are kept out of "All locations" totals so nothing is counted twice.
- **Explanation assistant** grounded in the visible data. It uses an OpenAI-compatible model when a key is configured, and a built-in explanation otherwise.
- **CSV import and export.** Imported rows are validated and normalized, and skipped rows are reported by line number.
- **Demo mode** with clearly labeled synthetic data, so the app works offline.
- A methodology panel that explains how scores are calculated and their limits.

## How anomalies are scored

For a current weekly count `x`, with mean `μ` and standard deviation `σ` over recent prior weeks:

```
z = (x − μ) / σ
```

A high score flags the observation for review. Reporting delays, data revisions, seasonality, and changes in surveillance can all produce high scores, so they are explained alongside each result. See [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) and [`docs/DATA_AND_METHODS.md`](docs/DATA_AND_METHODS.md).

## Tech stack

React · Vite · Recharts · Leaflet · Node.js · Express

## Getting started

```bash
npm install
npm run dev        # frontend
npm run server     # API on http://localhost:3001 (second terminal)
```

Production-style run on one port: `npm run build && npm start`, then open http://localhost:3001.

To turn on the AI assistant, copy `.env.example` to `.env` and set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL` and `OPENAI_BASE_URL`). The key stays on the server.

## Testing

```bash
npm run check        # server syntax checks and tests
npm run verify:cdc   # checks the live CDC schema against the field mapping (needs internet)
```

## Responsible use

OutbreakIQ is an exploration tool. It doesn't diagnose, recommend treatment, confirm outbreaks, or assess individual or neighborhood risk. Important findings should be checked against official public-health sources.

## License

**Permission required.** © 2026 Dagmawi Melaku. You need my written permission before using, copying, or modifying this code, and any approved use must credit me with a link to this repository. Viewing, forking on GitHub, and running it to judge or review a submission are allowed without asking. To ask, [open an issue](../../issues/new). See [LICENSE](LICENSE) for the full terms.
