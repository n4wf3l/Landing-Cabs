<?php
// Cabs · POST /api/public/contact
// Mirrors server/index.js POST /api/public/contact.

declare(strict_types=1);
require __DIR__ . '/_lib.php';

cabs_set_cors_and_json();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    cabs_json_response(405, ['error' => 'method_not_allowed']);
}

$data = cabs_json_input();
$name = trim((string)($data['name'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$company = trim((string)($data['company'] ?? ''));
$subject = (string)($data['subject'] ?? '');
$message = trim((string)($data['message'] ?? ''));
$locale = (string)($data['locale'] ?? 'fr');
$turnstileToken = isset($data['turnstileToken']) ? (string)$data['turnstileToken'] : null;

$validSubjects = ['beta', 'demo', 'pricing', 'partnership', 'press', 'other'];

if (mb_strlen($name) < 2 || mb_strlen($name) > 80) {
    cabs_json_response(400, ['error' => 'invalid_name']);
}
if (!cabs_is_email($email)) {
    cabs_json_response(400, ['error' => 'invalid_email']);
}
if (!in_array($subject, $validSubjects, true)) {
    cabs_json_response(400, ['error' => 'invalid_subject']);
}
if (mb_strlen($message) < 10 || mb_strlen($message) > 2000) {
    cabs_json_response(400, ['error' => 'invalid_message']);
}
if ($company !== '' && mb_strlen($company) > 100) {
    cabs_json_response(400, ['error' => 'invalid_company']);
}

if (!cabs_verify_turnstile($turnstileToken)) {
    cabs_json_response(403, ['error' => 'turnstile_failed']);
}

$cfg = cabs_config();
$brandUrl = $cfg['brand_url'] ?? 'https://www.joincabs.com';
$inbound = $cfg['mail_inbound_to'] ?? '';
if ($inbound === '') {
    cabs_json_response(500, ['error' => 'config_missing']);
}

$safeName = cabs_escape_html($name);
$safeEmail = cabs_escape_html($email);
$safeCompany = $company !== ''
    ? cabs_escape_html($company)
    : '<i style="color:#a1a1aa;">non précisé</i>';
$safeSubject = cabs_escape_html($subject);
$safeMessage = nl2br(cabs_escape_html($message));
$safeLocale = cabs_escape_html($locale);

$subjectLine = "[Cabs · $subject] $name" . ($company !== '' ? " · $company" : '');

$html = <<<HTML
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #18181b;">
  <h1 style="font-size: 18px; margin: 0 0 16px;">Nouveau message contact</h1>
  <table style="width:100%; border-collapse: collapse; font-size: 14px;">
    <tr><td style="padding: 6px 0; color:#71717a; width: 120px;">Nom</td><td>$safeName</td></tr>
    <tr><td style="padding: 6px 0; color:#71717a;">Email</td><td><a href="mailto:$safeEmail" style="color:#2563eb;">$safeEmail</a></td></tr>
    <tr><td style="padding: 6px 0; color:#71717a;">Société</td><td>$safeCompany</td></tr>
    <tr><td style="padding: 6px 0; color:#71717a;">Sujet</td><td><strong>$safeSubject</strong></td></tr>
    <tr><td style="padding: 6px 0; color:#71717a;">Locale</td><td>$safeLocale</td></tr>
  </table>
  <hr style="margin: 16px 0; border: 0; border-top: 1px solid #e4e4e7;">
  <p style="font-size: 14px; line-height: 1.6;">$safeMessage</p>
  <p style="margin-top: 32px; font-size: 12px; color: #a1a1aa;">Envoyé via $brandUrl/contact</p>
</div>
HTML;

$text = "Nouveau message contact\n\n"
    . "Nom : $name\n"
    . "Email : $email\n"
    . "Société : " . ($company !== '' ? $company : '(non précisé)') . "\n"
    . "Sujet : $subject\n"
    . "Locale : $locale\n\n"
    . "Message :\n$message\n\n"
    . "--\n"
    . "Envoyé via $brandUrl/contact\n";

$replyTo = cabs_format_addr($name, $email);
$ok = cabs_send_mail($inbound, $subjectLine, $text, $html, $replyTo);

if (!$ok) {
    cabs_json_response(500, ['error' => 'send_failed']);
}

cabs_json_response(200, [
    'ok' => true,
    'receivedAt' => (int) round(microtime(true) * 1000),
]);
