<script lang="ts">
  import { onMount, tick } from 'svelte';
  import CenterCardLayer from '$lib/scrolly/CenterCardLayer.svelte';
  import CardPager from '$lib/scrolly/CardPager.svelte';
  import { StepObserver } from '$lib/scrolly/StepObserver';
  import StageFrame from '$lib/vis/StageFrame.svelte';
  import { SceneController } from '$lib/vis/SceneController';
  import type { BeatSpec, CardPage, StoryMetrics, StoryVisualDoc } from '$lib/vis/types';

  import visualDocRaw from '$lib/data/story_visual_v5.json';
  import storyMetricsRaw from '$lib/data/story_metrics_v5.json';

  const visualDoc = visualDocRaw as StoryVisualDoc;
  const metrics = storyMetricsRaw as StoryMetrics;

  const heroDots = metrics.scene_data.points.slice(0, 220).map((point, i) => {
    const x = ((i * 19) % 100) + ((point.gni_percap % 11) * 0.08);
    const y = ((i * 31) % 100) + (Math.abs(point.residual_gap) % 8) * 0.2;
    const r = point.residual_gap < -4 ? 0.26 : point.residual_gap > 4 ? 0.2 : 0.13;
    const bright = point.residual_gap < 0 || i % 9 === 0;
    return { x, y, r, bright };
  });

  type ScriptStep = {
    step_id: string;
    beat_id: BeatSpec['beat_id'];
    beat_card_count: number;
    beat_card_index: number;
    body: string;
  };

  const beatById = new Map(visualDoc.beats.map((beat) => [beat.beat_id, beat]));
  const scriptSteps: ScriptStep[] = visualDoc.beats.flatMap((beat) =>
    beat.cards.map((card, idx) => ({
      step_id: `${beat.beat_id}_${idx}`,
      beat_id: beat.beat_id,
      beat_card_count: beat.cards.length,
      beat_card_index: idx,
      body: card.body
    }))
  );

  let activeStepIndex = 0;
  let activeStepProgress = 0;
  let activeStepDirection: -1 | 0 | 1 = 1;

  let figureHost: HTMLDivElement;
  let trackHost: HTMLDivElement;

  let controller: SceneController | null = null;
  let observer: StepObserver | null = null;

  $: activeStep = scriptSteps[activeStepIndex] ?? scriptSteps[0];
  $: prevStep = scriptSteps[Math.max(0, activeStepIndex - 1)] ?? activeStep;
  $: nextStep = scriptSteps[Math.min(scriptSteps.length - 1, activeStepIndex + 1)] ?? activeStep;
  $: activeBeat = beatById.get(activeStep?.beat_id ?? visualDoc.beats[0].beat_id) ?? visualDoc.beats[0];
  $: transitionStep = activeStepDirection < 0 ? prevStep : nextStep;
  $: activeCards =
    activeStep == null
      ? []
      : ([
          {
            card_id: `${activeStep.step_id}_current`,
            headline: `${activeStep.step_id}_current`,
            body: activeStep.body
          },
          {
            card_id: `${transitionStep.step_id}_transition`,
            headline: `${transitionStep.step_id}_transition`,
            body: transitionStep.body
          }
        ] as CardPage[]);

  onMount(() => {
    let disposed = false;
    controller = new SceneController(figureHost, visualDoc, metrics);
    controller.init();

    tick().then(() => {
      if (disposed) return;
      const stepEls = Array.from(trackHost.querySelectorAll<HTMLElement>('.scroll-step'));

      observer = new StepObserver(stepEls, {
        activateThreshold: 0.42,
        hysteresis: 0.06,
        onChange: ({ index, progress, direction }) => {
          const step = scriptSteps[index];
          if (!step) return;

          activeStepIndex = index;
          activeStepProgress = progress;
          if (direction !== 0) activeStepDirection = direction;
          const beat = beatById.get(step.beat_id) as BeatSpec | undefined;
          if (!beat) return;

          const beatProgress = (step.beat_card_index + progress) / Math.max(1, step.beat_card_count);
          controller?.goToBeat(beat, beatProgress, direction);
        }
      });
    });

    return () => {
      disposed = true;
      observer?.destroy();
      controller?.destroy();
    };
  });
</script>

<svelte:head>
  <title>{visualDoc.title}</title>
  <meta name="description" content={visualDoc.dek} />
</svelte:head>

