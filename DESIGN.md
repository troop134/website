# Design

Visual system for troop134.org. Inherited from the winning Scout entry (Design 2, troop vote 2026-10-06) and recorded from the built coming-soon page (`site/index.html`, `site/css/coming-soon.css`). The full site will merge ideas from all five entries; extend this world rather than replacing it unless the committee decides otherwise.

## World

Northern California trail country: a forest-green field with brass topographic contours (`site/images/topo.svg`, the Scouts' own artwork), the troop badge, and wooden trail signs bolted to a post. Wayfinding, not marketing.

## Color

| Token | Hex | Role |
|---|---|---|
| `--forest` | #183326 | Page field |
| `--forest-deep` | #10241A | Field fade at the bottom |
| `--parchment` | #F4EBD3 | Headings, strong text |
| `--parchment-dim` | #E3D8BB | Body text on forest (9.6:1) |
| `--gold` | #D9AE55 | Accent word in headings, sign labels, focus ring (6.6:1 on forest) |
| `--gold-hi` | #E9C46F | Sign label on hover |
| `--wood` | #5B3E22 | Trail-sign board |
| `--wood-dark` | #3F2A16 | Post |
| `--wood-text` / `--wood-sub` | #F7EBCF / #E6D6B3 | Board text (8.2:1 / 6.8:1) |

Design 2 also defines a light paper theme (`--paper` #FBF7EC, `--brass` #8F6418 for text-safe brass, `--river` #2E5D74 links) for content pages; adopt it when inner pages are built.

## Type

- Display: Zilla Slab 700, `clamp(2.6rem, 7.2vw, 4.6rem)`, one accent word in gold.
- Body: Atkinson Hyperlegible 400/700, 1.0625rem/1.6 (chosen for legibility for every family).
- Sign lettering: Overpass 600 to 800; labels uppercase, 0.16em tracking, set vertically on the board.
- Loaded from Google Fonts with `display=swap`.

## Components

- **Signpost**: a post (`.signpost::before`) with stacked `.board` links, each an arrow-ended wooden board (clip-path) with a vertical gold label, a bold line and a sub line. Boards stagger right by 0.6 to 0.9rem. Use for the few most important destinations, never as general cards.
- **Badge**: the official logo, never recolored or cropped, with a soft drop shadow; 440px desktop, 180px phone (top left).

## Motion

One moment: boards swing on their bolt and settle (`settle`, 1.5s, cubic-bezier(.16,1,.3,1)), staggered 0.15s. Visible from the first frame; disabled under `prefers-reduced-motion`. Hover tilts a board -1.2deg.

## Layout

Full-viewport field. Desktop: copy left, badge right (1.1fr / 0.9fr, max 72rem). Phone (760px and below): badge, headline, text, signpost in one column; fits 375x812 without scrolling. Tap targets at least 48px.

## Rules carried from the Scout spec

No eyebrow labels above headings; no Scout last names, photos without permission, or personal adult contacts; no dollar amounts.
