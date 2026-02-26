<script lang="ts">
  import type { DetailCardSpec } from '$lib/vis/types';

  export let title = '';
  export let caption = '';
  export let ariaSummary = '';
  export let detailCards: DetailCardSpec[] = [];
</script>

<aside class="figure-wrap" aria-label={ariaSummary}>
  <div class="figure-panel">
    <header class="figure-head">
      <p class="kicker">Data scene</p>
      <h3>{title}</h3>
      <p class="caption">{caption}</p>
    </header>

    <div class="figure-slot">
      <slot />
    </div>

    <div class="details" aria-live="polite">
      {#each detailCards as card}
        <div class="detail-card">
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          {#if card.note}
            <small>{card.note}</small>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</aside>

<style>
  .figure-wrap {
    min-width: 0;
  }

  .figure-panel {
    position: sticky;
    top: 1.25rem;
    padding: 1.1rem;
    background: rgba(246, 242, 248, 0.82);
    border: 1px solid #d6d0db;
    border-radius: var(--radius-lg);
    backdrop-filter: blur(6px);
    box-shadow: var(--shadow-soft);
  }

  .figure-head {
    padding: 0.2rem 0.1rem 0.7rem;
  }

  .kicker {
    margin: 0;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.7rem;
    color: #7a6f82;
  }

  h3 {
    margin: 0.3rem 0 0;
    font-family: var(--font-headline);
    font-size: clamp(1.32rem, 2vw, 1.74rem);
    line-height: 1.17;
    font-weight: 500;
  }

  .caption {
    margin: 0.55rem 0 0;
    color: #5d5468;
    font-family: var(--font-ui);
    font-size: 0.96rem;
    line-height: 1.45;
  }

  .figure-slot {
    width: 100%;
    height: min(69vh, 620px);
    border: 1px solid #d3ccd7;
    border-radius: 14px;
    background: linear-gradient(180deg, #f6f2f8 0%, #f1eef4 100%);
    overflow: hidden;
  }

  .details {
    margin-top: 0.7rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.46rem;
  }

  .detail-card {
    background: #f8f5fa;
    border: 1px solid #d8d1dc;
    border-radius: 10px;
    padding: 0.45rem 0.56rem 0.5rem;
    display: grid;
    gap: 0.15rem;
  }

  .detail-card span {
    font-size: 0.72rem;
    color: #6d6279;
    font-family: var(--font-ui);
    letter-spacing: 0.01em;
  }

  .detail-card strong {
    font-size: 0.93rem;
    color: #2f2435;
    font-family: var(--font-ui);
    font-weight: 600;
  }

  .detail-card small {
    color: #6f657a;
    font-family: var(--font-ui);
    font-size: 0.72rem;
    line-height: 1.35;
  }

  @media (max-width: 1020px) {
    .figure-panel {
      position: relative;
      top: 0;
      padding: 0.9rem;
    }

    .figure-slot {
      height: 440px;
    }
  }
</style>
