# Pudding-Style Interactive Story Project Blueprint

## 1) Goal

Build a flagship interactive story that feels editorially and interactively comparable to a Pudding piece, then package the workflow so other people can create similar stories with AI + templates.

Two outputs:

1. **Flagship story** (your MDG/global development project).
2. **Reusable story kit** (template + docs + prompts) so “anyone can make their own interactive story.”

---

## 2) What Pudding Actually Does (Observed)

### Editorial process pattern

From Pudding process pieces and their own AI experiment, the production sequence is:

1. Idea generation
2. Data collection + analysis
3. Storyboard + prototype
4. Development + writing

They explicitly stress killing weak ideas early (`continue / pivot / put it down`) and tightening the narrative claim before full build.

### Technical pattern (historical)

Observed directly from live page source:

- **2017-2020**: custom D3 bundles, ScrollMagic/hand-rolled scripts.
- **2021**: older Svelte app structure (`/_app/...` assets).
- **2022+**: SvelteKit-style builds (`/_app/immutable/...`).

### Technical pattern (current)

From `the-pudding/svelte-starter`:

- SvelteKit + Svelte 5
- ArchieML + Google Docs/Sheets ingestion
- Scrolly helper components/actions
- Static-hosted builds
- D3 in toolchain

This is important: their current “Pudding-like” output is not one-off vanilla JS pages; it is a reusable component-driven storytelling stack.

---

## 3) Current Repo Status (Your Starting Point)

You already have:

- Reproducible data pipeline (`analysis/build_global_site_data.py`)
- Multiple frontend-ready JSON artifacts in `website/data/`
- A working global interactive lab (`website/global.html`, `website/global.js`, `website/global.css`)
- Existing narrative site (`website/index.html`)
- Method and insight docs (`docs/`)

This is strong analytically, but the front-end form is currently dashboard/report style, not “single narrative interaction arc.”

---

## 4) Product Definition For This Project

## A. Flagship Piece

Working title direction:

- **“Wealth Isn’t Destiny: The Countries That Defy the Development Curve”**

Core promise:

- Let users *feel* the paradox through guided interaction, not just read a dashboard.

## B. Story Kit

A minimal open template that others can use by editing:

- `copy` (story text/steps)
- `data` (precomputed JSON)
- `config` (theme, chart mappings)

The kit should output a Pudding-like interactive article without requiring advanced custom code each time.

---

## 5) Site Format Options

### Option 1: Guided Scrollytelling (recommended)

Pros:

- Closest to common Pudding narrative form
- Easier editorial pacing
- Best for conference demo flow

Cons:

- Requires careful storyboarding of step transitions

### Option 2: Interactive quiz/challenge first, explanation second

Pros:

- Strong engagement hook
- Memorable

Cons:

- Harder to ensure analytical depth and methodological clarity

### Option 3: Explorer-first dashboard with light narrative overlay

Pros:

- Fastest given current code

Cons:

- Least “Pudding-like” in storytelling feel

**Recommendation:** Option 1, with one quiz-like moment embedded mid-story.

---

## 6) Narrative Blueprint (MDG Story)

Suggested arc:

1. **Hook**: “If wealth predicted outcomes, the leaderboard should be obvious.”
2. **Reveal mismatch**: Wealth vs outcomes scatter + residual framing.
3. **Concrete cases**: Overperformer and underperformer countries at similar income levels.
4. **Portfolio view**: Some countries improve broadly; others stall despite wealth.
5. **Takeaway**: Wealth enables, but policy/system choices determine realized outcomes.
6. **Methods transparency**: clear caveats and reproducibility links.

Non-negotiable editorial constraint:

- Every headline claim maps to one reproducible metric and one fallback chart.

---

## 7) Technical Architecture Requirements

## Data Layer

- Keep Python pipeline as source of truth.
- Add story-specific, lightweight exports (step-oriented JSON slices).
- Enforce “claim cards” with metric provenance metadata.

## Content Layer

- Move narrative copy to structured content (`copy.json` or ArchieML).
- Separate text from rendering logic.

## Frontend Layer

