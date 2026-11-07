# Data, methods, and limitations

## Primary data source

The intended live source is the CDC National Notifiable Diseases Surveillance System (NNDSS) Weekly Data catalog:

- Dataset: https://data.cdc.gov/d/x9gk-5huc
- JSON endpoint: https://data.cdc.gov/resource/x9gk-5huc.json
- CDC overview: https://www.cdc.gov/nndss/infectious-disease/

CDC describes the weekly tables as provisional. Counts can be revised as jurisdictions submit or reconcile information. A missing, suppressed, unavailable, or non-reportable value must not be interpreted as zero. Reporting conditions and coverage may vary by jurisdiction.

## Data modes

1. **CDC mode:** rows returned by the upstream CDC dataset after field normalization. The UI labels these as provisional.
2. **CSV mode:** rows supplied by a user. The user is responsible for verifying field meanings, units, time periods, and provenance.
3. **Demo mode:** synthetic records generated only to exercise interface behavior. These are not real disease reports and must not be used as epidemiological evidence.

## Current anomaly-screening method

For each condition/reporting-area series:

1. Sort observations by reporting year and MMWR week.
2. For each point, take up to eight preceding non-missing observations.
3. Require at least four prior observations.
4. Compute the rolling mean and population standard deviation.
5. Compute a z-score for the current observation.
6. Flag an observation if it is above the rolling mean and has a z-score of at least 2.

This is a transparent baseline heuristic, not a validated epidemiological algorithm. It can be sensitive to small counts, unstable variance, missing data, seasonal patterns, reporting revisions, and incomplete jurisdiction coverage. It does not establish causality or transmission.

## Interpretation guardrails

- A signal is a prompt for further review, not an outbreak declaration.
- Reported counts are not incidence rates unless paired with an appropriate population denominator and method.
- No patient-level diagnosis or treatment recommendations are provided.
- Data should be checked against official public-health notices and source documentation before being used in a decision.

## Planned evaluation

- Verify the live API schema and normalized columns.
- Compare anomaly flags with historical baselines and known reporting artifacts.
- Test sensitivity to minimum history length and threshold selection.
- Document false positives and false negatives using a held-out historical period where suitable reference labels exist.
- Evaluate differences by condition and jurisdiction before claiming general performance.
