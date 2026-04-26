# Cabs · Deployment

Production deploy of `joincabs.com` runs on **Hostinger Web Hosting** (Business plan) with Hostinger's GitHub auto-deploy pipeline.

## TL;DR

```
git push main  →  Hostinger pulls  →  npm install  →  npm run build  →  dist/  →  public_html/
```

That's it. No manual upload, no FTP, no SSH. Push to `main` and the site redeploys.

## Architecture

```
              Cloudflare Turnstile (anti-bot)
                       │
   www.joincabs.com    │
        │              │
   ┌────▼─────────┐    │
   │  Browser     │    │
   │  (SPA, Vite) ├────┘  POST /api/public/contact
   │              │       POST /api/public/notify
   └────┬─────────┘                │
        │                          │
        │ HTTPS (Let's Encrypt)    │
        │                          │
   ┌────▼──────────────────────────▼────┐
   │  Hostinger Apache (PHP 8.x)         │
   │                                     │
   │  public_html/                       │
   │    .htaccess        ← SPA fallback, rewrites /api/X → /api/X.php
   │    index.html       ← entry        │
   │    404.html         ← copy of index (SPA fallback at HTTP layer)
   │    assets/*         ← Vite hashed bundle
   │    api/public/                      │
   │      contact.php    ← form handlers │
   │      notify.php                     │
   │      _lib.php       ← shared helpers (Turnstile verify, mail send)
   │      _config.php    ← AUTO-GENERATED at build time (gitignored)
   │                                     │
   └─────────────────┬───────────────────┘
                     │
                     │ PHP mail()
                     ▼
            Hostinger MTA (smtp.hostinger.com)
                     │
                     ▼
            contact@joincabs.com (mailbox on same Hostinger account)
```

## Hostinger build config

Set once via hPanel → joincabs.com → Files → Web hosting source (or "Setup Web App" depending on UI version):

| Setting | Value |
|---|---|
| Source | GitHub repo `n4wf3l/Landing-Cabs` |
| Branch | `main` |
| Framework preset | Vite |
| Node version | 22.x |
| Root directory | `./` |
| Build command | `npm run build` |
| Output directory | `dist` |

## Environment variables (Hostinger UI)

The build pipeline reads env vars at build time. Vite bakes the `VITE_*` ones into the JS bundle; `scripts/write-php-config.cjs` writes the rest into `dist/api/public/_config.php` for the PHP runtime.

**Required**

| Variable | Source |
|---|---|
| `TURNSTILE_SECRET_KEY` | Cloudflare → Turnstile → joincabs.com → Settings (rotate after public deploy) |
| `VITE_TURNSTILE_SITE_KEY` | Same place, the Site key (public, baked into JS bundle) |

**Recommended overrides** (defaults exist in code but explicit is safer)

| Variable | Value |
|---|---|
| `VITE_SITE_URL` | `https://www.joincabs.com` |
| `VITE_PUBLIC_EMAIL` | `contact@joincabs.com` |
| `VITE_USE_MOCK_API` | `false` |
| `MAIL_FROM_ADDRESS` | `contact@joincabs.com` |
| `MAIL_INBOUND_TO` | `contact@joincabs.com` |
| `BRAND_URL` | `https://www.joincabs.com` |

A local `.env.hostinger` file (gitignored) holds the same values for fast re-import via the Hostinger UI's "Import .env" feature.

## How the PHP config gets injected

The Turnstile secret can't sit in `_config.php` in git (it's a secret). And Hostinger pulls from git, so the secret can't ship that way. The fix is a build-time script:

`package.json`:
```json
"build": "tsc -b && vite build && node scripts/write-php-config.cjs"
```

`scripts/write-php-config.cjs`:
- Reads `TURNSTILE_SECRET_KEY` and friends from `process.env`
- Writes `dist/api/public/_config.php` with the values inlined as PHP literals
- No-op when `TURNSTILE_SECRET_KEY` is absent (local builds keep the existing `public/api/public/_config.php`)

