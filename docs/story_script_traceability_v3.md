# Story Script Traceability V3 (Persistent-Curve Mechanism)

This file maps `docs/story_script_v3.md` to source evidence with one persistent visual grammar: distance from the income-life expectancy line.

## `StoryBeat` schema

- `beat_id`: string
- `narrative_goal`: string
- `visual_state`: string
- `focal_entities`: string[]
- `time_anchor`: string
- `spoken_claim`: string
- `primary_evidence`: string[]
- `fallback_evidence`: string
- `caveat_link`: string
- `transition_out`: string

---

## Beat Map

| Beat ID | Narrative Goal | Visual State | Focal Entities | Time Anchor | Spoken Claim | Primary Evidence | Fallback Evidence | Caveat Link | Transition Out |
|---|---|---|---|---|---|---|---|---|---|
| `b1_curve_rule` | Teach the single rule before any country narrative | Empty axes -> 2010 dot cloud -> trend line | Global (217 countries) | 2010 | Income predicts much, but not all, of life expectancy | Life expectancy model `R² ~= 0.6645` in 2010 | Residual span in 2010 from about `-17.79` to `+11.00` years | Methods bullets 2-3 | Move from rule to one trajectory on that same line |
| `b2_rwanda_trajectory` | Open with emotional trajectory and delay interpretation | Rwanda under-5 2006 card -> hold -> 2015 card -> hold -> dot path vs line | Rwanda | 2006-2015 | Rwanda moved from near/below expectation to above expectation while outcomes improved sharply | Under-5 `98.3 -> 42.0`; maternal `534 -> 290`; infant `62.6 -> 31.4`; life expectancy residual gap `-0.83` (2006), `+2.75` (2010), `+4.41` (2015) | Rwanda life expectancy `57.22 -> 66.70` (`+16.6%`) | Methods bullets 2-3 | Zoom out to teach above/below residual framing |
| `b3_mechanism` | Define "above vs below line" as reusable grammar | Full scatter with residual distances visible | Global | 2010 | The story mechanism is the gap from expectation, not income rank alone | Residual sign convention from dataset (`quality_residual` positive = above expectation, negative = below) | Regional median residual context (e.g., South Asia `+0.74`, Sub-Saharan Africa `-0.63`, North America `-0.52`) | Methods bullet 3 | Move to counterintuitive high-income case |
| `b4_us_counterexample` | Deepen skepticism-resistant claim with peer context and trend persistence | U.S. highlight -> peer-income band -> U.S. 2006/2010/2015 gap scrubber -> maternal U.S. vs Canada mini-chart | United States, Canada (+ high-income peers) | 2010 anchor + 2006-2015 trend | U.S. underperforms life-expectancy expectation and does not close the gap over the decade | U.S. life expectancy `78.54` vs expected `81.11` in 2010 (gap `-2.57`); U.S. life-exp gap `-3.12` (2006), `-2.57` (2010), `-3.66` (2015); in a +/-25% U.S.-income 2010 band (17 countries), U.S. is `2nd` lowest on life expectancy | Maternal trend: U.S. `14.0 -> 14.0` vs Canada `9.0 -> 7.0` (2006-2015); high-income peer maternal mean change about `-16.55%` | Methods bullets 3-4 | Cut to mirror case below line |
| `b5_equatorial_guinea_mirror` | Show extreme below-line high-income failure case | Equatorial Guinea lock + gap bars | Equatorial Guinea | 2010 | Wealth can coexist with severe life expectancy underperformance | Equatorial Guinea life expectancy `55.91` vs expected `73.70` (gap `-17.79`) | Equatorial Guinea infant mortality `80.5` vs expected `17.19`; under-5 `113.5` vs expected `22.5` | Methods bullets 3-4 | Hold pattern and reveal floor annotation |
| `b6_sierra_leone_floor` | Add one hard floor datapoint without new full section | Floor annotation over same residual/map state | Sierra Leone | 2010 | The distribution floor shows the human cost when systems fail | Sierra Leone maternal mortality `1630` per 100,000 in 2010 | Sierra Leone health-bundle mean percentile around `0.3` in 2010 | Methods bullet 4 | Return to full field for close |
| `b7_close` | Land constrained-hope thesis without recap list | Full scatter + residual map, then quiet close | Global | 2010 + decade context | Pattern divergence implies policy space: progress is governable | Cross-case evidence from beats `b2` to `b6` all expressed on one line-relative grammar | Global residual span and persistent spread across regions | Methods all bullets | End on governance-vs-math line |

---

## Data Sources

- `website/data/country_year_long.json`
- `website/data/residuals_long.json`
- `website/data/country_trends.json`
- `website/data/metadata.json`

---

## V3 Enforcement Checks

1. One visual grammar reused throughout: `distance to income-life expectancy line`.
2. Load-bearing country set limited to Rwanda, U.S., Equatorial Guinea, Sierra Leone.
3. U.S. section includes peer context and decade persistence, not only one-year snapshot.
4. Rwanda interpretation delayed with explicit visual pause.
5. No end-of-story recap bullets; close moves directly to thesis and final line.
