# Exhibit 78

Look closer. Make your case.

Exhibit 78 is a mobile-first tarot archive: the full 78-card Rider–Waite–Smith deck, read as a set of pictures. Search the library, open a card, and compare the whole image with one enlarged detail. A daily draw stays the same until midnight. A three-card spread lays out past, present, and future.

The site is static. GitHub Pages serves it from the repository root — no build step.

## Use it

Open `index.html` with any static file server (ES modules do not load from `file://`).

```bash
python3 -m http.server 8765
```

Then visit `http://127.0.0.1:8765/`.

Routes are hashes, so they work on GitHub Pages:

- `#/` library
- `#/card/seven-of-swords` a card
- `#/card/seven-of-swords/reversed` the reversed reading
- `#/daily` the day’s card
- `#/spreads` past, present, future

## Archive

Card images are the 1909 Rider–Waite–Smith deck drawn by Pamela Colman Smith, scanned from public-domain copies (Wikimedia Commons, “RWS1909”). They are stored in `assets/cards/`.

Meanings are original notes on the pictures: what is there, what it asks, and how the card is read upright and reversed. They are not a reproduction of Arthur Edward Waite’s text.

Type is Newsreader, Inter, and IBM Plex Mono, under the SIL Open Font License (`assets/fonts/OFL.txt`).
