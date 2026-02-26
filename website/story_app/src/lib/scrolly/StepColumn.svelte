<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { BeatSpec } from '$lib/vis/types';
  import { StepObserver } from './StepObserver';

  export let beats: BeatSpec[] = [];

  const dispatch = createEventDispatcher<{
    stepchange: {
      index: number;
      progress: number;
      direction: -1 | 0 | 1;
      beat: BeatSpec;
    };
  }>();

  let container: HTMLElement;
  let activeIndex = 0;
  let observer: StepObserver | null = null;

  function setActive(index: number, smooth = true) {
    if (index < 0 || index >= beats.length) return;
    activeIndex = index;
    const stepEls = container?.querySelectorAll<HTMLElement>('.step-card') ?? [];
    stepEls[index]?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
    observer?.setActiveIndex(index, 1);
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive(Math.min(beats.length - 1, activeIndex + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(Math.max(0, activeIndex - 1));
    }
  }

  onMount(() => {
    const stepEls = Array.from(container.querySelectorAll<HTMLElement>('.step-card'));
    observer = new StepObserver(stepEls, {
      activateThreshold: 0.58,
      hysteresis: 0.1,
      onChange: ({ index, progress, direction }) => {
        activeIndex = index;
        dispatch('stepchange', {
          index,
          progress,
          direction,
          beat: beats[index]
        });
      }
    });

    return () => observer?.destroy();
  });
</script>

<section class="step-column" bind:this={container} aria-label="Narrative steps">
  {#each beats as beat, idx}
    <article
      class="step-card"
      class:active={idx === activeIndex}
      aria-current={idx === activeIndex ? 'step' : undefined}
      aria-label={beat.aria_summary}
    >
      <div class="step-inner">
        <p class="step-label">{beat.label}</p>
        <h2>{beat.headline}</h2>
        <p>{beat.body}</p>
      </div>
    </article>
  {/each}
</section>

<style>
  .step-column {
    display: grid;
    gap: 0;
  }

  .step-card {
    min-height: 94vh;
    padding: 0.8rem 0;
    outline: none;
    display: flex;
    align-items: center;
  }

  .step-inner {
    max-width: 30.5rem;
    padding: 1.2rem 1.15rem 1.25rem 1.25rem;
    border-left: 2px solid transparent;
    transition:
      border-color var(--motion-fast) var(--ease-standard),
      background-color var(--motion-fast) var(--ease-standard),
      transform var(--motion-fast) var(--ease-standard);
  }

  .step-card.active .step-inner,
  .step-card:focus-visible .step-inner {
    border-left-color: var(--accent);
    background: linear-gradient(90deg, rgba(177, 12, 115, 0.09) 0%, rgba(177, 12, 115, 0) 82%);
    transform: translateX(2px);
  }

  .step-label {
    margin: 0 0 0.5rem;
    color: var(--accent);
    font-family: var(--font-ui);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-size: 0.73rem;
  }

  h2 {
    margin: 0;
    font-family: var(--font-headline);
    font-size: clamp(1.8rem, 2.3vw, 2.35rem);
    line-height: 1.14;
    letter-spacing: 0.005em;
    color: #2d2430;
  }

  p {
    margin: 0.86rem 0 0;
    color: #493f56;
    line-height: var(--line-copy);
    font-size: clamp(1.2rem, 1.43vw, 1.42rem);
  }

  @media (max-width: 1020px) {
    .step-card {
      min-height: 58vh;
    }

    .step-inner {
      max-width: none;
      padding-left: 0.7rem;
    }
  }
</style>
