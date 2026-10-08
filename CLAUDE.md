# CLAUDE.md: troop134-website

Public website for Scouts BSA Troop 134 (Folsom, CA) at troop134.org. Built by the troop's Scouts; reviewed by adults.

## Where things are

- Remote: https://github.com/troop134/website (GitHub org `troop134`, owners `troop134-webmaster` = webmaster@troop134.org Google SSO, and `chandragaajula`).
- `site/`: everything published. Plain HTML/CSS/JS, no build step.
- `wrangler.jsonc`: Cloudflare Workers static assets, Worker `troop134`, account webmaster@troop134.org. Every push to `main` deploys; every branch gets a preview build.
- `PRODUCT.md` (product truth, youth-protection rules), `DESIGN.md` (visual system). Read both before UI work, and use the impeccable skill.
- Committee context, decisions and TODOs live in `~/my-world/projects/boyscout-troop134/` (TODO row "Build new troop134.org").

## Rules

- Changes go through a pull request; `main` needs one approval from the Adult Reviewers team (CODEOWNERS). Org owners can bypass only for emergencies.
- Repo is public: no secrets, no Scout last names, contact details, or photos without permission on file.
- Preview locally: `python3 -m http.server 8734 --directory site`, or `npx wrangler dev`.
- Never use em dashes in copy.

## Status (2026-10-07)

- Coming-soon page live on the Worker; troop134.org apex/www still point at Wix until the cutover (Wix ends 2026-11-07). Cutover = add troop134.org and www as custom domains on the Worker in Cloudflare, replacing the Wix DNS records.
- Next: merge the best of the five Scout designs into the full site (spec: `boyscout-troop134/wiki/drafts/2026-09-26-troop-website-spec.md`).

Jev: no (static website; no judgment step to type or gate).
