# Story Script Traceability V4 (Mechanism + Expansion Pass)

This file maps `docs/story_script_v4.md` to concrete evidence and the revised seven-beat structure.

## `StoryBeat` schema

- `beat_id`: string
- `narrative_goal`: string
- `visual_state`: string
- `focal_entities`: string[]
- `time_anchor`: string
- `spoken_claim`: string
- `primary_evidence`: string[]
- `fallback_evidence`: string
- `caveat_ref`: string
- `transition_out`: string

---

## Beat Map

| Beat ID | Narrative Goal | Visual State | Focal Entities | Time Anchor | Spoken Claim | Primary Evidence | Fallback Evidence | Caveat Ref | Transition Out |
|---|---|---|---|---|---|---|---|---|---|
| `b1_curve_mechanism` | Teach the income-health curve as the single mechanism and set scale intuition | Empty axes -> 2010 cloud -> trend line -> gap distribution strip | Global | 2010 | Income explains much, but not all; typical and outlier gap sizes differ materially | Life expectancy model fit `R² ~= 0.6645` (2010); median absolute gap `~2.662 years`; 90th-percentile absolute gap `~7.752 years`; extrema `+11.005` (Vietnam) and `-17.793` (Equatorial Guinea) | IQR of raw gaps in 2010: about `-1.547` to `+3.059` | Methods bullets 2-3 | Move from mechanism to one country trajectory |
| `b2_rwanda_trajectory` | Land emotional trajectory and contextualize baseline | Rwanda under-5 cards 2006/2015 + pause beats + Rwanda dot path vs line | Rwanda | 2006-2015 | Rwanda shows large multi-indicator improvement and movement relative to expectation | Under-5 `98.3 -> 42.0`; maternal `534 -> 290`; infant `62.6 -> 31.4`; life expectancy `57.219 -> 66.696`; life-expectancy residual gap moves from negative (2006) to positive (2010, 2015) | Rwanda life-expectancy residuals: `-0.827` (2006), `+2.750` (2010), `+4.410` (2015) displayed on-chart | Methods bullets 2-4 | Introduce line-relative definition (above/below) |
| `b3_vietnam_brief` | Confirm Rwanda is not a one-off positive case | Rwanda + Vietnam dots highlighted together | Vietnam (+ Rwanda as reference) | 2010 | A second country in a different context sits strongly above expectation | Vietnam life expectancy `75.117` vs expected `64.112` (gap `+11.005`) in 2010 | Vietnam remains above line in 2015 (`+9.130` years) | Methods bullets 2-3 | Shift to counterexample among high-income countries |
| `b4_us_comparison_arc` | Build a skepticism-resistant U.S. section with peer and decade evidence | U.S. highlight -> peer-income band -> 2006/2010/2015 scrubber -> small multiples vs peers | United States (+ peer set; Canada comparator) | 2010 anchor + 2006-2015 trend | U.S. is below expectation and does not close the gap; multi-indicator trend under-converts wealth vs peers | U.S. life expectancy `78.541` vs expected `81.115` (gap `-2.573`) in 2010; U.S. life gap `-3.123` (2006), `-2.573` (2010), `-3.664` (2015); in +/-25% U.S.-income peer band, only one country has lower life expectancy; U.S. maternal `14.0 -> 14.0` vs high-income mean maternal trend `-16.554%`; U.S. infant trend `-13.433%` vs high-income mean `-23.147%`; U.S. under-5 trend `-13.924%` vs high-income mean `-22.928%` | Canada maternal trend `9.0 -> 7.0` as one concrete comparator | Methods bullets 3-4 | Cut to mirror failure case below the line |
| `b5_mirror_failure` | Show severe below-line underperformance and floor condition in one beat | Equatorial Guinea gap lock + Sierra Leone floor annotation | Equatorial Guinea, Sierra Leone | 2010 | Extreme negative gaps and floor outcomes are part of the same conversion failure | Equatorial Guinea life expectancy `55.908` vs expected `73.701` (gap `-17.793`); Sierra Leone maternal mortality `1630` (2010) | Equatorial Guinea infant `80.5` vs expected `17.19`; under-5 `113.5` vs expected `22.5` | Methods bullets 3-4 | Transition to forward-looking distribution dynamics |
| `b6_what_changes_gap` | Add forward-looking section: does global line-relative spread compress over time? | Global year slider 2006-2015 + updating distribution panel + selected improver highlights | Global (with Rwanda callout) | 2006-2015 | Global gaps compress somewhat but remain large; divergence is persistent, not fixed | Median absolute life gap `3.123` (2006) -> `2.702` (2015); 90th percentile `9.250` (2006) -> `7.348` (2015); mean absolute gap `4.200` -> `3.233` | Share above line remains mixed, not converged (`0.567` in 2006, `0.555` in 2015) | Methods bullets 2-3 | Move to constrained-hope close |
| `b7_close` | Land thesis without recap list | Quiet full cloud + line final frame | Global | 2010 + decade context | Divergence around the line implies policy space: progress can be governed | Evidence accumulated in `b2` to `b6` using one line-relative grammar | Final-line anchor: governance framing follows non-causal but persistent cross-case pattern | Methods all bullets | End on governance-vs-math closing line |

---

## Data Sources

- `website/data/country_year_long.json`
- `website/data/residuals_long.json`
- `website/data/country_trends.json`
- `website/data/metadata.json`

---

## Note on Historical Context Line

The Rwanda context sentence references broad historical background (mid-1990s institutional collapse) without introducing external numeric claims. All quantitative claims remain dataset-backed above.

---

## V4 Enforcement Checks

1. Seven critique cuts applied (no removed filler phrases remain).
2. One mechanism persists through all beats: distance from the income-life expectancy line.
3. Vietnam restored as a brief confirmation beat, not a full standalone section.
4. U.S. beat contains multi-indicator and peer-comparison arc.
5. Forward-looking section added using decade distribution dynamics.
