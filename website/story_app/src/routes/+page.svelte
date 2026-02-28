<svelte:head>
  <title>DIODS Conference</title>
  <meta
    name="description"
    content="Conference portal for the visual essay, America's Development Paradox, and the MDG interactive data dashboard."
  />
</svelte:head>

<main class="landing">
  <section class="hero">
    <p class="eyebrow">Conference Home</p>
    <h1>DIODS Conference</h1>
    <p class="dek">Choose a presentation mode for your live demo flow.</p>
  </section>

  <section class="cta-grid" aria-label="Conference entry points">
    <a class="cta cta-story" href="/story">Wealth Doesn't Buy Health Visual Essay</a>
    <a class="cta cta-paradox" href="/paradox">America's Development Paradox</a>
    <a class="cta cta-dashboard" href="/dashboard">MDG Interactive Data Dashboard</a>
  </section>
</main>

<style>
  .landing {
    min-height: 100vh;
    padding: clamp(1.2rem, 3.3vw, 2.6rem);
    display: grid;
    align-content: center;
    gap: clamp(1.5rem, 3vw, 2.4rem);
    background:
      radial-gradient(1200px 800px at 90% -10%, rgba(183, 84, 255, 0.2), transparent 56%),
      radial-gradient(900px 600px at 8% 8%, rgba(49, 206, 154, 0.14), transparent 50%),
      linear-gradient(150deg, #0f0314 0%, #1a0320 45%, #0c0619 100%);
  }

  .hero {
    max-width: 860px;
    margin: 0 auto;
    text-align: center;
  }

  .eyebrow {
    margin: 0;
    font-family: var(--font-mono);
    color: #cab7d6;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.78rem;
  }

  h1 {
    margin: 0.7rem 0 0;
    font-family: var(--font-headline);
    font-size: clamp(2.5rem, 7.4vw, 5rem);
    font-weight: 500;
    letter-spacing: 0.01em;
    line-height: 1.05;
    color: #f7ebff;
  }

  .dek {
    margin: 1rem auto 0;
    max-width: 670px;
    font-size: clamp(1.03rem, 2.1vw, 1.28rem);
    color: #dbcae6;
  }

  .cta-grid {
    width: min(1120px, 100%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .cta {
    border-radius: 1rem;
    padding: 1rem 1.1rem;
    text-decoration: none;
    font-family: var(--font-ui);
    font-weight: 600;
    font-size: 1.03rem;
    line-height: 1.35;
    border: 1px solid rgba(255, 255, 255, 0.28);
    color: #faf6ff;
    min-height: 84px;
    display: grid;
    place-items: center;
    text-align: center;
    transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
  }

  .cta-story {
    background: linear-gradient(135deg, rgba(245, 48, 193, 0.2), rgba(56, 14, 77, 0.48));
  }

  .cta-paradox {
    background: linear-gradient(135deg, rgba(65, 140, 212, 0.25), rgba(11, 26, 65, 0.5));
  }

  .cta-dashboard {
    background: linear-gradient(135deg, rgba(53, 183, 230, 0.2), rgba(14, 65, 85, 0.5));
  }

  .cta:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.52);
    background-color: rgba(255, 255, 255, 0.08);
  }

  .cta:focus-visible {
    outline: 2px solid #96f4d0;
    outline-offset: 2px;
  }

  @media (max-width: 900px) {
    .cta-grid {
      grid-template-columns: 1fr;
    }
    .cta {
      min-height: 72px;
    }
  }
</style>
