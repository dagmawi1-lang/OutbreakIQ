# Methodology and interpretation

## Purpose
OutbreakIQ surfaces unusual disease-reporting observations for human review. It does not decide whether an outbreak exists.

## Processing
1. Load observations from the configured source or synthetic demo data.
2. Normalize records into the application's internal format.
3. Group observations by disease and geographic dimensions.
4. Order each series by reporting period.
5. Compare each observation with a recent historical baseline.
6. Display the observation and screening result together.

## Rolling standardized deviation
For current observation `x`, historical mean `μ`, and historical standard deviation `σ`:

`z = (x - μ) / σ`

The prototype uses a bounded recent history and a minimum-history requirement. A score above the configured positive threshold can be surfaced as unusually high. If the standard deviation is zero or invalid, a score should be treated as unavailable rather than fabricated.

## Interpretation
An anomaly means the reported value differs unusually from the selected historical baseline under this simple method. It does not establish an outbreak, a cause, an individual's infection probability, or a need for a particular action.

## Confounders
Possible explanations include true changes, reporting delays, backlogs, revisions, missing periods, seasonality, surveillance or testing changes, population differences, and random variation.

## AI grounding
AI explanations should refer only to supplied observations and calculated statistics, distinguish counts from rates, acknowledge insufficient evidence, avoid unsupported causal claims, and never diagnose or recommend treatment.

## Limitations and future work
The prototype is exploratory, not validated for operational surveillance. Future work could include seasonal baselines, population-adjusted rates, confidence intervals, change-point detection, exponentially weighted moving averages, spatial clustering, missing-data diagnostics, and source revision tracking. Each method requires evaluation on appropriate historical data.
