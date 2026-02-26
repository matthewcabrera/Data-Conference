# Global Site Runbook

## Rebuild Data Products

From project root:

```bash
python analysis/build_global_site_data.py
```

Writes all frontend data files to `website/data/`.

## Regenerate Candidate Insights

```bash
python analysis/generate_candidate_insights.py
```

Writes `docs/candidate_insights.md`.

## Build Narrative Prototype Data Slice

```bash
python analysis/build_story_chapter_data.py
```

Writes `website/data/story_life_expectancy.json`.

## Build Story V1 Visual Payloads (SvelteKit App)

```bash
python analysis/build_story_visual_v1.py
```

Writes:

- `website/story_app/src/lib/data/story_visual_v1.json`
- `website/story_app/src/lib/data/story_metrics_v1.json`

## Build Story V5 Visual Payloads (Full Scrollytelling)

```bash
python analysis/build_story_visual_v5.py
```

Writes:

- `website/story_app/src/lib/data/story_visual_v5.json`
- `website/story_app/src/lib/data/story_metrics_v5.json`
- `website/story_app/src/lib/data/story_cards_v5.json`

## Launch Local Site

```bash
cd website
python -m http.server 8000
```

Then open:

- `http://localhost:8000/global.html` (new all-country lab)
- `http://localhost:8000/story.html` (new narrative prototype chapter)
- `http://localhost:8000/index.html` (original narrative site)

## Launch SvelteKit Story App (V5 Full Story)

From project root:

```bash
cd website/story_app
npm install
npm run dev
```

Then open:

- `http://localhost:5173/story`

## Conference QA Checklist

1. Confirm controls update all visuals (indicator/year/region/income/country).
2. Verify selected country marker updates on scatter + distribution.
3. Confirm trend panel changes when selecting a different country.
4. Check map and scatter show "No data" states for sparse combinations.
5. Validate final claim numbers against `docs/candidate_insights.md`.
