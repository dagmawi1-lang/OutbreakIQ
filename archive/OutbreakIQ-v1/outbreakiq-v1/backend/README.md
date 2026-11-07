# Backend notes

The Node/Express API proxies CDC's public Socrata endpoint so browser requests do not need to manage the upstream data request. It caches the response for 15 minutes, normalizes common NNDSS field names, and computes transparent rolling-baseline anomaly signals.

The optional AI explanation route accepts an `OPENAI_API_KEY` only on the server. Without a key, it returns a deterministic explanation grounded in the supplied dashboard context. Do not commit secrets.
