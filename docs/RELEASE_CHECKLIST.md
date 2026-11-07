# Release and judging checklist

## Reproducibility
- [ ] Clean `npm install` succeeds.
- [ ] `npm run verify:cdc` prints PASS (live CDC schema still matches).
- [ ] `npm run build` succeeds.
- [ ] `npm run check` succeeds.
- [ ] Setup instructions match actual scripts.
- [ ] No credentials or private data are committed.

## User experience
- [ ] Dashboard loads with demo data when external services are unavailable.
- [ ] Filters update displayed observations.
- [ ] Charts show labels and units.
- [ ] Map legend and geographic caveats are visible.
- [ ] CSV import validates headers and reports malformed rows.
- [ ] CSV export contains selected, labeled data.
- [ ] Empty and error states are understandable.

## Statistical credibility
- [ ] Each anomaly shows observed value and baseline.
- [ ] Insufficient history is handled explicitly.
- [ ] Invalid or zero standard deviation is handled safely.
- [ ] Demo data is labeled synthetic.
- [ ] Anomaly scores are not presented as outbreak probabilities.

## AI and evidence
- [ ] Responses are grounded in supplied observations.
- [ ] Unsupported causes are not invented.
- [ ] No diagnosis or treatment advice is generated.
- [ ] Anomalies are described as review signals.

## Submission
- [ ] Public repository and accurate README.
- [ ] Screenshots of working features.
- [ ] Reproducible demo video.
- [ ] One-page project description.
- [ ] Submission links tested.
