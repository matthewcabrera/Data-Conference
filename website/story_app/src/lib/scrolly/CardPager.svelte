<script lang="ts">
  import type { CardPage } from '$lib/vis/types';

  export let cards: CardPage[] = [];
  export let activeIndex = 0;
  export let stepProgress = 0;
  export let direction: -1 | 0 | 1 = 1;

  function escapeHtml(input: string) {
    return input
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function escapeRegex(input: string) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Supports inline markers in copy:
  // [[highlighted words]] -> accent + dotted underline
  // **bold words** -> strong
  function renderBody(text: string) {
    const autoHighlights = [
      'above the line',
      'below the line',
      'institutions matter',
      'same failure',
      'governance question',
      'income is not destiny'
    ];

    const escaped = escapeHtml(text);
    const withExplicit = escaped
      .replace(/\[\[(.+?)\]\]/g, '<span class="hl">$1</span>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    const withAuto = autoHighlights.reduce((acc, phrase) => {
      const re = new RegExp(`\\b${escapeRegex(phrase)}\\b`, 'gi');
      return acc.replace(re, '<span class="hl">$&</span>');
    }, withExplicit);

    const withBold = withAuto;
    const paragraphs = withBold
      .split(/\n\s*\n/g)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');
    return paragraphs;
  }

  $: p = Math.max(0, Math.min(1, stepProgress));
  $: pEase = p * p * (3 - 2 * p);
  $: d = direction < 0 ? -1 : 1;
</script>

{#if cards.length > 0}
  <div class="card-track" aria-live="polite" role="group" aria-label="Story text" style={`--p:${p}; --pe:${pEase}; --d:${d};`}>
    <article class="card-shell outgoing">
      <div class="body-text">
        {@html renderBody(cards[activeIndex].body)}
      </div>
    </article>
    {#if cards[activeIndex + 1]}
      <article class="card-shell incoming">
        <div class="body-text">
          {@html renderBody(cards[activeIndex + 1].body)}
        </div>
      </article>
    {/if}
  </div>
{/if}

<style>
  .card-track {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    isolation: isolate;
    --travel: 116vh;
    --anchor-y: 62vh;
  }

  .card-shell {
    position: absolute;
    top: 0;
    left: 50%;
    width: min(1120px, 82vw);
    transform: translate(-50%, var(--anchor-y));
    background: color-mix(in oklab, var(--card-bg, rgba(49, 25, 61, 0.92)) 46%, transparent);
    border: 1px solid rgba(214, 178, 234, 0.24);
    border-radius: 4px;
    padding: 1.55rem 1.7rem 1.05rem;
    box-shadow:
      0 10px 30px rgba(10, 0, 14, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.10);
    color: var(--card-text, #f0e4f5);
    backdrop-filter: blur(18px) saturate(130%);
    -webkit-backdrop-filter: blur(18px) saturate(130%);
    overflow: hidden;
    will-change: transform, opacity;
  }

  .outgoing {
    transform: translate(-50%, calc(var(--anchor-y) + (var(--pe) * var(--travel) * -1 * var(--d))));
    opacity: clamp(0, calc(1 - (var(--pe) * 1.45)), 1);
    z-index: 2;
  }

  .incoming {
    transform: translate(-50%, calc(var(--anchor-y) + ((1 - var(--pe)) * var(--travel) * var(--d))));
    opacity: clamp(0, calc((var(--pe) * 1.6) - 0.08), 1);
    z-index: 3;
  }

  .card-shell:focus-visible {
    outline: 2px solid var(--accent-soft, #d765ab);
    outline-offset: 3px;
  }

  .body-text {
    max-width: 46ch;
    will-change: transform, opacity;
  }

  .body-text :global(p) {
    margin: 0;
    font-family: var(--font-body);
    font-size: clamp(1.24rem, 1.9vw, 2rem);
    line-height: 1.34;
    color: #f0e4f5;
  }

  .body-text :global(p + p) {
    margin-top: 1rem;
  }

  .body-text :global(strong) {
    color: #f6ecfa;
    font-weight: 700;
  }

  .body-text :global(.hl) {
    color: #f6a6ef;
    text-decoration: underline dotted #f6a6ef;
    text-underline-offset: 0.16em;
    text-decoration-thickness: 1.5px;
  }

  @media (max-width: 900px) {
    .card-track {
      --travel: 104vh;
      --anchor-y: 68vh;
    }

    .card-shell {
      padding: 1rem 1rem 0.8rem;
      width: calc(100vw - 1.25rem);
    }

    .body-text {
      max-width: none;
    }

    .body-text :global(p) {
      font-size: clamp(1rem, 4.8vw, 1.28rem);
      line-height: 1.36;
    }

  }
</style>
