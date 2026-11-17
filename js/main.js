import { cards, filterCards, getCard } from "./data/cards.js";
import { dailyDraw, dealSpread } from "./draw.js";
import {
  libraryView,
  cardView,
  missingView,
  dailyView,
  spreadsView,
  resultsHtml,
  pageTitle,
} from "./views.js";

const SPREAD_KEY = "exhibit78-spread";
const LIB_KEY = "exhibit78-library";

const state = {
  route: parseHash(),
  suit: "all",
  query: "",
  from: "library",
  spread: null,
  scrollMemory: 0,
};

function parseHash() {
  const raw = decodeURIComponent((location.hash || "#/").replace(/^#/, "") || "/");
  const parts = raw.split("?")[0].split("/").filter(Boolean);
  if (parts[0] === "card" && parts[1]) {
    return {
      name: "card",
      id: parts[1],
      face: parts[2] === "reversed" ? "reversed" : "upright",
    };
  }
  if (parts[0] === "daily") return { name: "daily" };
  if (parts[0] === "spreads") return { name: "spreads" };
  return { name: "library" };
}

function loadLibrary() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(LIB_KEY) || "null");
    if (!saved) return;
    if (typeof saved.query === "string") state.query = saved.query;
    if (typeof saved.suit === "string") state.suit = saved.suit;
    if (typeof saved.scroll === "number") state.scrollMemory = saved.scroll;
  } catch {
    /* ignore broken session data */
  }
}

function saveLibrary() {
  sessionStorage.setItem(
    LIB_KEY,
    JSON.stringify({
      query: state.query,
      suit: state.suit,
      scroll: state.scrollMemory,
    })
  );
}

function loadSpread() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SPREAD_KEY) || "null");
    if (!Array.isArray(saved) || saved.length !== 3) return null;
    const spread = saved.map((entry) => {
      const card = getCard(entry.id);
      if (!card) return null;
      return {
        position: entry.position,
        reversed: Boolean(entry.reversed),
        card,
      };
    });
    if (spread.some((entry) => !entry)) return null;
    return spread;
  } catch {
    return null;
  }
}

function saveSpread(spread) {
  sessionStorage.setItem(
    SPREAD_KEY,
    JSON.stringify(
      spread.map((entry) => ({
        position: entry.position,
        id: entry.card.id,
        reversed: entry.reversed,
      }))
    )
  );
}

function visibleCards() {
  return filterCards(cards, { suit: state.suit, query: state.query });
}

function revealActiveFilter() {
  if (state.suit === "all") return;
  const button = document.querySelector(".filters [aria-pressed='true']");
  const scroller = button?.parentElement;
  if (!button || !scroller) return;
  const delta = button.getBoundingClientRect().left - scroller.getBoundingClientRect().left;
  const target = scroller.scrollLeft + delta - (scroller.clientWidth - button.offsetWidth) / 2;
  scroller.scrollLeft = Math.max(0, target);
}

function paint(html, { scroll = "keep" } = {}) {
  const y = window.scrollY;
  const focus = captureFocus();
  document.getElementById("app").innerHTML = html;
  restoreFocus(focus);
  if (scroll === "top") window.scrollTo(0, 0);
  else if (scroll === "memory") window.scrollTo(0, state.scrollMemory || 0);
  else window.scrollTo(0, y);
}

function captureFocus() {
  const el = document.activeElement;
  if (!el || el.id !== "q") return null;
  return { start: el.selectionStart, end: el.selectionEnd };
}

function restoreFocus(focus) {
  if (!focus) return;
  const input = document.getElementById("q");
  if (!input) return;
  input.focus();
  if (typeof focus.start === "number") {
    input.setSelectionRange(focus.start, focus.end);
  }
}

function announce(message) {
  const status = document.getElementById("status");
  if (!status) return;
  status.textContent = "";
  window.requestAnimationFrame(() => {
    status.textContent = message;
  });
}

function spreadAnnouncement(spread) {
  return spread
    .map((entry) => `${entry.position}: ${entry.card.name}, ${entry.reversed ? "reversed" : "upright"}`)
    .join(". ");
}

