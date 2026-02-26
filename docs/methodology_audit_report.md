# Methodology Audit Report

Project: America's Development Paradox (MDG 2006-2015 analysis)  
Scope reviewed: notebooks, helper/statistical code, chart generation code, website narrative/claims, raw data coverage.

## Executive Summary

The project has a strong narrative and clear communication design, but there are several methodological weaknesses that reduce analytic credibility. The most important problems are:

1. Country-vs-country claims are partially built on country + aggregate mixed samples.
2. Some headline claims treat missing 2015 CO2 data as if it were observed.
3. The "all high-income countries" z-score framing is not actually all high-income countries.
4. Several narrative statements overgeneralize beyond what the calculations support.

Main implication: The central story (U.S. underperforming peers on key health/outcome metrics) is directionally supported, but parts of the methodology and wording overstate certainty and consistency.

## Detailed Findings

### 1) Scatter outlier models include non-country aggregates

Severity: High

What is wrong:
- The scatter plot filter removes only a short aggregate list and then keeps all 3-letter codes.
- Many non-country aggregates remain (for example Arab World, Euro area, IDA/IBRD groupings).

Evidence:
- `visualizations/charts.py:236`
- `visualizations/charts.py:237`
- `website/assets/scatter_maternal.html:1`

Quantified impact:
- In 2010 maternal scatter, 218 points are used, including 40 aggregates (only 178 are country rows).

Why this matters:
- The chart is presented as a country-level wealth/outcome relationship.
- Mixing aggregates with countries changes the fitted trendline and weakens the "U.S. is an outlier among countries" interpretation.

Recommended fix:
- Filter by metadata to keep only entities with a real country region classification from `MDG_Metadata_coded.xlsx` (`Country - Metadata`, non-null `Region`).

### 2) CO2 trend claim uses a year with missing values

Severity: High

What is wrong:
- The website states a decade CO2-per-capita reduction while 2015 CO2 is missing for all peer countries (including the U.S.).

Evidence:
- `website/index.html:259`
- `website/index.html:260`
- `coded_reshaped_mdg.csv` coverage check: `co2_emissions_percap` is null for all 6 peers in 2015.

Quantified impact:
- The reported "-14%" aligns with roughly 2006->2014 (~-13.6%), not a full 2006->2015 decade comparison.

Why this matters:
- This is a core headline statistic.
- Treating missing end-year data as observed reduces trust in the results.

Recommended fix:
- Explicitly relabel as 2006->2014 for CO2 or choose another complete indicator for 2006->2015.

### 3) "All high-income countries" z-score section uses a manual subset

Severity: High

What is wrong:
- Notebook section title says "all high-income countries," but the code uses a hardcoded list of 46 "well-known" codes.
- Metadata contains 85 high-income country-like entities with region labels; 39 are omitted.

Evidence:
- `analysis/02_benchmarking.ipynb:86`
- `analysis/02_benchmarking.ipynb:99`
- `analysis/02_benchmarking.ipynb:109`

Why this matters:
- Z-scores and percentiles are sensitive to the reference distribution.
- Manual subset selection can materially shift percentile/ranking conclusions.

Recommended fix:
- Build the high-income set programmatically from metadata for the target year and document inclusion/exclusion criteria.

### 4) Narrative overstatement: "Peers consistently improved across the board"

Severity: High

What is wrong:
- The narrative claims all peers improved broadly, but multiple peer-country-indicator pairs do not improve from 2006 to 2015.

Evidence:
- `website/index.html:139`
- `coded_reshaped_mdg.csv` comparison across peers and focus indicators.

Quantified impact:
- 16 non-improvement cases across peer-country-indicator combinations in the selected focus variables.

Why this matters:
- This statement strengthens contrast with the U.S.; if overstated, it biases audience interpretation.

Recommended fix:
- Replace with a bounded claim (for example, peers improved on most key health outcomes, with notable exceptions).

### 5) Comparator claim "complete data coverage" is inaccurate

Severity: Medium-High

What is wrong:
- Methods text says the peer group has complete data coverage.
- At minimum, two focus indicators (`co2_emissions_percap`, `co2_emissions_by_gdp`) are missing for all six peers in 2015.

Evidence:
- `website/index.html:224`
- `analysis/helpers.py:35`
- `analysis/helpers.py:48`
- `coded_reshaped_mdg.csv` missingness profile.

Why this matters:
- Complete coverage is used to justify comparator selection.
- Incorrect coverage statements can be challenged quickly in Q&A.

Recommended fix:
- State coverage precisely (for example, near-complete across 2006-2014; 2015 CO2 missing for all peers).

### 6) Ranking method mishandles ties

Severity: Medium

What is wrong:
- Peer ranks are cast directly to integer after `rank()`, truncating fractional tied ranks.

Evidence:
- `analysis/02_benchmarking.ipynb:240`
- `analysis/02_benchmarking.ipynb:242`

Quantified impact:
- USA has fractional tie ranks in multiple year/indicator combinations (for example `pct_undernourished` repeatedly at 3.5), which are truncated.

Why this matters:
- Tie handling influences comparative narratives ("ranked X of 6").

Recommended fix:
- Keep fractional ranks, or use explicit tie policy (`min`, `max`, `dense`) and document it.

### 7) Trend table drops valid 0% changes

Severity: Medium

What is wrong:
- `round(usa_pct, 1) if usa_pct else None` maps real `0.0` changes to missing.

Evidence:
- `analysis/03_trends_and_rankings.ipynb:141`

