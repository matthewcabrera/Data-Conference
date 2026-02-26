# Story Script V2 (Rwanda Spine, Visual-First)

## Title / Dek Options

### Option A
- **Title:** Wealth Should Buy Health. Why Doesn't It?
- **Dek:** A decade of data shows money sets the stage, but systems decide who lives longer.

### Option B
- **Title:** The Line Is Income. The Story Is Everything Else.
- **Dek:** From Rwanda to the U.S., countries with similar resources produce very different odds of survival.

---

[VISUAL: Black screen. A single line appears: "Rwanda, 2006: under-5 mortality 98.3 per 1,000."]

In 2006, nearly one in ten children in Rwanda did not make it to age five.

[VISUAL: Same chart animates to 2015. Rwanda under-5 line drops to 42.0.]

By 2015, that number was 42.0.

That is not a small improvement. That is a country changing what is normal.

If you only sort countries by income, you miss that kind of change. Income matters. But in this dataset, from 2006 to 2015, it does not settle the argument.

The argument is this: wealth sets a baseline, and institutions decide who beats it.

[VISUAL: Global 2010 scatter of life expectancy vs income appears. Trend line fades in. Rwanda dot highlighted.]

On the global curve, richer countries usually live longer. In 2010, income explained a lot of life expectancy differences (R² about 0.66). But the points do not sit neatly on the line. Some sit well above it. Some fall far below it.

Rwanda sits slightly above its income expectation in 2010, and its decade trend keeps moving in the right direction: longer lives, fewer infant deaths, fewer child deaths, lower maternal mortality.

The first thing to notice is not perfection. The first thing to notice is direction.

[VISUAL: Scroll transition. U.S. dot pulses on the same scatter. Side panel shows 2010 value and expected line gap.]

Now look at the United States.

In 2010, it is one of the richest countries in the world, but its life expectancy sits below what the income line predicts: 78.5 years, about 2.6 years under expectation.

[VISUAL: U.S. line chart for maternal mortality, 2006 to 2015, mostly flat.]

Across the same period, U.S. maternal mortality in this dataset is flat: 14.0 in 2006, 14.0 in 2015.

This is the contradiction that breaks the "GDP equals outcomes" story. High national income can coexist with stalled progress if the system around care is fragmented, unequal, or hard to access.

Once that contradiction is visible in a high-income country, the question shifts from "How rich are you?" to "How well does your system convert resources into survival?"

[VISUAL: Highlight moves from U.S. to Vietnam. A simple label appears: "Above the line."]

Vietnam answers that question from the opposite direction.

In 2010, Vietnam's life expectancy is 75.1 years. Countries at similar income are predicted much lower, around 64.1.

[VISUAL: Four-card panel (life expectancy, maternal, infant, under-5). Vietnam bars all on "better than expected" side.]

Across the same health bundle, Vietnam is on the better-than-expected side in every indicator used here.

So this is not one lucky metric. It is a pattern.

The point is not that Vietnam is "finished." The point is that lower income did not lock the country into lower outcomes.

[VISUAL: Hard cut to Equatorial Guinea. Dot sits far below the line. Gap bars expand.]

Then there is Equatorial Guinea.

In 2010, life expectancy is 55.9 years, while the income-based expectation is 73.7.

[VISUAL: Infant and under-5 gap bars emphasized; values much worse than expected.]

This is the reverse pattern: national wealth without broad health payoff.

And at the bottom edge of this period, Sierra Leone's maternal mortality in 2010 reaches 1,630 per 100,000.

These are not abstract misses. They are years of life, pregnancies, and childhoods that a functioning system should have protected.

[VISUAL: Transition to Sweden profile card. No dramatic animation; stable high lines.]

Sweden is useful here for a different reason.

It is not a "turnaround" story. It is a consistency story. Its health-bundle percentile stays near the top across the decade, around 97 in 2006 and 95 in 2015.

That is what mature system performance looks like: fewer shocks, fewer reversals, fewer years where basic outcomes suddenly fail.

Not every country needs Rwanda's steep trajectory. Some need to build one. Others need to sustain one.

[VISUAL: World map of residual performance. Rwanda, Vietnam, U.S., Equatorial Guinea, Sierra Leone, Sweden highlighted. Then highlights fade back to full field.]

This is the full picture.

Countries do not sort into health outcomes by income alone. They diverge around the line, sometimes by a lot, and those gaps persist across multiple indicators.

Rwanda shows that trajectories can bend.
The U.S. shows that wealth is not immunity.
Vietnam shows that overperformance is possible.
Equatorial Guinea and Sierra Leone show the cost when systems fail to convert resources into protection.
Sweden shows what durability looks like.

[VISUAL: Return to Rwanda line, 2006 -> 2015, then freeze on 2015.]

The hopeful reading is not that progress is automatic. It is that progress is governable.

What happens next is a governance question, not a math question.

## Methods Endnote (Single Block)

- Data scope: 217 countries, years 2006-2015, MDG-aligned transformed dataset in `website/data/`.
- Core approach: compare observed outcomes to income-based expected values by year and indicator.
- This is descriptive, not causal. Residual gaps identify over/under-performance relative to income; they do not identify mechanism by themselves.
- Country-level aggregates can hide within-country inequality and measurement limits.
- Narrative indicators prioritize high-coverage health series: life expectancy, maternal mortality, infant mortality, and under-5 mortality.
