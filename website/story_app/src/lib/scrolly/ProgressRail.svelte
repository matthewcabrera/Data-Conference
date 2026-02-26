<script lang="ts">
  import type { BeatSpec } from '$lib/vis/types';

  export let beats: BeatSpec[] = [];
  export let activeIndex = 0;
</script>

<aside class="rail" aria-hidden="true">
  {#each beats as beat, idx}
    <div class="rail-item" class:active={idx === activeIndex}>
      <span class="dot"></span>
      <span class="label">{beat.label}</span>
    </div>
  {/each}
</aside>

<style>
  .rail {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    display: grid;
    gap: 0.5rem;
    z-index: 7;
  }

  .rail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    opacity: 0.35;
    transition: opacity var(--motion-micro, 180ms) var(--ease-standard);
  }

  .rail-item.active {
    opacity: 1;
  }

  .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 999px;
    background: var(--ink-muted, #9f88aa);
    box-shadow: 0 0 0 1px rgba(10, 0, 13, 0.6);
    transition: all var(--motion-fast, 260ms) var(--ease-standard);
  }

  .rail-item.active .dot {
    background: var(--negative, #ff32c8);
    box-shadow: 0 0 14px var(--accent-glow, rgba(177, 12, 115, 0.35));
  }

  .label {
    color: var(--ink-soft, #c9b4d3);
    font-family: var(--font-mono);
    font-size: var(--size-label, 0.7rem);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  @media (max-width: 900px) {
    .rail {
      display: none;
    }
  }
</style>
