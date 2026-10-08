# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS and JavaScript only. No build step, no server code, no logins, no database (Scout spec 2026-09-26, hard rule 1). Hosted on Cloudflare Workers static assets: Worker `troop134`, `wrangler.jsonc` publishes `site/`. Changing data (events, role addresses, links) belongs in one file, `site/data/site.js`, loaded with a plain `<script>` tag.

## Users

- **Prospective families** (primary): parents of youth ages 11 to 17 who found Troop 134 through BeAScout, Google or word of mouth. They need to know when and where the troop meets and how to join.
- **Current Scouts and families** (secondary): look up events and member links (Scoutbook, trail.troop134.org).
- **Scouts as builders**: the site is designed and maintained by Troop 134 Scouts through pull requests, reviewed by adults.

## Product Purpose

The public home of Troop 134 on troop134.org, replacing the Wix site that ends 2026-11-07. Success: a family can find the meeting time and place and start joining in under a minute, on a phone. The full site will combine the best of the five Scout-built designs voted on 2026-10-06 (Design 2 won with 5 of 16 votes).

## Positioning

Built by the troop's own Scouts, not a template service. The site itself is evidence of a Scout-led troop.

## Capabilities and Constraints

- Troop facts: Troop 134, Folsom, California. Meets every Tuesday, 7:00 PM, Journey Church, 450 Blue Ravine Road, Folsom, CA 95630 (meeting place only, not a mailing address). Chartered by American Legion Post 383. Greater California Council, American River District. 34 years of Scouting.
- Join link: https://links.troop134.org/new-scout-signup. Joining questions: join@troop134.org. Website: web@troop134.org. Instagram: @troop134.
- Youth protection: no Scout last names, phone numbers, emails, addresses or school names; no Scout photos without parent permission; adults reached only through troop group addresses, never personal contacts.
- No dues or cost figures on the site ("Contact join@troop134.org for current costs").
- Works on a phone at 375 px with no sideways scroll; tap targets at least 44 px.
- No copied text or images from other sites.

## Brand Commitments

- Official Troop 134 logo, original colors and proportions: `assets/` copies of the masters in `boyscout-troop134/assets/brand/`.
- Scouting program name is "Scouts BSA"; the magazine is "Scout Life".
- Voice: warm and welcoming to new families, plain and specific.

## Evidence on Hand

- Five Scout designs: Design 2 (winner) and 3, 5 at trail.troop134.org/website-vote/design-N/; Design 1 at sanuslide.github.io/troop-134-website; Design 4 on Netlify (404 at 2026-10-07).
- Council Eagle list: 59 Eagles 1968 to 2026, for a future Wall of Honor (first name, last initial, year only; three pre-1992 entries unconfirmed).
- No testimonials, photos with permission or event data yet. Do not invent them.

## Product Principles

1. Joining is the job: meeting time, place and the join path come first on every entry page.
2. Scouts build it, adults review it: keep the code simple enough for a teenager to change safely.
3. Youth protection over completeness: when in doubt, leave personal details out.
4. Never look empty or stale: a missing section is better than an out-of-date one.

## Accessibility & Inclusion

Phone-first, readable in sunlight at a campsite, WCAG AA contrast. Families include many first-generation Scouting parents, so avoid unexplained Scouting jargon.
