# Brief: Photo albums on troop134.org

Interview with Chandra, 2026-11-19. Spec: `boyscout-troop134/docs/superpowers/specs/2026-11-19-photo-album-publishing-design.md` (section 5.5).

## Summary

- Every troop activity gets its own page with its photos, videos and the Scouts' memories.
- `/photos` lists every activity, newest first.
- Visitors should see the fun the troop has, and new families should feel invited to join.

## Audience and devices

- Phone first. Most visitors open a link from an email or WhatsApp.
- Current families (seeing their own trip) and prospective families (deciding to join).
- Many are first-generation Scouting parents. No unexplained Scouting words.
- Comps: `MOBILE` first. Check every built page at 390, 768 and 1280 px.

## Screen 1: Photos wall (`/photos`)

Sections, in order:

1. Site banner and nav (existing, Design 3).
2. Page title "Photo Albums" and one line: "Trips, campouts and service, told by our Scouts."
3. Cards, newest first, one column on a phone, two or three on a computer. Each card:
   - cover photo (4:3, rounded corners)
   - event name (Bitter)
   - month and year, for example "September 2026"
   - category badge, for example "Campout"
   - counts, for example "24 photos, 1 video"
   - the whole card is the link
4. Empty state: "Photo albums are coming soon. Follow us on Instagram for the latest pictures."
5. Site footer (existing).

Main action: tap a card.

## Screen 2: Event page (`/photos/<slug>`)

Sections, in order:

1. Site banner and nav (existing).
2. One title line: event name, then dates and place in small text. "All albums" back link above it.
3. Carousel, photos first:
   - one big photo or video at a time, swipe on phones, arrow keys on computers
   - counter "3 of 24"
   - a strip of small thumbnails under it to jump to any item
   - videos show a poster with a play button, never play by themselves
4. Numbers strip: badge-style tiles, big number with a word under it ("12 miles", "2 nights", "1,800 ft climbed", "6 service hours", "14 Scouts"). Weather as a word tile. Food and fun ratings as stars. Empty values are hidden. Scrolls sideways on a phone when there are many.
5. Memories: one story card per Scout write-up:
   - the story paragraph
   - short labeled lines: "Best moment", "Funniest moment", "Tip for next time"
   - the quote of the trip set large, as a pull-quote
   - "Photos by Sam S." at the bottom
6. Join box: "Want your Scout on the next trip? We meet Tuesdays at 7 PM at Journey Church in Folsom." Button "Join Us" to https://links.troop134.org/new-scout-signup.
7. Previous and next event links, and "All albums".
8. Small line: "Want a photo removed? Email webmaster@troop134.org".
9. Site footer (existing).

Main action: swipe through the photos. Second action: Join Us.

## Look and feel

- Colors, fonts and components from `DESIGN.md` (Scout Design 3): forest banner and nav with a gold rule, parchment ground, white panels, red Join button, Bitter headings, Source Sans 3 body.
- Carousel area may sit on `--forest-deep` so photos stand out.
- Category badge uses `--river`.
- Component library: none, hand-built. The site has no build step and Scouts maintain it.

## Limits

- No Scout last names. Credit shows first name and last initial at most.
- No original file names, no location data.
- Event pages carry `noindex`.
- Tap targets at least 44 px. WCAG AA contrast. Respect reduced motion.
- Sample content for comps: the 12 Tahoe photos in `boyscout-troop134/web/album-mockup/photos/` (Glen Alpine, Gilmore Lake, Mount Tallac).
- The small Worker script on `/photos/*` is approved by Chandra for link previews (an exception to "static files only", 2026-11-19).

## Record

Stitch: yes (Photos wall, Event page)

## Chosen comps (2026-11-19)

Stitch project `18194236812770850426` ("Troop 134 photo albums"). Chosen by Claude on Chandra's standing instruction to go with the recommendations.

- Photos wall: screen `24d834aec2d14ce9af782710be508c40`, saved as `docs/stitch/photos-wall.png`. Build note: drop the copyright line; use the site's existing footer.
- Event page: screen `a0660cb7cac84674a8bc018ba7da4193`, saved as `docs/stitch/event-page.png` (rendered from the screen HTML at 390 px). Build notes: the numbers strip also holds the Scouts, weather, Food and Fun star tiles (scrolls sideways); use the site's existing header and footer; take-down line and join box as shown.