<main class="story-page">
  <a class="skip-link" href="#methods-endnote">Skip to methods</a>
  <nav class="story-top-nav" aria-label="Conference navigation">
    <a href="/">DIODS Home</a>
    <a href="/paradox">America's Development Paradox</a>
    <a href="/dashboard">MDG Interactive Data Dashboard</a>
  </nav>

  <header class="intro">
    <svg class="sky" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {#each heroDots as dot}
        <circle cx={dot.x} cy={dot.y} r={dot.r} class:bright={dot.bright} />
      {/each}
    </svg>

    <div class="intro-copy">
      <p class="brand">The Story Lab</p>
      <h1>{visualDoc.title}</h1>
      <p class="dek">{visualDoc.dek}</p>
      <p class="scroll-cue" aria-hidden="true">Scroll to enter the graph</p>
    </div>
  </header>

  <section class="experience" aria-label="Interactive scrollytelling experience">
    <div class="stage-sticky">
      <StageFrame ariaSummary={activeBeat.aria_summary}>
        <div class="figure-host" bind:this={figureHost}></div>
      </StageFrame>

      <CenterCardLayer placement="center" offsetTop="62%">
        <CardPager cards={activeCards} activeIndex={0} stepProgress={activeStepProgress} direction={activeStepDirection} />
      </CenterCardLayer>
    </div>

    <div class="scroll-track" bind:this={trackHost}>
      {#each scriptSteps as step, idx}
        <section class="scroll-step" aria-label={beatById.get(step.beat_id)?.aria_summary ?? step.beat_id}>
          <div class="step-placeholder" class:active={idx === activeStepIndex}></div>
        </section>
      {/each}
    </div>
  </section>

  <section class="methods" id="methods-endnote" aria-label="Methods endnote">
    <h2>Methods Endnote</h2>
    <ul>
      {#each visualDoc.methods_endnote.bullets as bullet}
        <li>{bullet}</li>
      {/each}
    </ul>
    <p class="source">Context references: {visualDoc.methods_endnote.source_doc}</p>
  </section>
</main>

<style>
  /* ── Skip link (accessible) ── */
  .skip-link {
    position: absolute;
    left: -9999px;
    top: 0;
    z-index: 100;
    padding: 0.5rem 1rem;
    background: var(--accent);
    color: #fff;
    font-family: var(--font-ui);
    font-size: 0.85rem;
    text-decoration: none;
    border-radius: 0 0 var(--radius-sm) 0;
  }
  .skip-link:focus {
    left: 0;
  }

  .story-top-nav {
    position: fixed;
    top: 0.9rem;
    right: 0.95rem;
    z-index: 90;
    display: flex;
    gap: 0.45rem;
    flex-wrap: wrap;
    justify-content: flex-end;
    max-width: min(92vw, 830px);
  }

  .story-top-nav a {
    text-decoration: none;
    padding: 0.42rem 0.72rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(21, 0, 24, 0.46);
    color: #f5e9fb;
    font-family: var(--font-ui);
    font-size: 0.82rem;
    line-height: 1;
    white-space: nowrap;
    backdrop-filter: blur(3px);
  }

  .story-top-nav a:hover {
    border-color: rgba(255, 255, 255, 0.55);
    background: rgba(21, 0, 24, 0.66);
  }

  /* ── Page shell ── */
  .story-page {
    min-height: 100vh;
    color: var(--ink);
    background:
      radial-gradient(circle at 16% 8%, rgba(159, 35, 146, 0.18), transparent 38%),
      radial-gradient(circle at 84% 16%, rgba(69, 146, 52, 0.10), transparent 42%),
      linear-gradient(180deg, var(--paper) 0%, var(--dark-bg) 100%);
  }

  /* ── Hero intro ── */
  .intro {
    position: relative;
    min-height: 100vh;
    display: grid;
    place-items: center;
    overflow: hidden;
    border-bottom: 1px solid var(--grid);
  }

  .sky {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.76;
  }
  .sky circle { fill: rgba(186, 102, 194, 0.30); }
  .sky circle.bright { fill: rgba(255, 50, 200, 0.78); }

  .intro-copy {
    position: relative;
    z-index: 2;
    text-align: center;
    max-width: 900px;
    padding: 2rem 1.2rem;
  }

  .brand {
    margin: 0;
    font-family: var(--font-mono);
    color: var(--card-kicker);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: var(--size-label);
  }

  h1 {
    margin: 0.75rem 0 0;
    font-family: var(--font-headline);
    font-size: var(--size-hero);
    font-weight: 500;
    line-height: 1.08;
    color: #f8eefb;
  }

  .dek {
    margin: 1rem auto 0;
    max-width: 720px;
    color: var(--ink-soft);
    font-size: clamp(1.2rem, 2.1vw, 1.62rem);
    line-height: 1.42;
  }

  .scroll-cue {
    margin: 1.5rem 0 0;
    font-family: var(--font-mono);
    color: var(--ink-muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-size: var(--size-label);
    animation: cue-pulse 2.4s ease-in-out infinite;
  }

  @keyframes cue-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  /* ── Experience section (scrolly) ── */
  .experience {
    position: relative;
  }

  .stage-sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .figure-host {
    width: 100%;
    height: 100%;
  }

  /* ── Scroll track with low-contrast placeholders ── */
  .scroll-track {
    position: relative;
    z-index: 3;
  }

  .scroll-step {
    min-height: 56vh;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 0;
  }

  .step-placeholder {
    width: 100%;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  /* ── Methods endnote ── */
  .methods {
    max-width: 980px;
    margin: 0 auto;
    padding: 5rem 1.2rem 4rem;
    border-top: 1px solid var(--grid);
  }

  .methods h2 {
    margin: 0;
    font-family: var(--font-headline);
    font-size: var(--size-h2);
    font-weight: 500;
    color: var(--ink);
  }

  .methods ul {
    margin: 1rem 0 0;
    padding-left: 1.2rem;
    color: var(--ink-soft);
    display: grid;
    gap: 0.5rem;
    font-size: 1.02rem;
    line-height: 1.5;
  }

  .source {
    margin: 1rem 0 0;
    color: var(--ink-muted);
    font-family: var(--font-mono);
    font-size: var(--size-label);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .story-top-nav {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      max-width: none;
      justify-content: center;
      padding: 0.5rem 0.45rem;
      background: rgba(19, 0, 20, 0.82);
      border-bottom: 1px solid var(--grid);
      backdrop-filter: blur(4px);
    }

    .story-top-nav a {
      font-size: 0.74rem;
      padding: 0.4rem 0.62rem;
    }

    .stage-sticky {
      padding: 0.5rem;
      height: 100svh;
    }
    .scroll-step {
      min-height: 60vh;
      padding-bottom: 0;
    }
  }

  @media (max-height: 420px) {
    .stage-sticky {
      position: relative;
      height: auto;
      min-height: 80vh;
    }
  }
</style>
