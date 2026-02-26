<main class="home">
  <h1>Story Visual App</h1>
  <p>This app hosts the SvelteKit + D3 full story build (V5).</p>
  <a href="/story">Open Story V5</a>
</main>

<style>
  .home {
    min-height: 100vh;
    display: grid;
    place-items: center;
    text-align: center;
    padding: 2rem;
    gap: 0.75rem;
  }

  h1 {
    margin: 0;
    font-family: var(--font-headline);
    font-size: var(--size-h2);
  }

  p {
    margin: 0;
    color: var(--ink-soft);
  }

  a {
    text-decoration: none;
    border: 1px solid var(--grid);
    background: var(--panel);
    border-radius: 999px;
    padding: 0.6rem 1rem;
    font-weight: 600;
  }
</style>
