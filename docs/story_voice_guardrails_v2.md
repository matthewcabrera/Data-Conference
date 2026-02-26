# Story Voice Guardrails V2 (Pudding-Like, Visual-First)

Use this file as an enforcement checklist for edits to `docs/story_script_v2.md`.

## Core Rule

Prose should deliver meaning and tension; visuals should carry most numeric detail.

## Hard Constraints

1. Start with one concrete moment, not a thesis paragraph.
2. Keep one clear thesis sentence for the entire story.
3. Use one narrative spine (Rwanda) and treat other countries as evidence supports.
4. Avoid metric dumps in body copy:
   - No z-scores in narrative paragraphs.
   - No sentence with more than two numeric values unless it is a visual cue line.
5. No standalone caveat paragraphs mid-story.
   - Caveats live in the final methods block.
6. Every beat must specify what the reader is seeing:
   - Required format: `[VISUAL: ...]`.
7. End each beat with a forward-driving question or contrast.

## Allowed Tone

- Direct, human, and precise.
- Emotional only after concrete evidence is shown.
- Balanced but pointed; no triumphalism.

## Disallowed Tone

- Policy whitepaper phrasing.
- Abstract moralizing without a visual/data trigger.
- Grand claims of proof or causation.

## Red-Flag Phrases

- "The data proves"
- "Clearly"
- "This chart shows" (unless immediately followed by consequence)
- "A caveat here is"
- "We should be explicit about limits" (in body text)

## Beat Quality Check

For each beat, verify:

1. One emotional sentence.
2. One quantitative sentence (lightweight, readable).
3. One interpretive sentence.
4. One transition sentence.
5. One explicit visual state.

## Sync Rule

If a number changes in `docs/story_script_v2.md`, update `docs/story_script_traceability_v2.md` in the same edit.
