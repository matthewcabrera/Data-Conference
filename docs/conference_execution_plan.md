# Conference Execution Plan (Today + Tomorrow)

Project: MDG Global Deep Dive (All Countries)  
Objective: Deliver a conference-grade interactive site with reproducible all-country analysis and novel, defensible insights.

## 1) Success Criteria

By conference handoff, the project must satisfy all of the following:

1. Uses all individual countries (not a single-country narrative).
2. Every headline claim is traceable to a reproducible metric.
3. Interactive site supports multi-country comparison and deep country drill-down.
4. Methods are transparent: filtering, normalization, trend logic, and caveats are documented.
5. Demo flow can be presented live in 5-7 minutes without brittle dependencies.

## 2) Workstreams

## A. Data Engineering and Reproducibility

Deliverables:
- A deterministic pipeline script from raw data to frontend-ready artifacts.
- Country-only filtering using metadata (exclude aggregate entities for country analyses).
- Exported metrics:
  - Country-year indicator values
  - Within-year quality percentiles
  - Wealth-adjusted residuals
  - Per-country trend summaries
  - Top movers by indicator

Status:
- Completed: `analysis/build_global_site_data.py`
- Completed output files in `website/data/`
- Completed compact export format for faster browser load

## B. Statistical and Method Design

Deliverables:
- Documented indicator directionality assumptions.
- Explicit missing-data policy.
- Wealth-adjusted outlier method specification.
- Trend-quality metric specification.

Status:
- In progress (core metrics implemented in pipeline).
- Completed: methods/caveats section now included in global page.

## C. Interactive Site (Global)

Deliverables:
- New global interactive page with linked controls and visuals.
- Required interactions:
  - Indicator selector
  - Year slider
  - Region/income filters
  - Country selector
- Required visuals:
  - Global percentile map
  - Wealth vs outcome scatter (adjusted z color)
  - Country trend vs global median
  - Year distribution with selected-country marker
  - Top movers tables

Status:
- Completed: `website/global.html`
- Completed: `website/global.css`
- Completed: `website/global.js`
- Completed: `website/story.html`
- Completed: `website/story.css`
- Completed: `website/story.js`
- Completed: timelapse playback controls and ranking timelapse chart.
- Completed: multi-country compare controls and overlay support.
- Completed: unexpected peers recommender panel.

## D. Narrative and Insight Curation

Deliverables:
- 3-5 high-confidence findings with explicit evidence lines.
- Avoid overclaims (causal language, missing-year ambiguity, aggregate/country mixing).
- Conference narration script aligned to interactive sequence.

Status:
- In progress (`analysis/generate_candidate_insights.py` and `docs/candidate_insights.md` created).

## E. QA and Conference Readiness

Deliverables:
- Data QA checklist (coverage, missingness, entity filtering).
- Visual QA (desktop + mobile).
- Demo QA (page load, control latency, fallback behavior).
- Methods QA (claim-to-metric mapping).

Status:
- In progress (basic compile/syntax checks complete).

## 3) Timeline (Today / Tomorrow)

## Today

1. Finalize global data pipeline and all export artifacts.  
Status: Completed.

2. Ship first working global interactive page with core charts and controls.  
Status: Completed.

3. Add methods/limitations section for the global page.  
Status: Completed.

4. Generate candidate insight list from all-country outputs.  
Status: Completed.

## Tomorrow

1. Refine visual design and interaction performance.
2. Add comparative tools (multi-country overlay and/or peer finder).
3. Lock final 3-5 findings with exact metrics and caveats.
4. Produce final demo script + backup static screenshots.

## 4) Current Artifacts

- Data pipeline: `analysis/build_global_site_data.py`
- Story-slice pipeline: `analysis/build_story_chapter_data.py`
- Global interactive site:
  - `website/global.html`
  - `website/global.css`
  - `website/global.js`
- Narrative prototype:
  - `website/story.html`
  - `website/story.css`
  - `website/story.js`
- Generated data:
  - `website/data/metadata.json`
  - `website/data/country_year_long.json`
  - `website/data/residuals_long.json`
  - `website/data/country_trends.json`
  - `website/data/top_movers.json`
  - `website/data/story_life_expectancy.json`
- Audit baseline:
  - `docs/methodology_audit_report.md`
- Narrative seeds and ops:
  - `docs/candidate_insights.md`
  - `docs/global_site_runbook.md`

## 5) Next Prioritized Tasks

1. Curate and manually validate 3-5 final conference claims from `docs/candidate_insights.md`.
2. Add explicit claim cards to `website/global.html` with source metric references.
3. Tune visual performance for low-bandwidth conference Wi-Fi (optional JSON minification path).
4. Build the final conference demo script with fallback static screenshots.
