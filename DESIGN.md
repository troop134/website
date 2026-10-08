# Design

Visual system for troop134.org, decided by Chandra 2026-10-07 after the Scout vote: **Scout Design 3 is the primary design** (header, navigation, every page, components, data files) and **Scout Design 2 is secondary**, supplying the home page hero (topo contours and the wooden trail sign). Recorded from the built site; extend this world rather than replacing it.

## World

A troop handbook in the troop's own colors: forest-green banner and nav with a gold rule, parchment page ground, white panels. The home page opens on Design 2's trail-country field: brass topographic contours (`site/images/topo.svg`, the Scouts' artwork), the troop badge, and a wooden arrow sign for the meeting.

## Color (`site/css/styles.css` `:root`)

| Token | Hex | Role |
|---|---|---|
| `--forest` | #23422E | Banner, headings accents |
| `--forest-deep` | #15291C | Nav bar, home hero field, footer |
| `--gold` | #C9A24A | Rules under banner and hero, focus ring, accent words on dark |
| `--ground` | #F4F1E8 | Page background |
| `--panel` | #FFFFFF | Cards, panels |
| `--red` / `--btn` | #A8322C | Primary buttons (Join Us) |
| `--link` | #8E2A25 | Links on light ground |
| `--river` | #2C5B7A | Event type accents |
| Trail-sign wood | #5B3E22 | Home hero meeting sign (text #F7EBCF / #E6D6B3) |

Dark mode follows `prefers-color-scheme` and the header toggle (`data-theme`).

## Type

- Display: Bitter 600 to 800 (h1 on the home hero `clamp(2.1rem, 5.4vw, 3.5rem)`, accent phrase in gold).
- Body and UI: Source Sans 3 400/600/700, 17px/1.6.
- Small caps labels: Source Sans 3 700, uppercase, 0.14em to 0.16em tracking (footer headings, sign label).

## Components

- **Banner + topnav** (Design 3): logo, name, PayPal donate; sticky nav with dropdowns, Join Us button, theme toggle; mobile menu button.
- **Geo hero** (Design 2, home only): full-bleed forest field, topo overlay, badge right (420px; 170px top-left on phones), headline, lede, trail sign, Join Us + Instagram buttons, gold rule below. The trail sign swings once and settles (off for reduced motion).
- **Stats row, cards with round icon, Coming Up panel, event cards, footer** (Design 3).
- Empty states come from `js/site.js`: no events shows "Troop meetings every Tuesday at 7:00 PM"; no albums shows "Photo albums are coming soon".

## Data (edit these, not the pages)

`site/data/site.js` (troop facts, role emails, Eagles, stats, links), `site/data/events.txt` (events), `site/images/albums/<YYYY-MM Name>/` + Update Site (photos). See `site/HOW-TO-UPDATE.txt`.

## Rules carried from the Scout spec

No Scout last names (Eagles as first name + last initial), no Scout photos without parent permission, group role emails only, no dollar amounts, no invented events.
