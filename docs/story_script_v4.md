# Story Script V4 (EU-Style Structure, Health-Gap Mechanism)

## Title / Dek Options

### Option A
- **Title:** Progress Is Governable
- **Dek:** Income draws the line. Health systems decide the distance from it.

### Option B
- **Title:** Wealth Should Buy Health. Why Doesn't It?
- **Dek:** In 217 countries, income explains a lot. The rest is policy, capacity, and choices.

---

[VISUAL: Empty scatter axes. X-axis = income per person. Y-axis = life expectancy.]

Richer countries usually live longer.

[VISUAL: All 2010 country dots fade in.]

That pattern is real. It is also incomplete.

[VISUAL: Trend line draws in. Hover state shows vertical distance from each dot to the line.]

In 2010, this line explains about two-thirds of cross-country variation in life expectancy (R² about 0.66).

Which leaves about one-third unexplained by income alone.

That unexplained part is the story.

[VISUAL: Distribution strip for 2010 life-expectancy gaps appears under the scatter.]

A typical country is not exactly on the line. In 2010, the median absolute gap is about 2.7 years.

One in ten countries sits more than about 7.8 years away.

And at the extremes, the distance is much larger: roughly +11 years at the top, about -18 years at the bottom.

So the question is not whether income matters. It does.

The question is what moves countries above or below income-based expectation, and what keeps them there.

[VISUAL: Rwanda only. Under-5 mortality card: 2006 = 98.3 per 1,000.]

2006: 98.3.

[VISUAL: Hold. No narration.]

[VISUAL: Same card updates: 2015 = 42.0 per 1,000.]

2015: 42.0.

[VISUAL: Hold. No narration.]

Rwanda enters this period not from stability, but from reconstruction after catastrophic institutional collapse in the mid-1990s.

By 2006, mortality is still extremely high. Then, over the next decade, the direction keeps moving: maternal mortality falls, infant mortality falls, under-5 mortality falls, life expectancy rises.

[VISUAL: Rwanda dot path from 2006 to 2015 against fixed income-life line; gap values shown on-chart only.]

The point is not that one country solved everything.

The point is that the relationship to the line changed.

Above the line means a country is converting available resources into more survival than income alone predicts.
Below the line means it is converting less.

[VISUAL: Vietnam dot appears as a second highlighted trajectory, then both Rwanda and Vietnam remain visible.]

Rwanda is not alone on that side.

In 2010, Vietnam's life expectancy sits about 11 years above its income-based expectation.

Different history, different region, different income level, same direction relative to the line.

[VISUAL: Rwanda and Vietnam fade. U.S. dot highlights, then peer-income dots around U.S. highlight.]

In 2010, the United States is below its own line: 78.5 years observed, about 2.6 years under expectation.

Inside a narrow U.S.-income peer band, only one country sits lower on life expectancy.

[VISUAL: Time scrubber on U.S. gap from 2006 to 2015.]

And the gap does not close across the decade. It is below expectation in 2006, still below in 2010, and farther below by 2015.

[VISUAL: Small multiples for U.S. trends vs high-income peer averages: maternal, infant, under-5.]

The same pattern appears across indicators.

U.S. maternal mortality is flat from 14.0 to 14.0 while high-income peers decline on average.
U.S. infant mortality and under-5 mortality improve, but more slowly than high-income peer averages.

The wealth is real. The conversion is weaker.

[VISUAL: U.S. fades. Equatorial Guinea locks in below line; Sierra Leone floor annotation appears.]

Equatorial Guinea shows the lower extreme of the same logic.

In 2010, life expectancy is 55.9 years against an income-based expectation of 73.7, a gap of -17.8 years.

Sierra Leone, at the floor of this period, records maternal mortality of 1,630 per 100,000 in 2010.

Same failure.

[VISUAL: Return to global scatter. Add year slider from 2006 to 2015 with gap-distribution panel updating.]

What changes the gap?

Across this decade, the global distribution shifts, but does not disappear.

The median absolute distance from the line moves down from about 3.1 years in 2006 to about 2.7 years in 2015.
The 90th-percentile distance drops from about 9.3 years to about 7.3 years.

So there is some compression. But large divergences persist in every year.

[VISUAL: Highlight a few countries whose line-relative position improved most over time, including Rwanda.]

When countries move upward relative to expectation, the change usually shows up across multiple frontline indicators at once, not just one isolated metric.

[VISUAL: Highlights fade back to full field.]

This still does not tell us a single universal recipe.

It does tell us that the gap is not fixed by GDP alone, and not fixed in one direction forever.

[VISUAL: Quiet final frame on the full cloud and line.]

The hopeful reading is not that progress is automatic. It is that progress is governable.

What happens next is a governance question, not a math question.

## Methods Endnote (Single Block)

- Data scope: 217 countries, years 2006-2015, MDG-aligned transformed dataset in `website/data/`.
- Core approach: compare observed outcomes to income-based expected values by year and indicator.
- This is descriptive, not causal. Residual gaps identify over/under-performance relative to income; they do not identify mechanism by themselves.
- Country-level aggregates can hide within-country inequality and measurement limits.
- Narrative prioritizes high-coverage health indicators (life expectancy, maternal mortality, infant mortality, under-5 mortality) with life expectancy as the persistent reference curve.
