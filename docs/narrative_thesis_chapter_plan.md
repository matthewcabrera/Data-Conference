# Narrative Thesis + Chapter Plan (Prototype v1)

## Thesis

National wealth explains part of life expectancy, but countries can still significantly overperform or underperform their income level.

## Chapter Arc

1. **Chapter 1 - Wealth predicts a lot, but not everything**
   - Visual: all-country scatter (income vs life expectancy, 2010) + fitted expectation line.
   - Claim intent: baseline relationship exists, but variance remains.

2. **Chapter 2 - The U.S. sits below expectation**
   - Visual: same scatter with U.S. highlighted.
   - Claim intent: U.S. value is below model-predicted value at its income level.

3. **Chapter 3 - Similar-income peers sit higher**
   - Visual: same scatter with peer countries highlighted.
   - Claim intent: several countries at comparable income have higher life expectancy.

4. **Chapter 4 - Outliers in both directions**
   - Visual: same scatter highlighting strongest over/under performers by residual z.
   - Claim intent: policy/context can push outcomes above or below wealth expectation.

5. **Chapter 5 - Trajectories diverge over time**
   - Visual: line chart (2006-2015) for selected countries.
   - Claim intent: long-run change is uneven; progress is possible across different starting points.

## Data Contract (for the prototype page)

- Source file: `website/data/story_life_expectancy.json`
- Builder script: `analysis/build_story_chapter_data.py`
- Page: `website/story.html`
- Script: `website/story.js`
- Style: `website/story.css`

## Notes

- This is a narrative shell and should be expanded into the full multi-indicator story.
- Every final conference claim should still be validated against `docs/candidate_insights.md` and methods caveats.

