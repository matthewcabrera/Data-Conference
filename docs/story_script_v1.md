# Story Script V1 (Pudding-Style Draft, 2006-2015 Data)

## Title / Dek Options

### Option A
- **Title:** Wealth Should Buy Health. Why Doesn't It?
- **Dek:** Across 217 countries, money explains a lot about survival, but not enough. The gaps are human, political, and fixable.

### Option B
- **Title:** The Cost of Being Born in the Wrong System
- **Dek:** From the U.S. to Vietnam, Rwanda to Equatorial Guinea, this is a story about how policy and institutions bend outcomes beyond income.

---

One world, one market, one century of economic growth, and still the odds of living a long life can shift wildly depending on where you are born. A family can do everything right, and still run into a health system that is too fragmented, too slow, or too unequal to protect them.

That is the quiet violence in this dataset: some countries turn limited resources into extra years of life, while others burn through far greater wealth and still leave people exposed. The paradox is not abstract. It lands on babies, mothers, and households who never chose the system they inherited.

In 2010, the United States sat among the richest countries in the world, but its life expectancy was **78.54 years**, about **2.57 years below** what countries at similar income levels would predict. Within the same high-income band, life expectancy ranged from **73.98** to **82.84** years; the U.S. was near the bottom, not the top. Over the same decade, U.S. maternal mortality did not improve in this dataset (**14.0 in 2006 to 14.0 in 2015**), while similar-income peers saw an average decline of about **17.4%**.

This is the core contradiction: wealth can buy possibility, but it does not automatically buy coordination, prevention, or trust in care delivery. And once that contradiction appears in one rich country, we have to ask a harder question: where else do outcomes break away from income? That takes us to Vietnam.

In 2010, Vietnam had far lower income than the U.S., but it overperformed strongly across all four headline health indicators in this analysis. Its life expectancy reached **75.12 years** when the income-based expectation was **64.11** (wealth-adjusted **z = 2.22**). Maternal mortality was **58** versus an expectation near **345.74** (**z = 1.57**). Infant mortality was **18.3** versus **44.21** (**z = 1.73**). Under-5 mortality was **22.9** versus **64.09** (**z = 1.58**).

No single number can explain that gap. But the pattern is clear: lower income did not force lower outcomes. The country-level path still matters. A caveat here is that these are statistical expectations, not causal estimates; they identify where performance diverges, not exactly why. Still, when one country repeatedly beats the curve, "income is destiny" stops being a serious argument. To see the opposite pattern, look at Equatorial Guinea.

Equatorial Guinea is one of the clearest examples of wealth without broad health payoff in this dataset. In 2010, life expectancy was **55.91 years**, while the income-based expectation was **73.70** (a gap of **-17.79 years**, **z = -3.58**). Infant mortality was **80.5** when the expected value was **17.19** (**z = -4.22**). Under-5 mortality was **113.5** versus **22.5** (**z = -3.48**). Maternal mortality was **379** versus **90.52** (**z = -1.58**).

This is what structural failure looks like in health terms: the money exists on paper, but population-level outcomes still collapse relative to expectation. A necessary caveat is that country aggregates can hide uneven internal distribution and measurement uncertainty; still, the direction and magnitude of the gaps are too large to dismiss as noise. If Vietnam shows that policy capacity can raise outcomes above wealth, Equatorial Guinea shows that weak institutions can keep outcomes far below it. Now consider Rwanda, where the trajectory itself changed.

Between 2006 and 2015, Rwanda’s health indicators improved sharply in this dataset: life expectancy rose by **16.6%**, maternal mortality fell by **45.7%**, infant mortality fell by **49.8%**, and under-5 mortality fell by **57.3%**. Over the same period, women’s representation in parliament increased from **48.8%** to **63.8%** (about **+30.7%**).

We should be explicit about limits: this script cannot claim that one political indicator caused all health gains. Rwanda’s changes likely reflect many interacting shifts, including health system investments, governance reforms, and post-conflict institution-building. But the narrative point remains: trajectories can bend quickly, and countries are not trapped in a fixed lane forever. To understand the other end of the spectrum, we need Sweden.

Sweden’s pattern is not dramatic acceleration; it is sustained high performance. In 2010, its average percentile across the four health indicators here was **96.8**. In 2015, it remained very high at **95.3**. That is the governance challenge after achieving strong outcomes: less about miracle gains, more about maintaining reliability and equity over time.

This matters because "success stories" are often framed as sudden breakthroughs. Sweden reminds us that durable public-health performance is usually quieter: consistent systems, fewer preventable shocks, and smaller swings in mortality risk. A caveat is ceiling effects: once a country is near the frontier, percentage improvements naturally look smaller. Even so, staying near the top across multiple indicators is itself a policy outcome. Which brings us back to the full map.

Across countries in 2010, income explained a meaningful but incomplete share of health variation (for life expectancy, **R² ≈ 0.66**). The gap between strong and weak residual performance was large: life expectancy residuals ranged roughly from **-17.79** to **+11.00** years relative to income expectations. Regionally, median wealth-adjusted life-expectancy performance was positive in several regions and negative in others; in 2010, for example, **South Asia** was around **+0.74**, while **Sub-Saharan Africa** was around **-0.63** and **North America** around **-0.52** in this residual framing.

Sierra Leone is a hard reminder of what the bottom looks like in this period: in 2010, maternal mortality was **1630 per 100,000** (worst in this dataset year), and the country sat near the floor on the four-indicator health bundle (about **0.3** average percentile in 2010). The synthesis is uncomfortable but useful: money matters, policy matters, and institutions matter. Any narrative that treats development outcomes as a simple income ranking is too weak for the data in front of us. A caveat is that these are observational comparisons over 2006-2015, with known data quality limits and no causal identification design. Even so, the consistency of over- and under-performance patterns across indicators signals that these are not random blips.

If there is hope in this story, it is constrained but real. Vietnam and Rwanda show that countries can out-deliver their income level. Sweden shows that high performance can be stabilized. The U.S. contradiction shows that wealth does not exempt a country from institutional choices. Equatorial Guinea shows the cost of getting those choices wrong. The point is not to moralize countries into heroes and villains; the point is to stop pretending that health outcomes are pre-written by GDP.

What happens next is a governance question, not a math question.

## Methods Endnote (Concise)

- Scope: 217 countries, 14 indicators, years 2006-2015 (MDG-aligned transformed dataset in this repo).
- Core frame: indicator outcomes compared to income-based expectation (wealth-adjusted residual z by year/indicator).
- This is descriptive, not causal: residuals identify over/under-performance relative to income, not mechanism.
- Country-level aggregates can hide within-country inequality and measurement variation.
- Some indicators (especially environmental/funding series) have thinner coverage; this draft prioritizes high-coverage health indicators.
