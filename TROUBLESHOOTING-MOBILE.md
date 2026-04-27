# Mobile rendering — investigation log

## The symptom

On real mobile devices (multiple phones, multiple networks):

- After the splash screen dismisses, the **Hero** and the top of the
  **ProductTicker carousel** paint quickly
- **Below the carousel**, content appears **progressively over 10–16 seconds**
  ("chaque donnée se charge à son aise")
- Sometimes the carousel body itself is empty/black for a few seconds before
  filling in

What is **NOT** the symptom:

- Not present on **laptop** browsers
- Not present in **DevTools mobile emulation** on the same laptop
- Not specific to one phone, one network, one browser
- Not a network speed issue (Brotli compression confirmed, ~228 KB initial JS,
  fast.com tests showed 20+ Mbps)

So the bottleneck is something specific to **real mobile rendering pipelines**
that DevTools simulation does not reproduce — typically a combination of real
mobile GPU/CPU class and possibly iOS Safari WebKit quirks.

---

## What has been tried (chronological)

### 1. Reduce bundle size + lazy loading
- Lazy-loaded `ProductShowcase` and `DriverApp` with React.lazy + Suspense
- Initial bundle dropped from 853 KB → 600 KB (250 → 196 KB gzipped)
- **Did not fix the issue.** While bundle size matters, real-mobile parse on
  600 KB is still 1–3 s, not 10–16 s.

### 2. Add a real shimmer skeleton instead of empty Suspense fallback
- Created `SectionSkeleton` with `animate-pulse` Tailwind divs that mimic the
  real layout
- **Did not fix.** User reported never seeing the skeleton — the issue is not
  about the chunk fetch but something happening earlier or in parallel.

### 3. Lazy-on-click "Play card" pattern
- Replaced the eager-rendered sims with two Play cards. User has to tap to
  load the sim chunk. Default state = lightweight card with a Play button.
- **Did not fix.** User confirmed the page below the cards still didn't
  render reliably. Reverted to eager sims direct in page.

### 4. Strip framer-motion `initial: opacity: 0` from Hero
- Replaced motion components in Hero (eyebrow, title, subtitle, NotifyMeForm
  wrapper) with plain HTML. Reasoning: on a slow main thread, framer-motion's
  animation loop doesn't fire timely → elements with `initial: 0` stay
  invisible.
- **Did not fix.** User reverted at their request.

### 5. Force section content visible from frame 0
- Changed `staggerItem.hidden` and `ScrollReveal` `hidden` from
  `{ opacity: 0 }` to `{ opacity: 1 }`. The translate stays as a subtle
  enter-cue.
- Flipped `initial.opacity` from 0 to 1 on inline motion components in
  `PainPoints`, `ProductShowcase`, `ROISimulator`, `FinalCTA`.
- **Did not fix the broader symptom.** Helped a little (sections at least
  hold their bg), but the deeper rendering delay persisted.

### 6. Static HTML loader pre-React
- Added a CSS-only spinner inside `#root` in `index.html`. Paints from the
  HTML before any JS, replaced when React mounts.
- Visible only during the cold-load → splash transition. Doesn't address the
  "data appears progressively" symptom that happens **after** React mount.

### 7. Kill GPU-heavy blurs on mobile
- Added `@media (max-width: 1023px)` rule that disables `backdrop-blur-*`
  and `blur-{xl,2xl,3xl}` (named Tailwind classes).
- **Partial fix.** Helped on some sections but did NOT cover Tailwind
  arbitrary values like `blur-[120px]` used in `GlowEffect`. The class
  selector `.blur-3xl` doesn't match arbitrary-value classes that compile
  to inline `filter: blur(120px)`.

### 8. Hide `GlowEffect` and `AnimatedGridBackground` on mobile
- Added `hidden lg:block` to both decorative components.
- `GlowEffect` was the prime suspect: 1–3 divs sized 420–520 px with
  `blur-[120px]` and a continuous `animate-glow-pulse` (4 s loop).
- `AnimatedGridBackground` uses `mask-image: radial-gradient(...)` which is
  expensive on iOS Safari.
- **Made things WORSE.** User confirmed the page got slower overall when
  these were hidden — possibly because the layout shifted unexpectedly, or
  because removing them was correlated with another bug introduction.
  Reverted at user's request.

---

## Current state (after the reverts)

- All sections eager-imported, no lazy / Play card
- `GlowEffect` and `AnimatedGridBackground` visible on every viewport
  (mobile included)
- CSS rule killing named-class blurs on `<1024 px` is **kept** (was added in
  step 7, never reverted)
- HTML loader pre-React is **kept**
- `staggerItem.hidden = opacity: 1` and the inline section flips are **kept**

So the codebase keeps the cheap, content-visible-by-default fixes, and
discards the more invasive moves that didn't help (or hurt).

---

## Hypotheses still on the table

1. **iOS Safari WebKit-specific rendering quirks** — many of the patterns
   used (multiple absolute positioned overlays, `bg-card/X` semi-transparent
   backgrounds, framer-motion driven props) interact differently with WebKit.
   Cannot be reproduced on Chromium-based DevTools mobile.

2. **GPU memory pressure on real mobile devices** — the page has many
   small composite layers (every `bg-gradient-*`, every transparent
   background, every `shadow-*`, every blur). Together they may exhaust GPU
   memory on lower-end real devices.

3. **iOS Safari compositor scheduling** — when the main thread is busy with
   React commit + framer-motion setup + i18next + Turnstile, iOS Safari may
   defer composition of off-screen layers more aggressively than Chromium.

4. **TLS handshake / HTTP/1.1 fallback on mobile carriers** — the `curl`
   probe from a laptop showed HTTP/1.1. On mobile carriers, TLS handshake
   can take 1–3 s and HTTP/1.1 limits parallel asset fetches to 6.

5. **Hostinger LiteSpeed quirk for mobile UAs** — possible CDN edge routing
   that's slower for mobile carrier IP ranges than for residential ISPs.

---

## What has NOT been tried yet (next ideas to consider)

- **Replace framer-motion** with a lighter library (motion/react,
  @motionone/react, or pure CSS animations everywhere). framer-motion is
  132 KB gzip and adds runtime overhead per motion component.
- **Reduce React component depth.** The sims have very deep trees. Even
  un-lazy, React's commit phase on a deep tree blocks the main thread.
- **Audit DOM node count.** 500+ DOM nodes on first paint will be slow on
  any mobile.
- **Use the Performance API in production.** Wire `PerformanceObserver` and
  log to the backend. Gather actual numbers from real user devices.
- **Test on a clean Vite + a single Hero page.** Strip everything to confirm
  the slowness reproduces even with a minimal component tree. Bisect from
  there.
- **Check if a service worker or aggressive caching is interfering.**
- **Profile with Safari Web Inspector** — connect a real iPhone to a Mac and
  use the actual Safari Web Inspector for a flamechart. This is the only
  reliable way to see what's actually happening on iOS WebKit.

---

## Lessons / things to NOT redo

- Hiding `GlowEffect` and `AnimatedGridBackground` on mobile via
  `hidden lg:block` made things worse, even though the GPU theory was
  reasonable. Don't redo this without first confirming via Safari Web
  Inspector profiling.
- Replacing motion components with plain HTML in Hero "fixed nothing
  visibly" per the user — they preferred to keep the motion entrance
  animations. Don't do this preemptively again.
- Lazy + Suspense + skeleton is fine UX in theory but felt MORE broken
  than eager render to the user. Stay with eager unless we can prove the
  skeleton fix lands cleanly.
