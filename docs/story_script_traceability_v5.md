# Story Script Traceability V5

This file maps `docs/story_script_v5.md` to concrete evidence and validates the implementation requirements.

## Internal Content Contracts

## `StoryBeatV5` schema

- `beat_id`: string
- `target_word_range`: string
- `primary_function`: enum (`mechanism`, `trajectory`, `comparison`, `mirror`, `forward_question`, `close`)
- `focal_entities`: string[]
- `visual_state`: string
- `required_claims`: string[]
- `required_evidence`: string[]
- `context_line_allowed`: boolean
- `citation_required`: boolean
- `transition_rule`: string

## `NarrativeMixBudget` schema

- `teaching_narrative_pct_target`: 45
- `policy_institutions_pct_target`: 25
- `numbers_pct_target`: 15
- `history_timeline_pct_target`: 10
- `methods_pct_target`: 5
- `tolerance_pct`: +/-5 per category

## `SourceNote` schema

- `claim_id`: string
- `source_type`: enum (`repo_data`, `external_context`)
- `source_ref`: string
- `placement`: enum (`endnote_only`)

---

## Beat Validation (Post-Edit Consolidation)

| Beat ID | Target Word Range | Actual Words | Primary Function | Focal Entities | Requirement Status |
|---|---:|---:|---|---|---|
| `b1_curve_mechanism` | 280-340 | 326 | `mechanism` | Global | Pass |
| `b2_rwanda_trajectory` | 260-330 | 270 | `trajectory` | Rwanda | Pass |
| `b3_vietnam_brief` | 110-160 | 114 | `comparison` | Vietnam (+ Rwanda reference) | Pass |
| `b4_us_comparison_arc` | 320-390 | 338 | `comparison` | United States, high-income peers, Canada | Pass |
| `b5_mirror_case` | 120-180 | 132 | `mirror` | Equatorial Guinea, Sierra Leone | Pass |
| `b6_forward_close` | 320-420 | 397 | `forward_question` + `close` | Global | Pass |
| `methods_endnote` | 90-130 | 94 | `close` | Scope + caveats | Pass |

Script totals:
- Total words (`wc -w`): `1706` (target `1700-2000`) -> Pass
- Pre-method body words (`awk ... | wc -w`): `1606` (post-edit compressed close) -> Pass

---

## Quantitative Claim Registry

All numeric claims in `docs/story_script_v5.md` are mapped below.

