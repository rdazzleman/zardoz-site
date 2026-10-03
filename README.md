# zardoz.io

The marketing site for Zardoz, built on [PolicyForge](https://github.com/rdazzleman/policyforge).
It's a static site (Astro): no server, no database and no tracking scripts.

## Build and preview

```sh
npm ci
npm run dev       # http://localhost:4321
npm run build     # static output in dist/
```

## Where things live

| What | Where |
|---|---|
| Contact address, nav, links | `src/lib/site.ts` (one place; change it there) |
| Install version shown on /quickstart | `src/lib/version.ts`, **resolved at build time** from the latest PolicyForge release, so it can't go stale in the page |
| Design tokens and all styles | `src/styles/global.css` (light and dark themes) |
| Pages | `src/pages/*.astro`: `/`, `/how-it-works`, `/frameworks`, `/models`, `/quickstart`, `/contact`, `/404` |
| Docs | `src/pages/docs/*.md`, one page per section of the PolicyForge 1.7.0 README, with `src/layouts/Doc.astro` and the sidebar in `src/lib/docs.ts`. The README was cut to install and quick start for 1.7, so **these pages are now where that text lives**. Each page names the README lines it came from. The README's open roadmap items are tracked as issues, not here |
| Contact | `/contact`: a form that opens the visitor's email app addressed to `info@zardoz.io` (the site has no server). There is no services page |

**Every figure on the site comes from the PolicyForge repository at a released tag**, never from memory. The framework counts come from each catalog's `controls.json`; the costs from `MEASUREMENTS.md` (cost only, not quality). When a release changes a catalog, re-derive the figures from the tag.

## Where it lives

- **Forgejo (`policyforge/zardoz-site`) is where work happens.** Changes are pushed there.
- **GitHub (`rdazzleman/zardoz-site`, public) is a push mirror of it.** Forgejo pushes every change on, and GitHub Pages builds and serves zardoz.io from the mirror. Nobody pushes to GitHub directly.

## CI

- **On Forgejo:** `.forgejo/workflows/build.yml` builds every push and fails if any page is missing, including any page under `src/pages/docs/`. Forgejo ignores `.github/workflows/` while `.forgejo/workflows/` exists, so the Pages deploy never runs there.
- **On GitHub:** `.github/workflows/build.yml` runs the same checks, and `deploy.yml` publishes to GitHub Pages on every push to `main`. Both deploy jobs skip themselves if the repository is ever private.

## Going live: in this order

1. **Create the public GitHub repo empty** (`rdazzleman/zardoz-site`: no README, licence or .gitignore), so the first mirror push is its whole history.
2. **A fine-grained personal access token** for that one repository, with **Contents: read and write** and **Workflows: read and write**. The second is needed because the mirror pushes `.github/workflows/`, and GitHub refuses a workflow file from a token without it.
3. **On Forgejo: `policyforge/zardoz-site` → Settings → Repository → Mirror settings → Push mirror.** URL `https://github.com/rdazzleman/zardoz-site.git`, username `rdazzleman`, the token as the password, and **Sync when commits are pushed** on. Use **Synchronize now** once, then check that GitHub shows the commit.
4. **GitHub: Settings → Pages → Build and deployment → Source: GitHub Actions.**
5. **Verify the domain first** (your GitHub account → Settings → Pages → Add a domain: a TXT record at GoDaddy). A verified domain can't be claimed by another account's Pages site.
6. **Repo → Settings → Pages → Custom domain: `zardoz.io`**, before changing DNS. `public/CNAME` already contains `zardoz.io`.
7. **DNS at GoDaddy** (the registrar; nameservers `domaincontrol.com`):
   - apex `@`: four **A** records, `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www`: **CNAME** to `rdazzleman.github.io`
   - remove GoDaddy's parking or forwarding records for `@`
   - reference: <https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site>
8. When the certificate is issued, tick **Enforce HTTPS**.
9. Push to `main` on Forgejo, or run **Deploy to GitHub Pages** by hand on GitHub.
10. **Mail for `info@zardoz.io` (Proton):** add the MX, SPF, DKIM and DMARC records that Proton's dashboard gives, at GoDaddy alongside the ones above. Proton offers a HIPAA BAA on request (privacy@support.proton.me, subject "HIPAA BAA").

If the GitHub repo ever moves to another account, re-check the custom domain (step 6), the `www` CNAME target and the push mirror's URL.
