// Generates the OG social-card (1200x630) and PNG favicons from
// public/logocabs.png. Run with `node scripts/generate-og-and-icons.mjs`.
// Outputs:
//   public/og.png                 — 1200x630, used by og:image / twitter:image
//   public/favicon-32.png         — 32x32 fallback for legacy browsers
//   public/apple-touch-icon.png   — 180x180 iOS home-screen icon

import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(__dirname, '..', 'public')
const LOGO = resolve(PUBLIC, 'logocabs.png')

// ── OG card ──────────────────────────────────────────────────────────────
// 1200×630 dark zinc card with amber gradient accents. Mirrors the marketing
// site's aesthetic (zinc-900 + amber-400/yellow-500 brand gradient).

const W = 1200
const H = 630

const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0b0e"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
    <radialGradient id="glow1" cx="0.15" cy="0.2" r="0.6">
      <stop offset="0%" stop-color="#fcd34d" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#fcd34d" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.95" cy="0.95" r="0.5">
      <stop offset="0%" stop-color="#eab308" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#eab308" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fcd34d"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#27272a" stroke-width="0.5" opacity="0.5"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <!-- Brand pill -->
  <g transform="translate(80, 80)">
    <rect width="170" height="44" rx="22" fill="#18181b" stroke="#fcd34d" stroke-opacity="0.35" stroke-width="1.5"/>
    <circle cx="22" cy="22" r="4" fill="#fcd34d">
      <animate attributeName="opacity" values="1;0.4;1" dur="1.6s" repeatCount="indefinite"/>
    </circle>
    <text x="36" y="29" font-family="-apple-system, 'Segoe UI', Inter, sans-serif" font-size="15" font-weight="600" fill="#fcd34d" letter-spacing="0.5">
      Bêta privée
    </text>
  </g>

  <!-- CABS wordmark top-right -->
  <text x="${W - 80}" y="110" text-anchor="end" font-family="-apple-system, 'Segoe UI', Inter, sans-serif" font-size="44" font-weight="900" fill="url(#brand)" letter-spacing="6">
    CABS
  </text>

  <!-- Headline -->
  <text x="80" y="280" font-family="-apple-system, 'Segoe UI', Inter, sans-serif" font-size="68" font-weight="800" fill="#fafafa" letter-spacing="-1.5">
    La plateforme pour
  </text>
  <text x="80" y="358" font-family="-apple-system, 'Segoe UI', Inter, sans-serif" font-size="68" font-weight="800" fill="url(#brand)" letter-spacing="-1.5">
    opérateurs de taxi.
  </text>

  <!-- Subline -->
  <text x="80" y="430" font-family="-apple-system, 'Segoe UI', Inter, sans-serif" font-size="26" font-weight="500" fill="#a1a1aa">
    Uber × Bolt × Heetch consolidés. Brut, net, commissions calculés.
  </text>

  <!-- Footer row -->
  <line x1="80" y1="500" x2="${W - 80}" y2="500" stroke="#27272a" stroke-width="1"/>
  <text x="80" y="555" font-family="-apple-system, 'Segoe UI', Inter, sans-serif" font-size="22" font-weight="600" fill="#fafafa">
    joincabs.com
  </text>
  <text x="${W - 80}" y="555" text-anchor="end" font-family="-apple-system, 'Segoe UI', Inter, sans-serif" font-size="20" font-weight="500" fill="#71717a">
    Belgique · France · Pays-Bas — sortie septembre 2026
  </text>
</svg>`

console.log('[og] rendering 1200x630…')
const ogBuffer = await sharp(Buffer.from(ogSvg))
  .png({ compressionLevel: 9, quality: 90 })
  .toBuffer()

writeFileSync(resolve(PUBLIC, 'og.png'), ogBuffer)
console.log(`[og] wrote public/og.png (${(ogBuffer.length / 1024).toFixed(1)} KB)`)

// ── Favicon 32×32 ────────────────────────────────────────────────────────
console.log('[fav] rendering 32×32 favicon from logocabs.png…')
const fav32 = await sharp(LOGO)
  .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toBuffer()
writeFileSync(resolve(PUBLIC, 'favicon-32.png'), fav32)
console.log(`[fav] wrote public/favicon-32.png (${(fav32.length / 1024).toFixed(1)} KB)`)

// ── Apple touch icon 180×180 ─────────────────────────────────────────────
console.log('[apple] rendering 180×180 apple-touch-icon from logocabs.png…')
const apple = await sharp(LOGO)
  .resize(180, 180, { fit: 'contain', background: { r: 24, g: 24, b: 27, alpha: 1 } })
  .png({ compressionLevel: 9 })
  .toBuffer()
writeFileSync(resolve(PUBLIC, 'apple-touch-icon.png'), apple)
console.log(`[apple] wrote public/apple-touch-icon.png (${(apple.length / 1024).toFixed(1)} KB)`)

console.log('\n✓ done')
