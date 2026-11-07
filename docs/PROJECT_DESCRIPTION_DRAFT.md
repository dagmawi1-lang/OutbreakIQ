# OutbreakIQ — Project Description (submission draft)

**Theme:** AI x Healthcare  
**Project type:** Public-health data intelligence platform

## Problem

Public-health surveillance systems publish large volumes of disease-reporting data. Exploring these records across conditions, jurisdictions, and reporting periods can be difficult, especially when users need to distinguish unusual statistical values from routine variation and understand data limitations.

## Solution

OutbreakIQ is an interactive public-health surveillance prototype that brings aggregate disease-reporting data, transparent statistical screening, geographic visualization, and evidence-grounded explanations into one workspace. It is designed to help users explore patterns and identify observations that may warrant additional review by qualified public-health professionals.

## Key features

- Connects to the CDC NNDSS Weekly Data catalog, with CSV import as an alternative.
- Displays reporting trends through interactive charts and geographic views.
- Screens condition/location time series for unusually high observations using a rolling historical baseline.
- Explains flagged values with the reported count, comparison baseline, and statistical score.
- Provides an assistant that summarizes the current evidence while communicating uncertainty and limitations.
- Exports filtered observations for further analysis.
- Avoids double counting by flagging national, regional, and residency total rows and excluding them from "All locations" by default.
- Validates imported CSV files: reports missing columns and skipped rows, and treats suppression markers (U, NP, NC, -) as missing data, never as zero.

## Technical approach

The frontend uses React and Vite. A Node/Express API retrieves public CDC data. One shared normalization module, used by both browser and server, maps CDC column names (including Socrata's generic `m1`/`m2`/`m3` measure columns), title-cases reporting areas, and rejects invalid years and weeks. The API, applies request limits, and provides analysis/explanation endpoints. Statistical anomaly screening uses a rolling mean and standard deviation. The optional language-model integration is server-side and receives only aggregate dashboard context.

## Impact and limitations

OutbreakIQ aims to make public-health reporting data more accessible for education and exploratory analysis. It does not diagnose patients, predict disease spread, or confirm outbreaks. CDC weekly data are provisional and may be revised. Statistical flags require verification and should not be used as clinical or emergency guidance.

## Data source

CDC National Notifiable Diseases Surveillance System (NNDSS) Weekly Data: https://data.cdc.gov/d/x9gk-5huc
