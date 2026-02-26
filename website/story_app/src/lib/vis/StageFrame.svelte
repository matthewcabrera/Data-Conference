<script lang="ts">
  export let ariaSummary = '';
</script>

<section class="stage" aria-label={ariaSummary}>
  <div class="vignette" aria-hidden="true"></div>
  <div class="chart-host">
    <slot />
  </div>
</section>

<style>
  .stage {
    position: relative;
    width: 100%;
    height: min(78vh, 760px);
    border-radius: var(--radius-lg, 18px);
    overflow: hidden;
    border: 1px solid var(--grid, #3d2943);
    background:
      radial-gradient(circle at 50% -20%, rgba(255, 84, 221, 0.18), transparent 48%),
      linear-gradient(180deg, var(--panel, #1a0020) 0%, var(--paper, #0e0011) 100%);
    box-shadow: inset 0 0 100px rgba(255, 83, 221, 0.06);
  }

  .chart-host {
    position: absolute;
    inset: 0;
    z-index: 2;
  }

  .vignette {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: radial-gradient(circle, transparent 52%, rgba(0, 0, 0, 0.30) 100%);
  }

  @media (max-width: 900px) {
    .stage {
      height: 64vh;
      border-radius: var(--radius-card, 14px);
    }
  }
</style>
