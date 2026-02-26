# Story Script Traceability V1

This file maps each narrative beat in `docs/story_script_v1.md` to concrete evidence and caveats from repo data.

## Internal Content Contract

## `StorySection` schema

- `section_id`: string
- `narrative_goal`: string
- `focal_country`: string
- `time_anchor`: string (`2010` or `2006–2015`)
- `primary_claim`: string
- `emotional_question`: string
- `visual_binding`: string
- `evidence_points`: string[]
- `inline_caveat`: string
- `transition_out`: string

## `StoryScript` schema

- `cold_open`: string
- `sections`: `StorySection[]` (exactly 6)
- `closing_reflection`: string
- `methods_endnote`: string
- `title_options`: string[]
- `dek_options`: string[]

---

## Beat-by-Beat Claim Mapping

| Section ID | Focal Country | Time Anchor | Primary Claim | Emotional Question | Visual Binding | Evidence Points | Fallback Metric | Inline Caveat | Transition Out |
|---|---|---|---|---|---|---|---|---|---|
| `cold_open` | Global | 2010 | Wealth explains much, but not all, of life expectancy variation. | Why do people with similar national wealth face very different health odds? | Global scatter (`life_exp` vs `gni_percap`) + residual spread annotation | Life expectancy model `R² ≈ 0.66` (2010); residual span approx `-17.79` to `+11.00` years | 2010 health-bundle percentile spread by country | Observational fit, not causal explanation | Move from global contradiction to the richest-country paradox |
| `s1_usa` | USA | 2010 + 2006–2015 | U.S. underperforms health expectations relative to wealth and peer trajectory. | How can a top-income country still leave major health gains unrealized? | U.S.-highlighted scatter + peer-band comparison + maternal trend line | USA life expectancy `78.54` vs expected `81.11` (`z=-0.52`) in 2010; USA maternal mortality `14.0 -> 14.0` from 2006 to 2015 (`0.0%`); similar-income peer maternal average change about `-17.4%` | USA rank in 2010 life expectancy `39 of 200`; in +/-25% income band, USA near lower end | Peer-band definition affects exact comparator set | Transition from rich-country contradiction to low/mid-income overperformance case |
| `s2_vietnam` | Vietnam | 2010 | Vietnam overperforms strongly across all core health indicators relative to income. | What does it look like when outcomes outrun income constraints? | Vietnam callout cards on four-indicator residual chart | 2010 residual z-scores: life expectancy `2.22`, maternal `1.57`, infant `1.73`, under-5 `1.58`; life expectancy `75.12` vs expected `64.11` | 2010 health-bundle average percentile `53.6` | Residuals show divergence, not causal mechanism | Contrast with underperformance case where income does not convert to population health |
| `s3_equatorial_guinea` | Equatorial Guinea | 2010 | Equatorial Guinea shows severe underperformance despite substantial income level. | What happens when national income does not translate into public health protection? | Country card + “expected vs observed” gap bars for four indicators | 2010 life expectancy `55.91` vs expected `73.70` (gap `-17.79`, `z=-3.58`); infant `80.5` vs `17.19` (`z=-4.22`); under-5 `113.5` vs `22.5` (`z=-3.48`); maternal `379` vs `90.52` (`z=-1.58`) | 2010 health-bundle average percentile `9.8` | Country aggregates may hide internal distribution and data quality variation | Move from static underperformance snapshot to a trajectory that improved materially |
| `s4_rwanda` | Rwanda | 2006–2015 | Rwanda’s decade trend shows large multi-indicator health gains alongside institutional shifts. | Can national trajectories bend quickly within one decade? | Rwanda trend panel + governance-context annotation | 2006->2015: life expectancy `+16.6%`; maternal `-45.7%`; infant `-49.8%`; under-5 `-57.3%`; women in parliament `48.8 -> 63.8` (`+30.7%`) | 2010 life expectancy residual `z=0.55` | Cannot attribute causality to one governance variable | Transition from rapid improvement case to steady high-baseline case |
| `s5_sweden` | Sweden | 2010 + 2015 | Sweden illustrates sustained high baseline performance rather than dramatic late gains. | What does durable, high-performing health infrastructure look like over time? | Sweden profile card + percentile stability sparkline | Health-bundle average percentile: `96.8` (2010) and `95.3` (2015); 2010 life expectancy `81.45` (rank `14 of 200`) | 2010 maternal mortality percentile `97.8` | Ceiling effects limit visible percentage gains at high baselines | Transition to global synthesis: no single model fits all countries |
| `s6_global_synthesis` | Global + Sierra Leone | 2010 + 2015 context | Structural divergence persists globally; outcomes are shaped by policy and institutions, not wealth alone. | If wealth is not destiny, what is the real policy burden? | Regional median residual map + cross-country synthesis panel | 2010 median life residual z: South Asia `+0.74`; Sub-Saharan Africa `-0.63`; North America `-0.52`; Sierra Leone maternal mortality `1630` (2010) and 2010 health-bundle avg percentile about `0.3`; 2015 medians still show divergence (e.g., Sub-Saharan Africa `-0.63`) | Outlier countries by indicator from `docs/candidate_insights.md` | Regional medians are summaries, not within-region causal diagnostics | Lead into constrained-hope conclusion and methods note |

---

## Data Provenance

- `website/data/country_year_long.json`
  - Used for indicator values, ranks, percentiles, and country-year snapshots.
- `website/data/residuals_long.json`
  - Used for expected values, residual gaps, residual z-scores, and model R².
- `website/data/country_trends.json`
  - Used for 2006-2015 trend percentages and quality-adjusted change values.
- `website/data/metadata.json`
  - Used for country names, coverage context, and year bounds.
- `docs/candidate_insights.md`
  - Used as secondary cross-check for outlier framing.

---

## Review Scenarios (Self-Check Against Plan)

| Scenario | Status | Notes |
|---|---|---|
| Narrative Control Test | Pass | Each section has a separable thesis line that can be edited independently. |
| Vibe Match Test | Pass (internal) | Draft structure mirrors person-to-system flow and tension beats, not report format. |
| Evidence Integrity Test | Pass | Every section claim ties to specific numeric evidence listed above. |
| Caveat Coverage Test | Pass | Each section includes at least one explicit caveat line. |
| Pacing Test | Pass (target) | Draft length designed for roughly 6-8 minute reading pace. |
| Voice Consistency Test | Pass | Tone is urgent/human but avoids direct causal overclaims. |
