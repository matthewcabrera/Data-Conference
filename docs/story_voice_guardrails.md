# Story Voice Guardrails (Pudding-Style, Narrative-Controlled)

This document defines writing constraints so future edits preserve the intended narrative style from:

- `Sizing chaos`
- `Sitters and Standers`
- `This is a teenager`
- `Why EU Regions are Redrawing Their Borders`
- `30 minutes with a stranger`

## Core Intent

Write a story that feels human before it feels technical, while keeping claims defensible and data-linked.

## Non-Negotiable Style Rules

1. **People first, system second**
   - Every section begins with a consequence, contradiction, or human stake.
   - Do not open sections with variable names, methods, or tool references.

2. **No sterile chart narration**
   - Text must interpret, not describe visuals mechanically.
   - Ban phrases like "this chart shows" unless followed by a consequence statement.

3. **Evidence with emotional weight**
   - Each section must include:
     - one emotional sentence,
     - one quantitative sentence,
     - one interpretive sentence.

4. **Constrained certainty**
   - Strong argument voice is allowed.
   - Causal language is not allowed unless causal design exists.
   - Use caveats with precision, not hedging language spam.

5. **Forward momentum**
   - End each section with a transition that creates the next question.

## Tone Targets

- Primary: human, urgent, grounded.
- Secondary: analytical, accountable, non-grandiose.
- Avoid:
  - detached policy-whitepaper tone,
  - triumphalist "winner/loser" rhetoric,
  - melodrama without evidence.

## Rhythm and Sentence Design

- Mix sentence lengths intentionally:
  - short lines for tension,
  - medium lines for explanation,
  - occasional long lines for synthesis.
- Keep paragraph openings concrete.
- Use contrast pivots deliberately: `but`, `yet`, `still`, `however`.

## Vocabulary Guardrails

- Prefer plain words over jargon in narrative body.
- Reserve technical terms (`residual`, `R²`, `percentile`) for moments where readers already care.
- If a technical term appears, pair it with immediate plain-language meaning.

## Section Structure Contract

Use this schema for each narrative block:

- `section_id`
- `opening_consequence`
- `primary_claim`
- `quant_evidence`
- `interpretation`
- `inline_caveat`
- `transition_question`

## Drafting Checklist (Before Marking Any Revision Final)

1. First two paragraphs contain no method jargon.
2. Every section has one editable thesis line.
3. Every section has at least one concrete number.
4. Every section has an explicit caveat.
5. Conclusion ends with constrained hope, not false certainty.

## Red-Flag Patterns to Remove

- "The data proves..."
- "Clearly..."
- "As shown in the chart..."
- "This demonstrates causation..."
- Paragraphs that stack three or more statistics without interpretation.

## Versioning Guidance

- Keep script and traceability in sync:
  - If a number changes in `docs/story_script_v1.md`, update `docs/story_script_traceability_v1.md` in the same edit.
- Never add a new claim without:
  - primary metric,
  - fallback metric,
  - caveat line.

