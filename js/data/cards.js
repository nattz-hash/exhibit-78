import { majors } from "./majors.js";
import { wands } from "./wands.js";
import { cups } from "./cups.js";
import { swords } from "./swords.js";
import { pentacles } from "./pentacles.js";

export const suits = [
  { id: "all", label: "All" },
  { id: "major", label: "Major" },
  { id: "wands", label: "Wands" },
  { id: "cups", label: "Cups" },
  { id: "swords", label: "Swords" },
  { id: "pentacles", label: "Pentacles" },
];

export const cards = [...majors, ...wands, ...cups, ...swords, ...pentacles].map((card) => ({
  ...card,
  search: [
    card.name,
    card.suit,
    card.numeral,
    card.keywords.join(" "),
    card.observation,
    card.question,
    card.upright,
    card.reversed,
  ]
    .join("\n")
    .toLowerCase(),
}));

const byId = new Map(cards.map((card) => [card.id, card]));

export function getCard(id) {
  return byId.get(id) || null;
}

export function filterCards(list, { suit = "all", query = "" } = {}) {
  const q = query.trim().toLowerCase();
  return list.filter((card) => {
    if (suit !== "all" && card.arcana !== suit) return false;
    if (!q) return true;
    return card.search.includes(q);
  });
}
