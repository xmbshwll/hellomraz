/**
 * Shared "random review" logic for header + sidebar buttons.
 * Keeps a shuffled deck in sessionStorage so repeats are avoided
 * until every published review has been visited.
 */

const DECK_KEY = 'random-review-deck';

function loadDeck() {
  try {
    return JSON.parse(sessionStorage.getItem(DECK_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDeck(deck) {
  try {
    sessionStorage.setItem(DECK_KEY, JSON.stringify(deck));
  } catch {
    /* storage unavailable — fresh pick every click */
  }
}

function shuffled(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function currentSlug() {
  return decodeURIComponent(
    window.location.pathname.replace(/\/+$/, '').split('/').pop() || '',
  );
}

export async function goRandomReview(base = '/') {
  const posts = await fetch(`${base}api/search.json`).then((r) => r.json());
  const pool = posts.map((post) => post.slug).filter(Boolean);
  if (pool.length === 0) return false;

  const active = currentSlug();
  let deck = loadDeck().filter((slug) => pool.includes(slug));

  let slug;
  while (true) {
    if (deck.length === 0) deck = shuffled(pool);
    slug = deck.pop();
    if (slug !== active || deck.length === 0) break;
    // only one review in the pool or it keeps landing on the current page
    deck.unshift(slug);
    deck = shuffled(pool);
  }
  if (slug === active) slug = shuffled(pool)[0];

  saveDeck(deck);

  const { navigate } = await import('astro:transitions/client');
  navigate(`${base}blog/${slug}`);
  return true;
}

export function bindRandomReviewButtons() {
  document
    .querySelectorAll('[data-random-review]')
    .forEach((button) => {
    if (button.dataset.randomBound === 'true') return;
    button.dataset.randomBound = 'true';
    button.addEventListener('click', () => {
      void goRandomReview(button.dataset.base || '/');
    });
  });
}