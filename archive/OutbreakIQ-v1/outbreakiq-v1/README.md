# OutbreakIQ

**AI-assisted public-health surveillance and disease-trend exploration**  
Student-built prototype for DSH Hacks V2 — AI x Healthcare.

> OutbreakIQ helps people explore public disease-reporting data, review unusual statistical patterns, and understand the limits of the available evidence. It is a research and educational prototype, not a diagnostic or outbreak-confirmation system.

## Current version: V1 foundation

- React + Vite dashboard with responsive dark interface
- CDC NNDSS Weekly Data API integration through a small Express proxy
- Clearly labeled synthetic demonstration dataset when the CDC feed is not connected
- CSV import for normalized weekly observations
- Rolling-baseline anomaly screening (transparent statistical method)
- Interactive geographic map, time-series visualization, filters, and CSV export
- Evidence-grounded explanation endpoint
- Optional server-side OpenAI integration (disabled unless a key is configured)
- Security headers, API rate limiting, and automated unit tests

## Quick start

Requirements: Node.js 18.18+ (Node 20 LTS recommended) and npm.

```bash
npm install
```

Terminal 1 — start the API:

```bash
npm run server
```

Terminal 2 — start the frontend:

```bash
npm run dev
```

Open the Vite URL printed in Terminal 2 (normally `http://localhost:5173`).

To make a production build:

```bash
npm run build
npm start
```

The production server serves the built frontend and API on port 3001.

## Live CDC data

Use **Load live CDC data** in the dashboard. The server requests the public Socrata JSON endpoint for the CDC NNDSS Weekly Data catalog and caches a successful response for 15 minutes.

- Dataset page: https://data.cdc.gov/d/x9gk-5huc
- CDC NNDSS overview and interpretation notes: https://www.cdc.gov/nndss/infectious-disease/
- API endpoint: https://data.cdc.gov/resource/x9gk-5huc.json

The CDC describes weekly NNDSS data as provisional. Counts may be revised, and reporting differs across jurisdictions. See `docs/DATA_AND_METHODS.md`.

If the current upstream schema changes or the CDC request is unavailable, the dashboard stays usable with synthetic demo data. It never labels those synthetic rows as CDC observations. A CSV importer is also included.

## Optional AI explanation provider

The assistant works without an API key using a deterministic, evidence-based explanation of the current dashboard analysis. To enable a language-model explanation, copy `.env.example` to `.env` and set `OPENAI_API_KEY` on the server. Never put the key in frontend code or commit it.

The AI prompt restricts explanations to supplied data context. It must not diagnose, recommend treatment, claim causation, or confirm outbreaks.

## Statistical method

For each condition and reporting area, each observation is compared with up to the previous eight observations. At least four prior values are required. A value is flagged when it is at least two standard deviations above that rolling mean. The score is a screening signal only. The current method does not account for population denominators, seasonality, reporting delays, jurisdiction-specific coverage, or formal outbreak definitions.

## Project structure

```text
outbreakiq-v1/
├── src/
│   ├── data/             # demo data and analysis functions
│   ├── App.jsx           # dashboard and interactions
│   ├── main.jsx
│   └── styles.css
├── server/
│   ├── server.js         # CDC proxy and assistant API
│   ├── analysis.js       # normalization and anomaly screening
│   └── server.test.js
├── docs/                 # architecture, methodology, test plan, project description
├── backend/              # backend architecture notes
├── package.json
└── README.md
```

## Tests

```bash
npm test
npm run check
```

## Privacy and safety

- No patient-level or personally identifiable health information is collected.
- The prototype uses aggregate public reporting data or synthetic demo records.
- It does not offer personal medical advice.
- It does not send geolocation data.
- Optional AI requests contain only the selected aggregate observations and filters.

## Status and next steps

V1 is the working foundation. Before competition submission, verify the live CDC field mapping against a current API response, test the application in a browser, improve the map/data coverage, evaluate anomaly thresholds, add screenshots, and complete the one-page PDF and demo recording.