Core reusable components:

1. `ScrollyFrame` (step activation + progress)
2. `StickyFigure` (desktop sticky, mobile fallback)
3. `InsightCard` (claim + metric + caveat)
4. `CountryCompare` (small multiples / overlays)
5. `MethodDrawer` (expandable methods)

## Performance Layer

- Avoid heavy all-at-once payloads.
- Precompute expensive transforms in Python.
- Prefer SVG/Canvas + lightweight transitions over large Plotly embeds for story steps.

---

## 8) AI Workflow Design (Human-in-the-loop)

AI is useful for:

- Code scaffolding
- Variant generation for chart treatments
- Draft copy alternatives
- QA checklist generation

Human gates must remain for:

- Claim validity and caveats
- Narrative judgment
- Final interaction quality and visual taste

Required gate checks per chapter:

1. Metric correctness check
2. Claim wording check
3. Interaction clarity check
4. Mobile behavior check

---

## 9) Delivery Plan (Phased)

## Phase 0: Lock Thesis + Chapter Plan (0.5-1 day)

Deliverables:

- 1-sentence thesis
- 5-7 chapter outline
- chart-per-chapter mapping

## Phase 1: Storyboard + Wireframes (1 day)

Deliverables:

- low-fi storyboard
- desktop/mobile interaction notes
- transition spec between chapters

## Phase 2: Story Data Exports (1 day)

Deliverables:

- chapter-specific JSON bundles
- claim-to-metric manifest

## Phase 3: Build Narrative Shell (1-2 days)

Deliverables:

- scrolly skeleton
- sticky figure framework
- content-driven chapter rendering

## Phase 4: Chart/Interaction Implementation (2-3 days)

Deliverables:

- all chapter visuals wired
- one “aha” interaction moment
- smooth chapter transitions

## Phase 5: Editorial + Methods + QA (1-2 days)

Deliverables:

- tightened copy
- methods/caveats panel
- mobile/perf/accessibility pass

## Phase 6: Story Kit Packaging (1-2 days)

Deliverables:

- template folder
- “how to make your own story” guide
- minimal example dataset + copy

---

## 10) Risks and Mitigations

1. **Over-scoping interactions**
   - Mitigation: one core interaction per chapter max.
2. **Dashboard feel remains**
   - Mitigation: narrative-first structure with forced chapter sequencing.
3. **Methodological challenges in Q&A**
   - Mitigation: claim manifest + caveat text + source links in-story.
4. **Performance issues**
   - Mitigation: pre-aggregation + lazy loading + reduced Plotly footprint.

---

## 11) Immediate Kickoff Tasks (Next 24 Hours)

1. Finalize one thesis sentence and chapter list.
2. Choose stack path:
   - A) retrofit current `website/` (faster)
   - B) migrate to SvelteKit starter (closer to Pudding pattern)
3. Draft chapter-level claim cards from `docs/candidate_insights.md`.
4. Define chapter data contract (`chapter_id`, `metric_id`, `series`, `annotations`).
5. Build one vertical slice:
   - intro copy
   - one sticky chart
   - one scrolly transition

---

## 12) Suggested Decision

If the objective is explicitly to prove “AI can produce Pudding-equivalent interactive stories,” choose **SvelteKit narrative build (Option B)** and keep your existing Python pipeline.

Reason:

- It aligns with the observed modern Pudding architecture.
- It gives you reusable components for the “anyone can make one” second objective.

---

## 13) Primary Sources Used

- https://pudding.cool/2024/07/ai/
- https://pudding.cool/process/how-to-make-dope-shit-part-3/
- https://pudding.cool/process/pivot-continue-down/
- https://pudding.cool/pitch/
- https://pudding.cool/resources/
- https://github.com/the-pudding/svelte-starter
- https://raw.githubusercontent.com/the-pudding/svelte-starter/main/README.md
- https://raw.githubusercontent.com/the-pudding/svelte-starter/main/package.json
- https://raw.githubusercontent.com/the-pudding/svelte-starter/main/src/components/helpers/Scrolly.svelte
- https://github.com/the-pudding/starter

