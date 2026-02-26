# Story Script Traceability V2 (Rwanda Spine)

This file maps each beat in `docs/story_script_v2.md` to concrete dataset evidence while keeping the narrative visual-first.

## Content Contract (V2)

## `StoryBeat` schema

- `beat_id`: string
- `narrative_goal`: string
- `focal_country`: string
- `time_anchor`: string
- `visual_state`: string
- `spoken_claim`: string
- `evidence_points`: string[]
- `fallback_metric`: string
- `methods_note_ref`: string
- `transition_out`: string

## `StoryScriptV2` schema

- `title_options`: string[]
- `dek_options`: string[]
- `beats`: `StoryBeat[]` (exactly 6)
- `closing_line`: string
- `methods_endnote`: string

---

## Beat-by-Beat Claim Mapping

| Beat ID | Focal Country | Time Anchor | Visual State | Spoken Claim | Evidence Points | Fallback Metric | Methods Note Ref | Transition Out |
|---|---|---|---|---|---|---|---|---|
| `b1_open_rwanda` | Rwanda | 2006-2015 | Under-5 time series animates `98.3 -> 42.0` | Rwanda demonstrates that a decade trajectory can bend materially. | Under-5 mortality: `98.3` (2006) to `42.0` (2015), `-57.3%`; maternal mortality: `534 -> 290` (`-45.7%`); infant mortality: `62.6 -> 31.4` (`-49.8%`); life expectancy: `57.22 -> 66.70` (`+16.6%`). | Rwanda health-bundle percentile mean: `16.5` (2006), `21.9` (2010), `26.6` (2015). | `methods_endnote` bullet 2 and 3 | Zoom from Rwanda trajectory to global wealth-outcome line |
| `b2_global_to_us` | Global + United States | 2010 (+ 2006-2015 context) | Global scatter with trend line, then U.S. highlighted and maternal trend inset | Income explains much, but wealthy countries can still underperform expected outcomes. | Life expectancy model fit in 2010: `R² ~= 0.66`; U.S. life expectancy `78.54` vs expected `81.11` (gap `-2.57`); U.S. maternal mortality `14.0 -> 14.0` from 2006 to 2015. | U.S. 2010 life expectancy rank `39/200`; U.S. health-bundle mean percentile `78.7` (2010). | `methods_endnote` bullet 2 and 3 | Move from high-income contradiction to low/mid-income overperformance |
| `b3_vietnam` | Vietnam | 2010 | Vietnam highlight on scatter + 4 indicator cards all on "better-than-expected" side | Vietnam overperforms income expectation across the full health bundle, not just one metric. | Life expectancy `75.12` vs expected `64.11`; maternal mortality `58` vs expected `345.74`; infant mortality `18.3` vs expected `44.21`; under-5 mortality `22.9` vs expected `64.09`. | Vietnam 2010 health-bundle mean percentile `53.6` with all four indicators above income expectation in residual table. | `methods_endnote` bullet 2 and 3 | Contrast with wealth-without-conversion case |
| `b4_equatorial_guinea_sierra_leone` | Equatorial Guinea + Sierra Leone | 2010 | Equatorial Guinea gap bars below line; Sierra Leone maternal callout at distribution floor | National income can coexist with severe underperformance when systems fail to convert resources into population protection. | Equatorial Guinea life expectancy `55.91` vs expected `73.70` (gap `-17.79`); infant mortality `80.5` vs expected `17.19`; under-5 `113.5` vs expected `22.5`; Sierra Leone maternal mortality `1630` (2010). | Equatorial Guinea health-bundle mean percentile `9.8` (2010); Sierra Leone health-bundle mean percentile `0.3` (2010). | `methods_endnote` bullet 4 | Shift from failure case to durability case |
| `b5_sweden` | Sweden | 2006-2015 (anchor 2010) | Stable high-baseline profile card and sparkline | High-performing systems are often defined by stability, not dramatic late-stage jumps. | Sweden health-bundle mean percentile `97.1` (2006), `96.8` (2010), `95.3` (2015); life expectancy `81.45` in 2010. | 2010 percentiles: maternal `97.8`, infant `97.7`, under-5 `98.4`. | `methods_endnote` bullet 5 | Pull from single-country consistency back to global synthesis |
| `b6_global_close` | Global (with six-country callback) | 2010 + decade context | Residual map with six-country highlights; return to Rwanda line for close | Wealth sets the line, but governance and institutions shape divergence above and below it. | Life expectancy residual span in 2010: about `-17.79` (Equatorial Guinea) to `+11.00` (Vietnam); regional life expectancy residual medians in 2010 include South Asia `+0.74`, Sub-Saharan Africa `-0.63`, North America `-0.52`. | Cross-country health-bundle contrast (2010): Sweden `96.8`, U.S. `78.7`, Vietnam `53.6`, Rwanda `21.9`, Equatorial Guinea `9.8`, Sierra Leone `0.3`. | `methods_endnote` all bullets | End on constrained hope + governance closing line |

---

## Data Sources

- `website/data/country_year_long.json`
- `website/data/residuals_long.json`
- `website/data/country_trends.json`
- `website/data/metadata.json`

---

## Why This V2 Differs from V1

- Single narrative spine: Rwanda trajectory is the emotional anchor.
- Numbers move primarily into visuals/traceability, not body prose density.
- Mid-story caveat paragraphs removed; uncertainty handled in one methods block.
- Beat text written as scrollytelling copy, not as standalone policy essay.
