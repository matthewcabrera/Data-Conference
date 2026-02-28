<svelte:head>
  <title>DIODS Conference</title>
  <meta
    name="description"
    content="Conference portal for the visual essay, America's Development Paradox, and the MDG interactive data dashboard."
  />
</svelte:head>

<main class="landing">
  <section class="hero">
    <h1>DIODS Conference</h1>
    <p class="byline">Matthew Cabrera &amp; Jairo Jasmin</p>
  </section>

  <section class="cta-grid" aria-label="Conference entry points">
    <a class="cta" href="/story">Wealth Doesn't Buy Health Visual Essay</a>
    <a class="cta" href="/paradox">America's Development Paradox</a>
    <a class="cta" href="/dashboard">MDG Interactive Data Dashboard</a>
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
      radial-gradient(900px 560px at 50% -20%, rgba(180, 146, 92, 0.10), transparent 62%),
      radial-gradient(760px 520px at 8% 8%, rgba(105, 126, 154, 0.05), transparent 58%),
      #f7f3eb;
  }

  .hero {
    max-width: 860px;
    margin: 0 auto;
    text-align: center;
  }

  h1 {
    margin: 0;
    font-family: var(--font-headline);
    font-size: clamp(2.5rem, 7.4vw, 5rem);
    font-weight: 500;
    letter-spacing: 0.01em;
    line-height: 1.05;
    color: #1b2230;
  }

  .byline {
    margin: 0.65rem 0 0;
    font-family: var(--font-ui);
    font-size: clamp(0.95rem, 1.7vw, 1.08rem);
    color: #5b6673;
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
    border: 1px solid #d8d1c3;
    color: #0f172a;
    min-height: 84px;
    display: grid;
    place-items: center;
    text-align: center;
    background: #fbf8f2;
    box-shadow: 0 1px 2px rgba(53, 43, 28, 0.08);
    transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  }

  .cta:hover {
    transform: translateY(-2px);
    border-color: #c3baa8;
    box-shadow: 0 8px 20px rgba(53, 43, 28, 0.12);
  }

  .cta:focus-visible {
    outline: 2px solid #334155;
    outline-offset: 2px;
  }

  @media (max-width: 900px) {
    .landing {
      min-height: 100svh;
      padding: 1.25rem 1rem 1.5rem;
      gap: 1.25rem;
      align-content: center;
    }

    .hero {
      max-width: 540px;
    }

    h1 {
      font-size: clamp(2.2rem, 12vw, 3.3rem);
      line-height: 1.06;
    }

    .byline {
      margin-top: 0.55rem;
      font-size: clamp(0.92rem, 3.9vw, 1rem);
      line-height: 1.35;
    }

    .cta-grid {
      grid-template-columns: 1fr;
      width: min(560px, 100%);
      gap: 0.78rem;
    }

    .cta {
      min-height: 70px;
      padding: 0.9rem 1rem;
      font-size: 1rem;
      line-height: 1.28;
      border-radius: 0.95rem;
    }
  }

  @media (max-width: 430px) {
    .landing {
      padding: 1rem 0.85rem 1.2rem;
      gap: 1rem;
    }

    h1 {
      font-size: clamp(2rem, 13.5vw, 2.8rem);
    }

    .byline {
      font-size: 0.92rem;
    }

    .cta-grid {
      gap: 0.68rem;
    }

    .cta {
      min-height: 64px;
      padding: 0.8rem 0.92rem;
      font-size: 0.98rem;
    }
  }
</style>