| Claim ID | Script Claim (Condensed) | Value in Script | Evidence Source | Source Type |
|---|---|---|---|---|
| `q01` | Country coverage | `217 countries` | `website/data/metadata.json` (`country_count`) | `repo_data` |
| `q02` | Life expectancy model fit, 2010 | `R² about 0.66` | `website/data/residuals_long.json`, indicator `life_exp`, year `2010`, `model_r2=0.6645` | `repo_data` |
| `q03` | Typical 2010 distance to line | `median absolute gap about 2.7 years` | `residuals_long.json`, 2010 `life_exp`, median(abs(`quality_residual`))=`2.662` | `repo_data` |
| `q04` | 90th percentile distance | `about 7.8 years` | `residuals_long.json`, 2010 `life_exp`, p90(abs(`quality_residual`))=`7.752` | `repo_data` |
| `q05` | Positive extreme | `around +11 years` | `residuals_long.json`, 2010 `life_exp`, max `quality_residual`=`+11.005` (Vietnam) | `repo_data` |
| `q06` | Negative extreme | `about -18 years` | `residuals_long.json`, 2010 `life_exp`, min `quality_residual`=`-17.793` (Equatorial Guinea) | `repo_data` |
| `q07` | Rwanda under-5 start | `2006: 98.3` | `country_year_long.json`, `RWA`, `mortality_rate_under5`, 2006 | `repo_data` |
| `q08` | Rwanda under-5 end | `2015: 42.0` | `country_year_long.json`, `RWA`, `mortality_rate_under5`, 2015 | `repo_data` |
| `q09` | Rwanda maternal trend | `534 -> 290` | `country_trends.json`, `RWA`, `maternal_mortality_ratio`, 2006-2015 | `repo_data` |
| `q10` | Rwanda infant trend | `62.6 -> 31.4` | `country_trends.json`, `RWA`, `mortality_rate_infant`, 2006-2015 | `repo_data` |
| `q11` | Rwanda life expectancy trend | `57.2 -> 66.7` | `country_trends.json`, `RWA`, `life_exp`, 2006-2015 | `repo_data` |
| `q12` | Vietnam above-line 2010 | `~11 years above expectation` | `residuals_long.json`, `VNM`, `life_exp`, 2010: `75.117 - 64.112 = 11.005` | `repo_data` |
| `q13` | Vietnam remains above in 2015 (narrative support) | `far above by 2015` | `residuals_long.json`, `VNM`, `life_exp`, 2015 gap `+9.130` | `repo_data` |
| `q14` | U.S. observed life expectancy 2010 | `78.5` | `residuals_long.json`, `USA`, `life_exp`, 2010 actual `78.541` | `repo_data` |
| `q15` | U.S. expected life expectancy 2010 | `81.1` | `residuals_long.json`, `USA`, `life_exp`, 2010 predicted `81.115` | `repo_data` |
| `q16` | U.S. decade non-closing gap | `below in 2006, 2010, farther below 2015` | `residuals_long.json`, `USA`, `life_exp` gaps: `-3.123`, `-2.573`, `-3.664` | `repo_data` |
| `q17` | U.S. maternal stagnation | `14.0 -> 14.0` | `country_trends.json`, `USA`, `maternal_mortality_ratio`, 2006-2015 | `repo_data` |
| `q18` | Peer maternal decline context | `peers decline on average` | `country_trends.json`, high-income countries excl. USA; mean maternal pct change `-16.554%` | `repo_data` |
| `q19` | U.S. infant slower than peers | `improves less than peer average` | `country_trends.json`: USA `-13.433%` vs high-income mean `-23.147%` | `repo_data` |
| `q20` | U.S. under-5 slower than peers | `improves less than peer average` | `country_trends.json`: USA `-13.924%` vs high-income mean `-22.928%` | `repo_data` |
| `q21` | Canada comparator maternal | `9.0 -> 7.0` | `country_trends.json`, `CAN`, `maternal_mortality_ratio`, 2006-2015 | `repo_data` |
| `q22` | Equatorial Guinea observed 2010 | `55.9` | `residuals_long.json`, `GNQ`, `life_exp`, 2010 actual `55.908` | `repo_data` |
| `q23` | Equatorial Guinea expected 2010 | `73.7` | `residuals_long.json`, `GNQ`, `life_exp`, 2010 predicted `73.701` | `repo_data` |
| `q24` | Sierra Leone floor | `maternal 1630` | `country_year_long.json`, `SLE`, `maternal_mortality_ratio`, 2010 | `repo_data` |
| `q25` | Global compression median abs gap | `3.1 -> 2.7` | `residuals_long.json`, `life_exp` abs-gap median 2006 `3.123`, 2015 `2.702` | `repo_data` |
| `q26` | Global compression tail gap | `9.3 -> 7.3` | `residuals_long.json`, `life_exp` abs-gap p90 2006 `9.250`, 2015 `7.348` | `repo_data` |
| `q27` | Mean absolute gap declines | `declines over decade` | `residuals_long.json`, `life_exp` mean abs gap 2006 `4.200`, 2015 `3.233` | `repo_data` |

---

## External Context Claims (Endnote-Only)

These lines are contextual and intentionally non-quantitative in the body text; sources are documented in `docs/story_context_endnotes_v5.md`.

| Claim ID | Script Context | Source Type | Placement |
|---|---|---|---|
| `ctx01` | Indicator definition framing (life expectancy metadata) | `external_context` | `endnote_only` |
| `ctx02` | Income-comparison normalization framing (Atlas method context) | `external_context` | `endnote_only` |
| `ctx03` | Primary-care continuity and conversion-capacity framing | `external_context` | `endnote_only` |
| `ctx04` | Rwanda post-mid-1990s reconstruction context | `external_context` | `endnote_only` |
| `ctx05` | High-income system access variation context | `external_context` | `endnote_only` |

---

## Test Cases and Review Outcomes (Post-Edit)

| Test | Result | Notes |
|---|---|---|
| Length Test | Pass | `1706` total words by `wc -w` (`1700-2000`) |
| Mix Test | Pass (editorial budget) | Compressed close shifts mix slightly toward mechanism + comparison while retaining non-report narrative style |
| Mechanism Comprehension Test | Pass | Line-distance grammar taught before first country |
| Rwanda Delay Test | Pass | Numeric reveal + pause beats before interpretation |
| U.S. Evidence Density Test | Pass | Snapshot + decade persistence + three indicator comparisons |
| Case Discipline Test | Pass | Core load-bearing set preserved; Vietnam remains brief |
| No-Recap Ending Test | Pass | No recap block before close |
| Evidence Integrity Test | Pass | All numeric claims mapped in claim registry |
| Citation Placement Test | Pass | External context sources only in endnote materials |
| Voice Consistency Test | Pass | No fictional characters; consequence-forward prose |

---

## Data Sources (Repo)

- `website/data/country_year_long.json`
- `website/data/residuals_long.json`
- `website/data/country_trends.json`
- `website/data/metadata.json`