So:
- **Hostinger build** → env vars set → script writes `_config.php` → deployed
- **Local build** → env vars absent → script skips → existing local `_config.php` (gitignored) wins → useful for testing

## .htaccess routing

`public/.htaccess` (copied to `dist/.htaccess` then to `public_html/.htaccess`) handles:

1. Force HTTPS (301)
2. Force www canonical (`joincabs.com → www.joincabs.com`, 301)
3. Extensionless API: `/api/public/contact` → `/api/public/contact.php`
4. SPA fallback: any non-existing route → `index.html`
5. Long-term cache on hashed assets (`max-age=31536000, immutable`)
6. Short-term cache on HTML (`max-age=300, must-revalidate`)
7. Security headers (X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options, HSTS)
8. Block direct access to `_lib.php` / `_config*.php`
9. Disable directory listing

## DNS

Nameservers are Hostinger's (`hermes.dns-parking.com` + `artemis.dns-parking.com`). The `joincabs.com` and `www.joincabs.com` A records point to the Hostinger server IP (`147.79.103.86`).

## SSL

Lifetime SSL (Let's Encrypt managed by Hostinger) on both `joincabs.com` and `www.joincabs.com`. Auto-renewal handled by Hostinger.

## Cloudflare Turnstile

- Site: joincabs.com
- Hostnames: `joincabs.com`, `www.joincabs.com`, `127.0.0.1` (local dev)
- Widget mode: Managed
- Pre-clearance: No
- Site key (public): in `VITE_TURNSTILE_SITE_KEY`
- Secret key (private): in `TURNSTILE_SECRET_KEY`

## Email flow

All transactional + contact email goes through `contact@joincabs.com`, a Hostinger mailbox on the same account as the joincabs.com hosting. SMTP is `smtp.hostinger.com:465` (SSL) but the PHP backend uses PHP's `mail()` function, which delivers via Hostinger's local MTA — no SMTP auth required, no password in code. SPF/DKIM are aligned because the From address sits on a Hostinger-managed domain.

`info@nainnovations.be` was used in earlier iterations and is fully removed from the codebase.

## What lives where

| Concern | Location |
|---|---|
| SPA source | `src/` |
| Static assets | `public/` |
| Backend (Node, dev only) | `server/` (NOT deployed; was originally for Render before pivoting to PHP) |
| Backend (PHP, prod) | `public/api/public/*.php` |
| Build-time PHP config writer | `scripts/write-php-config.cjs` |
| Apache rules | `public/.htaccess` |
| Locales | `src/locales/{fr,en,nl,de}.json` |
| Env (frontend, local dev) | `.env.local` (gitignored) |
| Env (frontend, local prod build) | `.env.production` (gitignored) |
| Env (Hostinger import file) | `.env.hostinger` (gitignored) |
| Env (PHP backend, local dev) | `public/api/public/_config.php` (gitignored) |

## Local commands

```bash
npm run dev           # Vite dev server only (port 5173)
npm run dev:server    # Express server for /api in dev (port 8080)
npm run dev:all       # Both, killed together
npm run build         # tsc + vite build + write _config.php from env
npm run preview       # Serve dist/ locally on 4173
```

## Redeploy after a code change

```bash
git push origin main
```

Hostinger detects the push (webhook), rebuilds, swaps `public_html/`. Logs visible in hPanel → joincabs.com → Files → Source / Deployments.

Build time on Hostinger: ~30-60s for the full pipeline (npm install + tsc + vite + postbuild).

## Rollback

If a deploy breaks, redeploy a previous commit:

```bash
git revert <bad-commit-sha>
git push
```

OR via hPanel → Deployments → click an older successful build → "Redeploy".

## Known caveats

- The Vite build emits a "chunk > 500 KB" warning on `index-XXXX.js` (~516 KB). Acceptable for now, can be split via dynamic imports later.
- The Node `server/` folder still ships in the repo even though it's not deployed. Kept for local dev parity. Safe to delete if you fully commit to PHP.
- `Hostinger Free Email` for `contact@joincabs.com` shares quota with the rest of the joincabs.com email accounts. Watch deliverability if waitlist signups spike.
