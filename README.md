# Cabs — Landing & Self-Service Signup

Marketing site and trial-signup portal for **Cabs**, a B2B SaaS fleet-management platform for taxi companies. Built with React 19, TypeScript, Vite, Tailwind, shadcn/ui, and Framer Motion.

## Stack

- **Framework**: React 19 + TypeScript 6 + Vite 8
- **Styling**: Tailwind CSS 3.4 (dark mode default), shadcn/ui (new-york), Radix primitives
- **Animation**: Framer Motion 12
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6
- **i18n**: i18next (FR canonical, EN / NL / DE seeded)
- **HTTP**: Axios with a mock interceptor for `/api/public/*`
- **Toasts**: Sonner
- **Icons**: Lucide
- **SEO**: react-helmet-async + sitemap.xml + JSON-LD

## Scripts

```bash
# Frontend
npm install          # install front deps
npm run dev          # Vite on http://localhost:5173
npm run build        # tsc --build && vite build
npm run preview      # preview the production build
npm run lint         # eslint

# Backend bridge (handles email)
npm run server:install   # install server deps (one time)
npm run dev:server       # start the API on http://localhost:8080

# Run both together (frontend + backend)
npm run dev:all
```

## Backend bridge (`server/`)

A small Express server lives in [`server/`](server/) and handles:
- `POST /api/public/contact` — receives the contact form, sends an email via SMTP
- `POST /api/public/notify` — receives waitlist signups, notifies the team and sends a confirmation to the subscriber
- `GET /api/public/health` — health check

