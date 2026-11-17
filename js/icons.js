export const icon = {
  search: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.25" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M15.6 15.6L20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  back: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5L8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  library: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="6.5" width="12" height="14" rx="0.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 16.5V4.5h12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  daily: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 10h16M8 3.5v4M16 3.5v4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  spreads: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6.2c-1.8-1.15-4-1.55-7.2-1.4v13.3c3.1-.15 5.2.25 7.2 1.5 2-1.25 4.1-1.65 7.2-1.5V4.8c-3.1-.15-5.4.25-7.2 1.4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 6.2v13.4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
};

export function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}