Why this matters:
- Flat trends (for example maternal mortality) are central to the project's claims.
- Encoding exact zero as missing is a data integrity bug.

Recommended fix:
- Use `if usa_pct is not None` instead of truthiness.

### 8) Radar normalization and clipping can distort comparative scale

Severity: Medium

What is wrong:
- Radar scores are normalized to min/95th percentile per indicator and clipped to [0,100].
- Extreme but plausible values can collapse to 0/100, losing relative distance information.

Evidence:
- `visualizations/charts.py:80`
- `visualizations/charts.py:82`
- `visualizations/charts.py:89`

Quantified impact:
- U.S. 2010 `co2_emissions_percap` falls beyond the 95th percentile cutoff and is clipped to 0 in the scorecard.

Why this matters:
- Clipping can visually exaggerate "dents" and compress within-group variation.

Recommended fix:
- Use robust but symmetric scaling with documented rationale; report raw values alongside normalized views.

### 9) Grade thresholds are arbitrary and unvalidated

Severity: Medium

What is wrong:
- Letter grades are derived from fixed cutoffs (10%, 25%, 50%) without justification or sensitivity analysis.

Evidence:
- `analysis/helpers.py:127`
- `analysis/helpers.py:135`

Why this matters:
- Letter grades create a strong rhetorical effect.
- Unjustified thresholds can be interpreted as subjective framing.

Recommended fix:
- Replace with continuous scores or add a threshold sensitivity appendix.

### 10) "Income group impersonation" uses heuristic thresholds without statistical basis

Severity: Medium

What is wrong:
- Outlier flags are set by hard multipliers versus HIC aggregate (1.5x and 0.5x).

Evidence:
- `analysis/02_benchmarking.ipynb:200`
- `analysis/02_benchmarking.ipynb:202`

Why this matters:
- These thresholds determine headline "acts like/outlier" labels.
- Without uncertainty bands or formal distance metrics, labeling can be unstable.

Recommended fix:
- Use standardized distances (z-score distance to groups) and report confidence/robustness checks.

### 11) Indicator direction assumptions are normative and not fully defended

Severity: Medium

What is wrong:
- Some variables are treated as universally "higher is better" or "lower is better" without policy context (notably `trade_pct_gdp`, `net_oda_provided_pctgni`).

Evidence:
- `analysis/helpers.py:42`
- `analysis/helpers.py:43`

Why this matters:
- Direction assumptions directly flip sign of "better/worse" in scorecards and diverging bars.

Recommended fix:
- Add a transparent rationale per indicator and provide a sensitivity view excluding ambiguous indicators.

### 12) Constant/near-constant indicators are still ranked and graded

Severity: Medium

What is wrong:
- `pct_undernourished` is flat at 2.5 for all six peers across 2006-2015, yet included in ranking and scoring.

Evidence:
- `analysis/helpers.py:47`
- `analysis/03_trends_and_rankings.ipynb:61`

Why this matters:
- No discriminative power; adds pseudo-information to rank/grade outputs.

Recommended fix:
- Drop indicators with zero or near-zero variance in the comparison set.

### 13) Causal phrasing from correlational plots

Severity: Medium

What is wrong:
- Narrative uses causal-sounding language based on cross-sectional correlation/trendline visuals.

Evidence:
- `website/index.html:124`
- `website/index.html:115`
- `visualizations/charts.py:263`

Why this matters:
- Wealth-health relationship in these charts is associative, not causal.

Recommended fix:
- Rephrase as association and add caveat about confounding and model limitations.

### 14) Website rebuild regex is fragile (reproducibility risk)

Severity: Low-Medium

What is wrong:
- Build replacement pattern for chart containers is non-greedy and can stop at the first inner `</div>` after charts are embedded.

Evidence:
- `visualizations/export_charts.py:90`

Why this matters:
- Rebuilding can partially replace chart blocks and degrade reproducibility of the presentation artifact.

Recommended fix:
- Use explicit placeholder tokens or parse DOM safely instead of regex over nested HTML.

### 15) Notebook reproducibility is incomplete

Severity: Low-Medium

What is wrong:
- Notebooks are unexecuted (`execution_count: null`, empty outputs).
- Claimed saved CSV outputs are not present in `analysis/`.

Evidence:
- `analysis/01_data_exploration.ipynb:14`
- `analysis/02_benchmarking.ipynb:14`
- `analysis/03_trends_and_rankings.ipynb:14`
- `analysis/02_benchmarking.ipynb:276`
- `analysis/03_trends_and_rankings.ipynb:219`

Why this matters:
- External reviewers cannot reproduce tables/figures directly from the notebook artifacts.

Recommended fix:
- Execute notebooks end-to-end and commit generated analytic tables or provide a deterministic script pipeline.

## What Still Holds Up

Despite the issues above, several core conclusions are supported by the current data:
- U.S. is last among the six peers on life expectancy in 2010.
- U.S. maternal mortality is materially above peer average and flat from 2006 to 2015.
- U.S. adolescent fertility is much higher than peer average in the selected snapshot.

These claims should remain, but with tightened methodology and corrected wording.

## Priority Fix Order (for conference-quality rigor)

1. Correct country-vs-aggregate filtering in scatter analyses.
2. Correct all trend claims that depend on missing 2015 CO2 values.
3. Rebuild z-score reference population from metadata (not hardcoded subset).
4. Fix ranking ties and zero-change handling bugs.
5. Add a short methods appendix on indicator selection, directionality, and sensitivity checks.
6. Re-execute notebooks and publish reproducible outputs.

