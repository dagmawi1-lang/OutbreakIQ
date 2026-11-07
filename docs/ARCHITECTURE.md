# Architecture overview

```text
CDC NNDSS / User CSV
        |
        v
Node + Express API  ---- optional server-side language-model API
        |
        +--> field normalization + 15-minute upstream cache
        +--> rolling-baseline anomaly screening
        +--> evidence-grounded explanation endpoint
        |
        v
React + Vite dashboard
        +--> filters and summary metrics
        +--> Recharts time-series view
        +--> Leaflet jurisdiction map
        +--> anomaly review queue
        +--> CSV export
```

The app does not ingest patient records. The current data model is aggregate condition/location/reporting-week observations. The client can also operate in an explicitly labeled synthetic demo mode.

## API routes

- `GET /api/health` — service health.
- `GET /api/surveillance` — retrieve and normalize public CDC NNDSS weekly rows; `?refresh=true` bypasses the 15-minute cache.
- `POST /api/analyze` — analyze normalized rows using the rolling-baseline method.
- `POST /api/assistant` — explain supplied aggregate context; uses an optional server-side AI key or deterministic local explanation.
