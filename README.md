# troop134.org

Source for the Scouts BSA Troop 134 website (Folsom, California). The site is designed and built by Troop 134 Scouts.

In October 2026 the troop voted on five Scout-built designs. The new site brings together the best ideas from all five.

## How to contribute

1. Ask the webmaster (webmaster@troop134.org) to add you to the **Website Scouts** team.
2. Create a branch, make your change, and open a pull request against `main`.
3. Each pull request gets a preview link. An adult on the **Adult Reviewers** team reviews it before it goes live.

## Rules for content

- No full names, home addresses, phone numbers, emails or birthdates of Scouts on the site or in this repo.
- Photos of Scouts only with the troop's photo permission on file.
- No passwords, API keys or other secrets in this repo. It is public.

## Hosting

Static site on Cloudflare Pages (account: webmaster@troop134.org). DNS for troop134.org is on the same Cloudflare account.

Everything the public sees lives in `site/` (start at `site/index.html`). Cloudflare publishes that folder as-is; there is no build step. Files outside `site/` (this README, `.github/`) are never published.
