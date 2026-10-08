# CLAUDE.md: troop134-website

Public website for Scouts BSA Troop 134 (Folsom, CA) at troop134.org. Built by the troop's Scouts; reviewed by adults.

## Where things are

- Remote: https://github.com/troop134/website (GitHub org `troop134`, owners `troop134-webmaster` = webmaster@troop134.org Google SSO, and `chandragaajula`).
- `site/`: everything published. Plain HTML/CSS/JS, no build step.
- `wrangler.jsonc`: Cloudflare Workers static assets, Worker `troop134`, account webmaster@troop134.org. Every push to `main` deploys; every branch gets a preview build.
- `PRODUCT.md` (product truth, youth-protection rules), `DESIGN.md` (visual system). Read both before UI work, and use the impeccable skill.
- Committee context, decisions and TODOs live in `~/my-world/projects/boyscout-troop134/` (TODO row "Build new troop134.org").

## Analytics

- Umami Cloud (free Hobby plan), account webmaster@troop134.org, website "Troop 134", ID `ba974b74-b465-48cd-b8ee-c83ded43986d`. The script tag sits in every page `<head>` with `data-domains="troop134.org,www.troop134.org"`, so previews and workers.dev are not counted. Cookieless; no consent banner needed. Every new page needs the same tag.

## Rules

- Changes go through a pull request; `main` needs one approval from the Adult Reviewers team (CODEOWNERS). Org owners can bypass only for emergencies.
- Repo is public: no secrets, no Scout last names, contact details, or photos without permission on file.
- Preview locally: `python3 -m http.server 8734 --directory site`, or `npx wrangler dev`.
- Never use em dashes in copy.

## Status (2026-10-07)

- Full site = Scout Design 3 (primary) + Design 2 home hero (secondary), per Chandra. Content lives in `site/data/` (see `site/HOW-TO-UPDATE.txt`); after adding photo albums run `python3 site/update-site.py` and commit `data/albums.js`.
- Tool files (`update-site.py`, `Update Site*`, `HOW-TO-UPDATE.txt`) are kept out of the published site by `site/.assetsignore`.
- troop134.org and www are custom domains on the Worker (cutover 2026-10-07); Always Use HTTPS on, TLS 1.2 minimum; registrar is Cloudflare (expires 2027-11-10).

Jev: no (static website; no judgment step to type or gate).
