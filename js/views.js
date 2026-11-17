import { suits } from "./data/cards.js";
import { icon, esc } from "./icons.js";
import { formatDate } from "./draw.js";

const FROM = {
  library: { href: "#/", label: "Library" },
  daily: { href: "#/daily", label: "Daily Draw" },
  spreads: { href: "#/spreads", label: "Spreads" },
};

function imgSrc(file) {
  return `assets/cards/${file}`;
}

/** Keep a zoomed crop inside the frame so the edges never show empty paper. */
function cropStyle(crop) {
  const s = crop.scale;
  const min = 1 - s;
  const place = (focal) => {
    const desired = 0.5 - (focal / 100) * s;
    return Math.min(0, Math.max(min, desired));
  };
  return `--s:${s};--l:${place(crop.x)};--t:${place(crop.y)}`;
}

export function resultsHtml(list) {
  if (!list.length) {
    return `<p class="empty">Nothing in the archive matches.<span>Try another name, keyword, or suit.</span></p>`;
  }
  return `<div class="grid">${list
    .map(
      (card, i) => `<a class="tile" href="#/card/${card.id}" data-from="library">
        <figure>
          <img src="${imgSrc(card.image)}" alt="" width="640" height="1105" loading="${i < 4 ? "eager" : "lazy"}" decoding="async">
          <figcaption>${esc(card.name)}</figcaption>
        </figure>
      </a>`
    )
    .join("")}</div>`;
}

function brand() {
  return `<a class="brand-name" href="#/">Exhibit 78</a>
    <p class="tagline">Look closer. Make your case.</p>
    <hr class="rule">`;
}

function nav(current) {
  const item = (id, href, label, svg) => {
    const on = current === id ? ` aria-current="page"` : "";
    return `<a href="${href}"${on}>${svg}<span>${label}</span></a>`;
  };
  return `<nav class="nav" aria-label="Primary">
    <div class="nav-inner">
      ${item("library", "#/", "Library", icon.library)}
      ${item("daily", "#/daily", "Daily Draw", icon.daily)}
      ${item("spreads", "#/spreads", "Spreads", icon.spreads)}
    </div>
  </nav>`;
}

function filters(active) {
  return `<div class="filters" role="toolbar" aria-label="Filter by suit">${suits
    .map(
      (suit) =>
        `<button type="button" data-suit="${suit.id}" aria-pressed="${suit.id === active ? "true" : "false"}">${suit.label}</button>`
    )
    .join("")}</div>`;
}

export function libraryView({ suit, query, list }) {
  return `<div class="shell has-nav">
    <header>${brand()}</header>
    <main id="content" tabindex="-1">
      <h1 class="page-title">Library</h1>
      <form class="search" role="search" id="search-form">
        <label class="sr-only" for="q">Search cards</label>
        ${icon.search}
        <input id="q" type="search" name="q" placeholder="Search cards" value="${esc(query)}" autocomplete="off" enterkeyhint="search">
      </form>
      ${filters(suit)}
      <p id="count" class="sr-only" aria-live="polite">${list.length} ${list.length === 1 ? "card" : "cards"}</p>
      <div id="results">${resultsHtml(list)}</div>
      <p class="colophon">Card images: Rider–Waite–Smith deck, drawn by Pamela Colman Smith, 1909. Public domain.</p>
    </main>
  </div>
  ${nav("library")}`;
}

export function cardView(card, face, fromKey) {
  const from = FROM[fromKey] || FROM.library;
  const text = face === "reversed" ? card.reversed : card.upright;
  const crop = card.crop;
  return `<div class="shell detail">
    <a class="back" href="${from.href}">${icon.back}<span>${esc(from.label)}</span></a>
    <hr class="rule">
    <main id="content" tabindex="-1">
      <h1 class="card-title">${esc(card.name)}</h1>
      <p class="meta">${esc(card.suit)} · ${esc(card.numeral)}</p>
      <div class="pair">
        <div class="frame">
          <img class="full" src="${imgSrc(card.image)}" alt="${esc(card.name)}" width="640" height="1105">
        </div>
        <div class="frame crop" style="${cropStyle(crop)}">
          <img src="${imgSrc(card.image)}" alt="${esc(card.cropAlt)}" width="640" height="1105">
        </div>
      </div>
      <p class="observation">${esc(card.observation)}</p>
      <p class="question">${esc(card.question)}</p>
      <p class="keywords">${card.keywords.map(esc).join(" · ")}</p>
      <div class="orient" role="tablist" aria-label="Orientation">
        <button type="button" role="tab" id="tab-upright" data-face="upright" aria-controls="reading" aria-selected="${face === "upright" ? "true" : "false"}" tabindex="${face === "upright" ? "0" : "-1"}">Upright</button>
        <button type="button" role="tab" id="tab-reversed" data-face="reversed" aria-controls="reading" aria-selected="${face === "reversed" ? "true" : "false"}" tabindex="${face === "reversed" ? "0" : "-1"}">Reversed</button>
      </div>
      <p class="reading" id="reading" role="tabpanel" aria-labelledby="tab-${face}">${esc(text)}</p>
    </main>
  </div>`;
}

