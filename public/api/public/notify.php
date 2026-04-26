<?php
// Cabs · POST /api/public/notify
// Mirrors server/index.js POST /api/public/notify.

declare(strict_types=1);
require __DIR__ . '/_lib.php';

cabs_set_cors_and_json();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    cabs_json_response(405, ['error' => 'method_not_allowed']);
}

$data = cabs_json_input();
$email = trim((string)($data['email'] ?? ''));
$locale = (string)($data['locale'] ?? 'fr');
$turnstileToken = isset($data['turnstileToken']) ? (string)$data['turnstileToken'] : null;

if (!cabs_is_email($email)) {
    cabs_json_response(400, ['error' => 'invalid_email']);
}
if (!cabs_verify_turnstile($turnstileToken)) {
    cabs_json_response(403, ['error' => 'turnstile_failed']);
}

$cfg = cabs_config();
$brandUrl = $cfg['brand_url'] ?? 'https://www.joincabs.com';
$inbound = $cfg['mail_inbound_to'] ?? '';
$sendConfirm = (bool)($cfg['send_notify_confirmation'] ?? true);

if ($inbound === '') {
    cabs_json_response(500, ['error' => 'config_missing']);
}

$safeEmail = cabs_escape_html($email);
$safeLocale = cabs_escape_html($locale);
$dateStr = (new DateTimeImmutable())
    ->setTimezone(new DateTimeZone('Europe/Brussels'))
    ->format('Y-m-d H:i');

$internalSubject = "[Cabs · Waitlist] $email";
$internalHtml = <<<HTML
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #18181b;">
  <h1 style="font-size: 18px; margin: 0 0 16px;">Nouvelle inscription waitlist</h1>
  <table style="width:100%; border-collapse: collapse; font-size: 14px;">
    <tr><td style="padding: 6px 0; color:#71717a; width: 120px;">Email</td><td><a href="mailto:$safeEmail" style="color:#2563eb;">$safeEmail</a></td></tr>
    <tr><td style="padding: 6px 0; color:#71717a;">Locale</td><td>$safeLocale</td></tr>
    <tr><td style="padding: 6px 0; color:#71717a;">Date</td><td>$dateStr</td></tr>
  </table>
  <p style="margin-top: 32px; font-size: 12px; color: #a1a1aa;">Envoyé via $brandUrl</p>
</div>
HTML;

$internalText = "Nouvelle inscription waitlist\n\n"
    . "Email : $email\n"
    . "Locale : $locale\n"
    . "Date : $dateStr\n\n"
    . "--\n"
    . "Envoyé via $brandUrl\n";

cabs_send_mail($inbound, $internalSubject, $internalText, $internalHtml);

if ($sendConfirm) {
    $confirmHtml = <<<HTML
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #18181b;">
  <h1 style="font-size: 22px; margin: 0 0 16px;">Vous êtes sur la liste.</h1>
  <p style="font-size: 15px; line-height: 1.6;">Merci de votre intérêt pour Cabs.</p>
  <p style="font-size: 15px; line-height: 1.6;">Nous vous écrirons un seul email, celui de la sortie publique, prévue pour septembre 2026.</p>
  <p style="font-size: 15px; line-height: 1.6;">Pas de spam, pas de relance, pas de partage à des tiers.</p>
  <hr style="margin: 24px 0; border: 0; border-top: 1px solid #e4e4e7;">
  <p style="font-size: 12px; color: #71717a;">Kristian, Ismael & Nawfel<br><a href="$brandUrl" style="color: #2563eb;">$brandUrl</a></p>
</div>
HTML;
    $confirmText = "Vous êtes sur la liste.\n\n"
        . "Merci de votre intérêt pour Cabs.\n\n"
        . "Nous vous écrirons un seul email, celui de la sortie publique, prévue pour septembre 2026.\n\n"
        . "Pas de spam, pas de relance, pas de partage à des tiers.\n\n"
        . "Kristian, Ismael & Nawfel\n"
        . $brandUrl . "\n";
    cabs_send_mail($email, 'Bienvenue sur la liste Cabs', $confirmText, $confirmHtml);
}

cabs_json_response(200, [
    'ok' => true,
    'receivedAt' => (int) round(microtime(true) * 1000),
]);
