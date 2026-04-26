// Cabs · Backend bridge
// Receives form submissions from the Vite frontend and sends email
// via SMTP. Credentials live ONLY in this server's environment.
// Never bundle this code or its env in the client.

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'

const app = express()
const PORT = Number(process.env.PORT ?? 8080)
const NODE_ENV = process.env.NODE_ENV ?? 'development'

// Behind a reverse proxy in production (Cloudflare, nginx, Vercel, Railway,
// Render, Fly, etc.) we need this so req.ip reads X-Forwarded-For correctly.
// Required for accurate per-IP rate limiting.
app.set('trust proxy', 1)

// Multi-origin CORS. Set ALLOWED_ORIGIN to a comma-separated list:
//   ALLOWED_ORIGIN=http://localhost:5173,https://www.joincabs.com,https://joincabs.com
const DEFAULT_ORIGINS =
  NODE_ENV === 'production'
    ? 'https://www.joincabs.com,https://joincabs.com'
    : 'http://localhost:5173,http://localhost:4173'

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN ?? DEFAULT_ORIGINS)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(express.json({ limit: '32kb' }))
app.use(
  cors({
    origin: (origin, cb) => {
      // Same-origin requests have no Origin header — allow them.
      if (!origin) return cb(null, true)
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
      return cb(new Error(`Origin ${origin} not allowed`))
    },
    methods: ['POST', 'GET'],
    credentials: false,
    maxAge: 86400,
  }),
)

// ---------- SMTP transporter ----------

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT ?? 587),
  secure: false, // STARTTLS upgrades the connection on port 587
  requireTLS: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
})

const FROM = `"${process.env.MAIL_FROM_NAME ?? 'Cabs'}" <${process.env.MAIL_FROM_ADDRESS}>`
const INBOUND_TO = process.env.MAIL_INBOUND_TO ?? process.env.MAIL_FROM_ADDRESS
const BRAND_URL = process.env.BRAND_URL ?? 'https://www.joincabs.com'

// ---------- Validation helpers ----------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SUBJECTS = new Set([
  'beta',
  'demo',
  'pricing',
  'partnership',
  'press',
  'other',
])

function isString(v, min = 0, max = Infinity) {
  return typeof v === 'string' && v.length >= min && v.length <= max
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ---------- Cloudflare Turnstile verification ----------

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY ?? ''
const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Verifies a Turnstile token against Cloudflare's siteverify endpoint.
 * Returns true if the token is valid, false otherwise.
 *
 * If TURNSTILE_SECRET_KEY is not set, verification is skipped (returns
 * true). This is a dev convenience — production deployments should
 * always set the secret.
 */
async function verifyTurnstile(token, ip) {
  if (!TURNSTILE_SECRET) {
    if (NODE_ENV === 'production') {
      console.warn(
        '[turnstile] TURNSTILE_SECRET_KEY is not set in production!',
      )
    }
    return true
  }
  if (!token || typeof token !== 'string') return false

  const params = new URLSearchParams()
  params.append('secret', TURNSTILE_SECRET)
  params.append('response', token)
  if (ip) params.append('remoteip', ip)

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: params,
    })
    const data = await res.json()
    if (!data.success) {
      console.warn('[turnstile] verification failed:', data['error-codes'])
    }
    return data.success === true
  } catch (err) {
    console.error('[turnstile] verify call failed:', err)
    return false
  }
}

// ---------- Naive in-memory rate limit (~10 req / 5 min / IP) ----------

const buckets = new Map()
function rateLimit(ip, max = 10, windowMs = 5 * 60 * 1000) {
  const now = Date.now()
  const bucket = buckets.get(ip) ?? { count: 0, resetAt: now + windowMs }
  if (now > bucket.resetAt) {
    bucket.count = 0
    bucket.resetAt = now + windowMs
  }
  bucket.count += 1
  buckets.set(ip, bucket)
  return bucket.count <= max
}

// ---------- Routes ----------

app.get('/api/public/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() })
})