function render({ scroll = "keep", partial = false, focus = null } = {}) {
  const route = state.route;
  const card = route.name === "card" ? getCard(route.id) : null;
  document.title = pageTitle(route, card);

  if (partial && route.name === "library") {
    const results = document.getElementById("results");
    const count = document.getElementById("count");
    const list = visibleCards();
    if (results && count) {
      results.innerHTML = resultsHtml(list);
      count.textContent = `${list.length} ${list.length === 1 ? "card" : "cards"}`;
      document.querySelectorAll("[data-suit]").forEach((button) => {
        button.setAttribute("aria-pressed", button.dataset.suit === state.suit ? "true" : "false");
      });
      revealActiveFilter();
      saveLibrary();
      return;
    }
  }

  let html = "";
  if (route.name === "card") {
    html = card ? cardView(card, route.face, state.from) : missingView(state.from);
  } else if (route.name === "daily") {
    html = dailyView(dailyDraw(cards));
  } else if (route.name === "spreads") {
    html = spreadsView(state.spread);
  } else {
    html = libraryView({
      suit: state.suit,
      query: state.query,
      list: visibleCards(),
    });
  }
  paint(html, { scroll });
  if (route.name === "library") {
    saveLibrary();
    revealActiveFilter();
  }
  if (focus === "draw") document.getElementById("draw-spread")?.focus();
  else if (focus === "content") document.getElementById("content")?.focus();
}

function setFace(face) {
  const card = getCard(state.route.id);
  if (!card || (face !== "upright" && face !== "reversed")) return;
  state.route = { ...state.route, face };
  const hash = `#/card/${card.id}/${face}`;
  if (location.hash !== hash) history.replaceState(null, "", hash);
  document.querySelectorAll(".orient [role='tab']").forEach((tab) => {
    const on = tab.dataset.face === face;
    tab.setAttribute("aria-selected", on ? "true" : "false");
    tab.tabIndex = on ? 0 : -1;
  });
  const reading = document.getElementById("reading");
  if (reading) {
    reading.textContent = face === "reversed" ? card.reversed : card.upright;
    reading.setAttribute("aria-labelledby", `tab-${face}`);
  }
  document.title = pageTitle(state.route, card);
}

function onRouteChange() {
  const prev = state.route;
  if (prev.name === "library") {
    state.scrollMemory = window.scrollY;
    saveLibrary();
  }
  state.route = parseHash();
  const backToLibrary = state.route.name === "library" && prev.name === "card";
  render({ scroll: backToLibrary ? "memory" : "top", focus: "content" });
  const heading = document.querySelector("#content h1");
  if (state.route.name === "daily") {
    const name = document.querySelector(".daily-name");
    const face = document.querySelector(".face");
    announce(
      [heading?.textContent, name?.textContent, face?.textContent].filter(Boolean).join(". ")
    );
  } else if (heading) {
    announce(heading.textContent);
  }
}

document.addEventListener("click", (event) => {
  const fromLink = event.target.closest("[data-from]");
  if (fromLink) state.from = fromLink.dataset.from;

  const suit = event.target.closest("[data-suit]");
  if (suit) {
    state.suit = suit.dataset.suit;
    render({ partial: true });
    return;
  }

  const face = event.target.closest("[data-face]");
  if (face && state.route.name === "card") {
    setFace(face.dataset.face);
    return;
  }

  const action = event.target.closest("[data-action]");
  if (action && action.dataset.action === "draw-spread") {
    state.spread = dealSpread(cards, `${Date.now()}-${Math.random()}`);
    saveSpread(state.spread);
    render({ scroll: "keep", focus: "draw" });
    announce(`Three cards dealt. ${spreadAnnouncement(state.spread)}`);
    return;
  }

  if (action && action.dataset.action === "skip") {
    event.preventDefault();
    const content = document.getElementById("content");
    if (content) content.focus();
  }
});

document.addEventListener("keydown", (event) => {
  if (state.route.name !== "card") return;
  if (!event.target.closest(".orient")) return;
  let next = null;
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    next = state.route.face === "upright" ? "reversed" : "upright";
  } else if (event.key === "Home") {
    next = "upright";
  } else if (event.key === "End") {
    next = "reversed";
  } else {
    return;
  }
  event.preventDefault();
  setFace(next);
  document.getElementById(`tab-${next}`)?.focus();
});

document.addEventListener("input", (event) => {
  if (event.target.id !== "q") return;
  state.query = event.target.value;
  render({ partial: true });
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "search-form") event.preventDefault();
});

window.addEventListener("hashchange", onRouteChange);

loadLibrary();
state.spread = loadSpread();
if (!location.hash) history.replaceState(null, "", "#/");
render({ scroll: state.route.name === "library" ? "memory" : "top" });