export function missingView(fromKey) {
  const from = FROM[fromKey] || FROM.library;
  return `<div class="shell detail">
    <a class="back" href="${from.href}">${icon.back}<span>${esc(from.label)}</span></a>
    <hr class="rule">
    <main id="content" tabindex="-1" class="missing">
      <h1 class="card-title">Not in the archive</h1>
      <p class="observation">That card is not among the seventy-eight.</p>
      <a class="text-link" href="${from.href}">Return to ${esc(from.label)}</a>
    </main>
  </div>`;
}

export function dailyView(draw) {
  const { card, reversed } = draw;
  const face = reversed ? "reversed" : "upright";
  const text = reversed ? card.reversed : card.upright;
  return `<div class="shell has-nav">
    <header>${brand()}</header>
    <main id="content" tabindex="-1">
      <h1 class="page-title">Daily Draw</h1>
      <p class="dateline">${esc(formatDate())}</p>
      <p class="lede">One card, held until midnight.</p>
      <figure class="daily-figure">
        <img src="${imgSrc(card.image)}" alt="${esc(card.name)}" width="640" height="1105">
      </figure>
      <h2 class="daily-name">${esc(card.name)}</h2>
      <p class="meta daily-meta">${esc(card.suit)} · ${esc(card.numeral)}</p>
      <p class="face">${reversed ? "Reversed" : "Upright"}</p>
      <p class="observation">${esc(card.observation)}</p>
      <p class="question">${esc(card.question)}</p>
      <p class="reading">${esc(text)}</p>
      <a class="text-link" href="#/card/${card.id}/${face}" data-from="daily">Open the full record</a>
    </main>
  </div>
  ${nav("daily")}`;
}

function slot(entry) {
  if (!entry) {
    return `<div class="slot"><p class="slot-label">—</p><div class="placeholder"></div></div>`;
  }
  const face = entry.reversed ? "reversed" : "upright";
  return `<div class="slot">
    <p class="slot-label">${esc(entry.position)}</p>
    <a href="#/card/${entry.card.id}/${face}" data-from="spreads">
      <img src="${imgSrc(entry.card.image)}" alt="" width="640" height="1105">
      <p class="slot-name">${esc(entry.card.name)}</p>
      <p class="slot-face">${entry.reversed ? "Reversed" : "Upright"}</p>
    </a>
  </div>`;
}

export function spreadsView(spread) {
  const dealt = Boolean(spread);
  const slots = dealt
    ? spread.map(slot).join("")
    : ["Past", "Present", "Future"]
        .map(
          (position) => `<div class="slot">
            <p class="slot-label">${position}</p>
            <div class="placeholder" role="img" aria-label="${position}, not yet drawn"></div>
          </div>`
        )
        .join("");
  return `<div class="shell has-nav">
    <header>${brand()}</header>
    <main id="content" tabindex="-1">
      <h1 class="page-title">Spreads</h1>
      <p class="lede">Past, present, future. Three cards. Make the case.</p>
      <div class="spread">${slots}</div>
      <button type="button" class="btn" data-action="draw-spread">${dealt ? "Draw again" : "Lay three cards"}</button>
    </main>
  </div>
  ${nav("spreads")}`;
}

export function pageTitle(route, card) {
  if (route.name === "card") {
    return card ? `${card.name} — Exhibit 78` : "Exhibit 78";
  }
  if (route.name === "daily") return "Daily Draw — Exhibit 78";
  if (route.name === "spreads") return "Spreads — Exhibit 78";
  return "Library — Exhibit 78";
}