app.post('/api/public/contact', async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown'
    if (!rateLimit(String(ip))) {
      return res.status(429).json({ error: 'rate_limited' })
    }

    const { name, email, company, subject, message, locale, turnstileToken } =
      req.body ?? {}

    const turnstileOk = await verifyTurnstile(turnstileToken, String(ip))
    if (!turnstileOk) {
      return res.status(403).json({ error: 'turnstile_failed' })
    }

    if (!isString(name, 2, 80)) {
      return res.status(400).json({ error: 'invalid_name' })
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'invalid_email' })
    }
    if (typeof subject !== 'string' || !SUBJECTS.has(subject)) {
      return res.status(400).json({ error: 'invalid_subject' })
    }
    if (!isString(message, 10, 2000)) {
      return res.status(400).json({ error: 'invalid_message' })
    }
    if (company !== undefined && !isString(company, 0, 100)) {
      return res.status(400).json({ error: 'invalid_company' })
    }

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeCompany = escapeHtml(company ?? '')
    const safeSubject = escapeHtml(subject)
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>')
    const safeLocale = escapeHtml(locale ?? 'fr')

    const subjectLine = `[Cabs · ${subject}] ${name}${company ? ' · ' + company : ''}`

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #18181b;">
        <h1 style="font-size: 18px; margin: 0 0 16px;">Nouveau message contact</h1>
        <table style="width:100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color:#71717a; width: 120px;">Nom</td><td>${safeName}</td></tr>
          <tr><td style="padding: 6px 0; color:#71717a;">Email</td><td><a href="mailto:${safeEmail}" style="color:#2563eb;">${safeEmail}</a></td></tr>
          <tr><td style="padding: 6px 0; color:#71717a;">Société</td><td>${safeCompany || '<i style="color:#a1a1aa;">non précisé</i>'}</td></tr>
          <tr><td style="padding: 6px 0; color:#71717a;">Sujet</td><td><strong>${safeSubject}</strong></td></tr>
          <tr><td style="padding: 6px 0; color:#71717a;">Locale</td><td>${safeLocale}</td></tr>
        </table>
        <hr style="margin: 16px 0; border: 0; border-top: 1px solid #e4e4e7;">
        <p style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
        <p style="margin-top: 32px; font-size: 12px; color: #a1a1aa;">Envoyé via ${BRAND_URL}/contact</p>
      </div>
    `

    const text = [
      `Nouveau message contact`,
      ``,
      `Nom : ${name}`,
      `Email : ${email}`,
      `Société : ${company || '(non précisé)'}`,
      `Sujet : ${subject}`,
      `Locale : ${locale ?? 'fr'}`,
      ``,
      `Message :`,
      message,
      ``,
      `--`,
      `Envoyé via ${BRAND_URL}/contact`,
    ].join('\n')

    await transporter.sendMail({
      from: FROM,
      to: INBOUND_TO,
      replyTo: `"${name}" <${email}>`,
      subject: subjectLine,
      text,
      html,
    })

    res.json({ ok: true, receivedAt: Date.now() })
  } catch (err) {
    console.error('[contact] send failed:', err)
    res.status(500).json({ error: 'send_failed' })
  }
})

app.post('/api/public/notify', async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown'
    if (!rateLimit(String(ip))) {
      return res.status(429).json({ error: 'rate_limited' })
    }

    const { email, locale, turnstileToken } = req.body ?? {}

    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'invalid_email' })
    }

    const turnstileOk = await verifyTurnstile(turnstileToken, String(ip))
    if (!turnstileOk) {
      return res.status(403).json({ error: 'turnstile_failed' })
    }

    const safeEmail = escapeHtml(email)
    const safeLocale = escapeHtml(locale ?? 'fr')

    // Internal notification
    const internalSubject = `[Cabs · Waitlist] ${email}`
    const internalHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #18181b;">
        <h1 style="font-size: 18px; margin: 0 0 16px;">Nouvelle inscription waitlist</h1>
        <table style="width:100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color:#71717a; width: 120px;">Email</td><td><a href="mailto:${safeEmail}" style="color:#2563eb;">${safeEmail}</a></td></tr>
          <tr><td style="padding: 6px 0; color:#71717a;">Locale</td><td>${safeLocale}</td></tr>
          <tr><td style="padding: 6px 0; color:#71717a;">Date</td><td>${new Date().toLocaleString('fr-BE')}</td></tr>
        </table>
        <p style="margin-top: 32px; font-size: 12px; color: #a1a1aa;">Envoyé via ${BRAND_URL}</p>
      </div>
    `
    const internalText = [
      `Nouvelle inscription waitlist`,
      ``,
      `Email : ${email}`,
      `Locale : ${locale ?? 'fr'}`,
      `Date : ${new Date().toLocaleString('fr-BE')}`,
      ``,
      `--`,
      `Envoyé via ${BRAND_URL}`,
    ].join('\n')

    await transporter.sendMail({
      from: FROM,
      to: INBOUND_TO,
      subject: internalSubject,
      text: internalText,
      html: internalHtml,
    })

    // Optional confirmation to subscriber
    if (process.env.SEND_NOTIFY_CONFIRMATION !== 'false') {
      const confirmHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #18181b;">
          <h1 style="font-size: 22px; margin: 0 0 16px;">Vous êtes sur la liste.</h1>
          <p style="font-size: 15px; line-height: 1.6;">Merci de votre intérêt pour Cabs.</p>
          <p style="font-size: 15px; line-height: 1.6;">Nous vous écrirons un seul email — celui de la sortie publique, prévue pour septembre 2026.</p>
          <p style="font-size: 15px; line-height: 1.6;">Pas de spam, pas de relance, pas de partage à des tiers.</p>
          <hr style="margin: 24px 0; border: 0; border-top: 1px solid #e4e4e7;">
          <p style="font-size: 12px; color: #71717a;">— Kristian, Ismael & Nawfel<br><a href="${BRAND_URL}" style="color: #2563eb;">${BRAND_URL}</a></p>
        </div>
      `
      const confirmText = [
        `Vous êtes sur la liste.`,
        ``,
        `Merci de votre intérêt pour Cabs.`,
        ``,
        `Nous vous écrirons un seul email — celui de la sortie publique, prévue pour septembre 2026.`,
        ``,
        `Pas de spam, pas de relance, pas de partage à des tiers.`,
        ``,
        `— Kristian, Ismael & Nawfel`,
        BRAND_URL,
      ].join('\n')

      await transporter.sendMail({
        from: FROM,
        to: email,
        subject: 'Bienvenue sur la liste Cabs',
        text: confirmText,
        html: confirmHtml,
      })
    }

    res.json({ ok: true, receivedAt: Date.now() })
  } catch (err) {
    console.error('[notify] send failed:', err)
    res.status(500).json({ error: 'send_failed' })
  }
})

// ---------- Boot ----------

transporter
  .verify()
  .then(() => {
    console.log(
      `[smtp] connected to ${process.env.MAIL_HOST}:${process.env.MAIL_PORT}`,
    )
  })
  .catch((err) => {
    console.warn('[smtp] verify failed:', err.message)
    console.warn(
      '[smtp] server will still start; emails will fail until SMTP works',
    )
  })

app.listen(PORT, () => {
  console.log(`[server] env: ${NODE_ENV}`)
  console.log(`[server] listening on port ${PORT}`)
  console.log(`[server] CORS allow: ${ALLOWED_ORIGINS.join(', ')}`)
})
