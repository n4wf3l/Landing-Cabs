<?php
// Cabs · backend config TEMPLATE
// Copy this file to `_config.php` (gitignored) and fill in real values.
// The `_config.php` file gets uploaded with your build to
// public_html/api/public/_config.php on Hostinger.

return [
    // Sender of all outbound emails. MUST be an address on a domain
    // hosted by Hostinger (so SPF/DKIM align). Hostinger's local MTA
    // delivers via this identity.
    'mail_from_address' => 'contact@joincabs.com',
    'mail_from_name' => 'Cabs',

    // Where contact + waitlist notifications arrive (your inbox).
    'mail_inbound_to' => 'contact@joincabs.com',

    // Cloudflare Turnstile SECRET key.
    // Get it from: dash.cloudflare.com -> Turnstile -> joincabs.com -> Settings
    'turnstile_secret_key' => 'REPLACE_WITH_YOUR_TURNSTILE_SECRET_KEY',

    'brand_url' => 'https://www.joincabs.com',

    // Send a confirmation email to the waitlist subscriber. false to skip.
    'send_notify_confirmation' => true,
];
