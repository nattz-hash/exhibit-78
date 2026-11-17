/** Seeded draws. The daily card is stable for a local calendar day. */

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDate(date = new Date()) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickIndex(count, seedKey) {
  const rand = mulberry32(hashString(seedKey));
  const index = Math.floor(rand() * count);
  const reversed = rand() < 0.32;
  return { index, reversed };
}

export function dailyDraw(cards, date = new Date()) {
  const key = todayKey(date);
  const { index, reversed } = pickIndex(cards.length, `exhibit78-daily-${key}`);
  return { key, card: cards[index], reversed };
}

/** Three distinct cards. `seed` makes a redraw reproducible for the session. */
export function dealSpread(cards, seed) {
  const rand = mulberry32(hashString(String(seed)));
  const pool = cards.map((_, i) => i);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const positions = ["Past", "Present", "Future"];
  return positions.map((position, n) => ({
    position,
    card: cards[pool[n]],
    reversed: rand() < 0.32,
  }));
}
