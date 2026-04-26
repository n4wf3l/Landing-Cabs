// Cabs · build-time generator for dist/api/public/_config.php
//
// The PHP backend (mail()-based, deployed alongside the static SPA) reads
// its config from this file. To keep the Turnstile secret out of git,
// this script writes the file at build time from process env vars.
//
// Local dev:
//   - If TURNSTILE_SECRET_KEY is NOT set in env, this script does nothing.
//     The local public/api/public/_config.php (gitignored) is used as-is
//     (Vite copies it to dist/api/public/_config.php during build).
//
// Hostinger / CI build:
//   - Set TURNSTILE_SECRET_KEY (and any other override) in the build env.
//     This script overwrites dist/api/public/_config.php with those values.
//
// The Site key (public, baked into the JS bundle) lives in VITE_TURNSTILE_SITE_KEY.

const fs = require('node:fs');
const path = require('node:path');

const distConfig = path.resolve(
  __dirname,
  '..',
  'dist',
  'api',
  'public',
  '_config.php',
);

const env = (k) => process.env[k];

if (!env('TURNSTILE_SECRET_KEY')) {
  if (fs.existsSync(distConfig)) {
    console.log(
      '[build] No TURNSTILE_SECRET_KEY in env; keeping existing _config.php from public/',
    );
  } else {
    console.warn(
      '[build] WARNING: TURNSTILE_SECRET_KEY is not set AND public/api/public/_config.php is missing.',
    );
    console.warn(
      '[build]          Deployed forms will return {error: "config_missing"}.',
    );
    console.warn(
      '[build]          Set TURNSTILE_SECRET_KEY in your build environment.',
    );
  }
  process.exit(0);
}

const phpEscape = (s) =>
  String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const phpBool = (b) => (b ? 'true' : 'false');

const cfg = {
  mail_from_address: env('MAIL_FROM_ADDRESS') || 'contact@joincabs.com',
  mail_from_name: env('MAIL_FROM_NAME') || 'Cabs',
  mail_inbound_to: env('MAIL_INBOUND_TO') || 'contact@joincabs.com',
  turnstile_secret_key: env('TURNSTILE_SECRET_KEY'),
  brand_url: env('BRAND_URL') || 'https://www.joincabs.com',
  send_notify_confirmation: env('SEND_NOTIFY_CONFIRMATION') !== 'false',
};

const content = `<?php
// AUTO-GENERATED at build time by scripts/write-php-config.cjs from env vars.
// DO NOT EDIT — re-run \`npm run build\` to regenerate.

return [
    'mail_from_address' => '${phpEscape(cfg.mail_from_address)}',
    'mail_from_name' => '${phpEscape(cfg.mail_from_name)}',
    'mail_inbound_to' => '${phpEscape(cfg.mail_inbound_to)}',
    'turnstile_secret_key' => '${phpEscape(cfg.turnstile_secret_key)}',
    'brand_url' => '${phpEscape(cfg.brand_url)}',
    'send_notify_confirmation' => ${phpBool(cfg.send_notify_confirmation)},
];
`;

fs.mkdirSync(path.dirname(distConfig), { recursive: true });
fs.writeFileSync(distConfig, content, 'utf8');
console.log('[build] Wrote', distConfig, 'from build env vars.');
