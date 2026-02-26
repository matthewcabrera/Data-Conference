# Story Script V3 (Single Mechanism, Persistent Curve)

## Title / Dek Options

### Option A
- **Title:** Progress Is Governable
- **Dek:** Income draws a line. Systems decide which countries rise above it.

### Option B
- **Title:** Wealth Should Buy Health. Why Doesn't It?
- **Dek:** A decade of data shows the gap between what income predicts and what systems deliver.

---

[VISUAL: Empty scatter axes. X-axis = income per person. Y-axis = life expectancy.]

Start with the rule.

Richer countries usually live longer.

[VISUAL: All 2010 country dots fade in. No labels.]

Now look at the cloud, before we explain anything.

[VISUAL: Trend line draws across the cloud. Distances from line appear when hovering a dot.]

This line is the expectation. Everything in this story is the gap between that line and real lives.

In 2010, income explained a lot of cross-country life expectancy differences (R² about 0.66). It did not explain all of them.

[VISUAL: Rwanda only. Under-5 mortality card appears: 2006 = 98.3 per 1,000.]

2006: 98.3.

[VISUAL: Hold. No narration.]

[VISUAL: Same card updates: 2015 = 42.0 per 1,000.]

2015: 42.0.

[VISUAL: Hold. No narration.]

That drop is the first fact.

The second fact is where Rwanda sits relative to the income line: slightly below it in 2006, above it by 2010, farther above by 2015.

[VISUAL: Rwanda dot path over time against fixed line; 2006 gap = -0.83 years, 2010 = +2.75, 2015 = +4.41.]

Same country. Same global economy. Different relationship to expectation.

[VISUAL: Zoom back to full 2010 cloud. Residual distances remain visible.]

This is the mechanism for the rest of the piece.

Above the line means countries are turning available resources into more survival than income alone predicts.
Below the line means they are converting less.

[VISUAL: U.S. dot highlights first, then peer dots in a +/-25% U.S.-income band highlight.]

The U.S. is the test case most readers will not expect.

In 2010, U.S. life expectancy is 78.5 years, about 2.6 years below its income-based expectation.

Inside a narrow U.S.-income peer band (17 countries), only one country is lower on life expectancy.

[VISUAL: Time scrubber on U.S. dot vs line, 2006 -> 2015.]

And the distance does not close over the decade. In this dataset it is -3.1 years in 2006, -2.6 in 2010, and -3.7 in 2015.

[VISUAL: Small multiple: maternal mortality trends, U.S. vs Canada.]

One supporting signal: U.S. maternal mortality is flat at 14.0 from 2006 to 2015, while Canada declines from 9.0 to 7.0.

The system around care is not the same thing as the wealth funding it.

[VISUAL: U.S. fades. Equatorial Guinea dot and gap bars lock in.]

Now the mirror case.

Equatorial Guinea is far below the line despite high income in this period.

In 2010, life expectancy is 55.9 years while the income-based expectation is 73.7, a gap of -17.8 years.

[VISUAL: Keep Equatorial Guinea highlighted while a floor annotation appears for Sierra Leone.]

At the floor of this period, Sierra Leone records maternal mortality of 1,630 per 100,000 in 2010.

These are different countries, but the same structural failure: resources are not reaching people as protection.

[VISUAL: Return to full scatter and residual map. No country labels for three seconds.]

The map does not sort the way income alone would predict.

If the line were destiny, this pattern would not exist.

The hopeful reading is not that progress is automatic. It is that progress is governable.

What happens next is a governance question, not a math question.

## Methods Endnote (Single Block)

- Data scope: 217 countries, years 2006-2015, MDG-aligned transformed dataset in `website/data/`.
- Core approach: compare observed outcomes to income-based expected values by year and indicator.
- This is descriptive, not causal. Residual gaps identify over/under-performance relative to income; they do not identify mechanism by themselves.
- Country-level aggregates can hide within-country inequality and measurement limits.
- Narrative prioritizes high-coverage health indicators (life expectancy, maternal mortality, infant mortality, under-5 mortality) and uses life expectancy as the persistent reference curve.