It uses [nodemailer](https://nodemailer.com) and reads SMTP credentials from `server/.env` (gitignored).

### Why a separate server?

SMTP credentials must **never** live in the frontend. Anything the browser can read is public. The backend reads them at runtime and the password never touches the client bundle. A browser also can't open SMTP sockets — you need a server process.

### Configure the backend

1. Copy `server/.env.example` to `server/.env`
2. Fill the SMTP values (host, port, username, password, from address)
3. Run `npm run server:install` once
4. Run `npm run dev:server` (or `npm run dev:all` to start both)

The Vite dev server proxies `/api` → `http://localhost:8080` so the frontend can call the backend without CORS hassle.

### Frontend env

Copy `.env.example` to `.env.local` if you want to override defaults:

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_SITE_URL` | `https://www.joincabs.com` | Used in canonical URLs, OG tags, JSON-LD |
| `VITE_PUBLIC_EMAIL` | `hello@joincabs.com` | Public-facing email shown in footer / contact / legal |
| `VITE_API_URL` | `''` (relative, proxied) | Override only if the backend is on a different origin in production |
| `VITE_USE_MOCK_API` | `false` | Set to `true` to use the in-process mock handler instead of the real backend |
| `VITE_MOCK_FAILURE_RATE` | `0` | Between 0 and 1 — random failure probability when mocks are on |

## Deployment — dev/prod parity

The project is **hybrid by design**: the same code runs locally and in production. Three deployment patterns are supported, pick the one that fits your hosting stack.

### Pattern A — Same domain (recommended for `www.joincabs.com`)

Frontend at `https://www.joincabs.com`, backend reachable at `https://www.joincabs.com/api/*` via reverse proxy. **No CORS, no env override on the frontend.**

Reverse proxy config (nginx example):
```nginx
location /api/ {
  proxy_pass http://127.0.0.1:8080;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
  root /var/www/cabs/dist;
  try_files $uri $uri/ /index.html;
}
```

Cloudflare Pages + a Cloudflare Worker on `/api/*` works the same way.

### Pattern B — Separate subdomain

Frontend at `https://www.joincabs.com`, backend at `https://api.joincabs.com`. Set on the frontend:
```
VITE_API_URL=https://api.joincabs.com
```

On the backend, ensure CORS allows your frontend origin:
```
ALLOWED_ORIGIN=https://www.joincabs.com,https://joincabs.com
```

### Pattern C — Serverless (Vercel / Netlify)

Wrap `server/index.js` as a serverless function. Vercel example: move the route handlers into `api/contact.ts` and `api/notify.ts` files at the repo root. The same nodemailer logic runs unchanged. Set the SMTP env vars in the Vercel project settings.

### Backend deployment targets

The Express server in `server/` is plain Node — runs on anything:

| Platform | How |
|---|---|
| **Railway / Render / Fly** | Connect repo, set root dir to `server/`, run `npm start`. Add env vars in dashboard. |
| **VPS (Hetzner, OVH, etc.)** | `git pull`, `npm install --prefix server`, run with PM2 or systemd. |
| **Cloudflare Workers** | Port routes to Workers (nodemailer doesn't work — use Workers Mailchannels integration or Resend API instead). |
| **Vercel / Netlify functions** | Move route handlers to `api/*` (see Pattern C). |

### Production env vars (server)

Set these on your hosting platform — **never** commit `server/.env` to git:

```
NODE_ENV=production
PORT=8080                                   # or whatever the platform assigns
ALLOWED_ORIGIN=https://www.joincabs.com,https://joincabs.com
BRAND_URL=https://www.joincabs.com

MAIL_HOST=smtp-auth.mailprotect.be
MAIL_PORT=587
MAIL_USERNAME=info@nainnovations.be
MAIL_PASSWORD=<rotated_password>
MAIL_FROM_ADDRESS=info@nainnovations.be
MAIL_FROM_NAME=Cabs
MAIL_INBOUND_TO=info@nainnovations.be
SEND_NOTIFY_CONFIRMATION=true
```

When `NODE_ENV=production`, the server auto-defaults `ALLOWED_ORIGIN` to the joincabs.com origins if you forget to set it. `trust proxy` is enabled so rate limiting reads the real client IP from `X-Forwarded-For`.

### Production env vars (frontend)

Set these on your static host (Vercel / Netlify / Cloudflare Pages / etc.):

```
VITE_SITE_URL=https://www.joincabs.com
VITE_PUBLIC_EMAIL=hello@joincabs.com
VITE_API_URL=                             # empty for same-domain (Pattern A)
                                          # or https://api.joincabs.com (Pattern B)
VITE_USE_MOCK_API=false
```

## Project layout

```
src/
  components/
    ui/            shadcn primitives
    layout/        Navbar, Footer, layouts, theme/lang toggles
    common/        SEO, SectionHeading, ScrollReveal, GlowEffect, SkipLink, CustomCursor
    sections/      Landing and pricing sections
    signup/        Wizard subcomponents (StepIndicator, PasswordInput, PlanRadioCard, PricePanel)
  pages/           One file per route, code-split with React.lazy
  lib/             plans, analytics, seo, axios+mocks, Zod schemas
  locales/         fr / en / nl / de JSON (FR is canonical)
  hooks/           theme, reduced motion, scroll position, query-plan parser
```

## Scope / decisions

- **Frontend only.** The API is mocked in-process. When the Spring Boot side is ready, flip `VITE_USE_MOCK_API=false` and the same typed clients hit the real endpoints.
- **Stripe is deferred.** Step 3 of the signup wizard creates the account in trial mode. If the user disables the trial toggle, a toast acknowledges "Stripe coming soon" and the account is still created. The UI is Stripe-ready — `stripePriceId*` slots exist on each plan and the `createCheckoutSession` client is already implemented.
- **Dark mode is the default.** A theme toggle in the navbar persists to localStorage.
- **i18n.** French is canonical; English, Dutch, German are seeded as FR copies — hand `src/locales/{en,nl,de}.json` to a translator.

## Where things live

| Route | Component | Notes |
|-------|-----------|-------|
| `/` | `pages/Landing.tsx` | Hero, TrustBar, Features, Showcase, Testimonials, WhyCabs, FinalCTA |
| `/features` | `pages/Features.tsx` | Full feature grid |
| `/pricing` | `pages/Pricing.tsx` | Toggle, 3 cards, comparison table, FAQ, CTA |
| `/signup` | `pages/signup/SignupLayout.tsx` | 3-step wizard on a focused layout (no Navbar) |
| `/signup/success` | `pages/SignupSuccess.tsx` | Confetti + dashboard redirect |
| `/about` `/contact` `/legal/*` | — | Secondary pages |
| `/login` | `pages/Login.tsx` | Redirects to `VITE_APP_URL` |

## Assets

- `public/tlogo_white.png` — logo for dark backgrounds (default)
- `public/tlogo_black.png` — logo for light mode
- `public/favicon.svg`, `public/robots.txt`, `public/sitemap.xml`
- `src/assets/hero.png` — placeholder dashboard screenshot; swap for real UI captures when available

## Verification checklist

- `npm run dev` — renders on http://localhost:5173 in FR / dark
- `/pricing` — toggle monthly↔annual cross-fades prices; "Commencer" on Business → `/signup?plan=business&cycle=monthly`
- `/signup` — step 1 blocks advance until VAT + email + password match; back/forward preserves values
- `/signup` step 3 trial → `/signup/success` with confetti
- `VITE_MOCK_FAILURE_RATE=1` → Sonner error toast with "Réessayer"
- Lang switcher FR → EN → NL → DE updates `<html lang>`
- Theme toggle swaps logo variant and CSS variables
- Keyboard: Tab → skip-link visible → nav → CTAs, all reachable with focus ring
