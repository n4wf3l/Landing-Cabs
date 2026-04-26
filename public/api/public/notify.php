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
    $strings = [
        'fr' => [
            'subject' => 'Bienvenue sur la liste Cabs',
            'preheader' => 'Une seule chose à savoir : on vous écrit le jour de la sortie.',
            'headline' => 'Vous êtes sur la liste.',
            'thanks' => 'Merci de votre intérêt pour Cabs.',
            'body' => "Nous vous écrirons un seul email, celui de la sortie publique. D'ici là, on bosse en silence avec quelques opérateurs en bêta privée.",
            'launchLabel' => 'Sortie publique',
            'launchDate' => 'Septembre 2026',
            'b1' => 'Un seul email',
            'b1d' => 'Le jour de la sortie, rien d\'autre.',
            'b2' => 'Pas de spam',
            'b2d' => 'Aucune relance, jamais.',
            'b3' => 'Pas de partage',
            'b3d' => 'Vos données restent chez nous.',
            'signature' => 'Kristian, Ismael & Nawfel',
            'role' => 'Cofondateurs · Cabs',
            'visitCta' => 'Visiter joincabs.com',
            'footer' => 'Cabs · Belgique · France · Pays-Bas',
            'unsub' => "Si vous n'attendez pas le lancement de Cabs, ignorez simplement cet email — vous ne recevrez plus rien de nous.",
        ],
        'en' => [
            'subject' => 'Welcome to the Cabs list',
            'preheader' => 'One thing to know: we email you on launch day.',
            'headline' => "You're on the list.",
            'thanks' => 'Thanks for your interest in Cabs.',
            'body' => "We'll send you a single email, the one announcing the public launch. Until then, we're heads down with a handful of private-beta operators.",
            'launchLabel' => 'Public launch',
            'launchDate' => 'September 2026',
            'b1' => 'One email',
            'b1d' => 'Launch day, that\'s it.',
            'b2' => 'No spam',
            'b2d' => 'Never, ever.',
            'b3' => 'No sharing',
            'b3d' => 'Your data stays with us.',
            'signature' => 'Kristian, Ismael & Nawfel',
            'role' => 'Co-founders · Cabs',
            'visitCta' => 'Visit joincabs.com',
            'footer' => 'Cabs · Belgium · France · Netherlands',
            'unsub' => "If you're not waiting for the Cabs launch, just ignore this email — you won't hear from us again.",
        ],
        'nl' => [
            'subject' => 'Welkom op de Cabs-lijst',
            'preheader' => 'Eén ding om te weten: we mailen je op de lanceringsdag.',
            'headline' => 'Je staat op de lijst.',
            'thanks' => 'Bedankt voor je interesse in Cabs.',
            'body' => 'We sturen je één e-mail, die van de publieke lancering. Tot dan werken we in stilte met een handvol operatoren in besloten bèta.',
            'launchLabel' => 'Publieke lancering',
            'launchDate' => 'September 2026',
            'b1' => 'Eén e-mail',
            'b1d' => 'Lanceringsdag, niets anders.',
            'b2' => 'Geen spam',
            'b2d' => 'Nooit, op geen enkel moment.',
            'b3' => 'Geen delen',
            'b3d' => 'Jouw gegevens blijven bij ons.',
            'signature' => 'Kristian, Ismael & Nawfel',
            'role' => 'Medeoprichters · Cabs',
            'visitCta' => 'Bezoek joincabs.com',
            'footer' => 'Cabs · België · Frankrijk · Nederland',
            'unsub' => 'Wacht je niet op de Cabs-lancering? Negeer deze e-mail gewoon, je hoort niets meer van ons.',
        ],
        'de' => [
            'subject' => 'Willkommen auf der Cabs-Liste',
            'preheader' => 'Nur eines wissen: Wir schreiben am Launch-Tag.',
            'headline' => 'Sie stehen auf der Liste.',
            'thanks' => 'Danke für Ihr Interesse an Cabs.',
            'body' => 'Wir senden Ihnen eine einzige E-Mail, die zum öffentlichen Launch. Bis dahin arbeiten wir in aller Ruhe mit einer Handvoll Betreibern in der privaten Beta.',
            'launchLabel' => 'Öffentlicher Launch',
            'launchDate' => 'September 2026',
            'b1' => 'Eine E-Mail',
            'b1d' => 'Am Launch-Tag, sonst nichts.',
            'b2' => 'Kein Spam',
            'b2d' => 'Niemals.',
            'b3' => 'Kein Teilen',
            'b3d' => 'Ihre Daten bleiben bei uns.',
            'signature' => 'Kristian, Ismael & Nawfel',
            'role' => 'Mitgründer · Cabs',
            'visitCta' => 'joincabs.com besuchen',
            'footer' => 'Cabs · Belgien · Frankreich · Niederlande',
            'unsub' => 'Wenn Sie nicht auf den Cabs-Launch warten, ignorieren Sie diese E-Mail einfach — Sie hören nichts mehr von uns.',
        ],
    ];

    $lang = isset($strings[$locale]) ? $locale : 'fr';
    $s = $strings[$lang];

    $safeHeadline = cabs_escape_html($s['headline']);
    $safeThanks = cabs_escape_html($s['thanks']);
    $safeBody = cabs_escape_html($s['body']);
    $safeLaunchLabel = cabs_escape_html($s['launchLabel']);
    $safeLaunchDate = cabs_escape_html($s['launchDate']);
    $safeB1 = cabs_escape_html($s['b1']);
    $safeB1d = cabs_escape_html($s['b1d']);
    $safeB2 = cabs_escape_html($s['b2']);
    $safeB2d = cabs_escape_html($s['b2d']);
    $safeB3 = cabs_escape_html($s['b3']);
    $safeB3d = cabs_escape_html($s['b3d']);
    $safeSignature = cabs_escape_html($s['signature']);
    $safeRole = cabs_escape_html($s['role']);
    $safeVisitCta = cabs_escape_html($s['visitCta']);
    $safeFooter = cabs_escape_html($s['footer']);
    $safePreheader = cabs_escape_html($s['preheader']);
    $safeUnsub = cabs_escape_html($s['unsub']);

    $confirmHtml = <<<HTML
<!DOCTYPE html>
<html lang="$lang">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>$safeHeadline</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#18181b;">
<!-- Inbox preview text (hidden) -->
<div style="display:none; font-size:1px; color:#f4f4f5; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">$safePreheader</div>

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px; width:100%; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06);">

        <!-- Brand bar -->
        <tr>
          <td style="background:linear-gradient(135deg,#fcd34d 0%,#eab308 100%); padding:22px 32px;">
            <div style="font-size:22px; font-weight:800; letter-spacing:-0.5px; color:#18181b; line-height:1;">Cabs</div>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="padding:44px 32px 8px; text-align:center;">
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 22px;">
              <tr>
                <td width="68" height="68" align="center" valign="middle" style="background-color:#fef3c7; border-radius:34px;">
                  <span style="font-size:32px; font-weight:800; color:#b45309; line-height:1; vertical-align:middle;">&#10003;</span>
                </td>
              </tr>
            </table>
            <h1 style="margin:0; font-size:28px; font-weight:800; letter-spacing:-0.5px; color:#18181b; line-height:1.2;">$safeHeadline</h1>
            <p style="margin:12px 0 0; font-size:15px; line-height:1.6; color:#52525b;">$safeThanks</p>
          </td>
        </tr>

        <!-- Body copy -->
        <tr>
          <td style="padding:24px 32px 8px;">
            <p style="margin:0; font-size:15px; line-height:1.65; color:#3f3f46;">$safeBody</p>
          </td>
        </tr>

        <!-- Launch date callout -->
        <tr>
          <td style="padding:24px 32px 8px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fffbeb; border-radius:12px; border:1px solid #fde68a;">
              <tr>
                <td style="padding:16px 20px;">
                  <div style="font-size:11px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#92400e;">$safeLaunchLabel</div>
                  <div style="margin-top:4px; font-size:18px; font-weight:700; color:#18181b;">$safeLaunchDate</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Promise rows -->
        <tr>
          <td style="padding:24px 32px 8px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
              <tr>
                <td style="padding:14px 0; border-top:1px solid #e4e4e7;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="font-size:14px; font-weight:600; color:#18181b;">$safeB1</td>
                      <td style="font-size:13px; color:#71717a; text-align:right;">$safeB1d</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 0; border-top:1px solid #e4e4e7;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="font-size:14px; font-weight:600; color:#18181b;">$safeB2</td>
                      <td style="font-size:13px; color:#71717a; text-align:right;">$safeB2d</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 0; border-top:1px solid #e4e4e7; border-bottom:1px solid #e4e4e7;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="font-size:14px; font-weight:600; color:#18181b;">$safeB3</td>
                      <td style="font-size:13px; color:#71717a; text-align:right;">$safeB3d</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA button -->
        <tr>
          <td style="padding:32px 32px 16px; text-align:center;">
            <a href="$brandUrl" style="display:inline-block; padding:14px 28px; background-color:#18181b; color:#fafafa; text-decoration:none; font-size:14px; font-weight:600; letter-spacing:0.2px; border-radius:999px;">$safeVisitCta &rarr;</a>
          </td>
        </tr>

        <!-- Signature -->
        <tr>
          <td style="padding:8px 32px 32px; text-align:center;">
            <p style="margin:0; font-size:14px; font-weight:600; color:#18181b;">$safeSignature</p>
            <p style="margin:2px 0 0; font-size:12px; color:#a1a1aa;">$safeRole</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px; background-color:#fafafa; text-align:center; border-top:1px solid #e4e4e7;">
            <p style="margin:0 0 8px; font-size:11px; color:#71717a;">$safeFooter</p>
            <p style="margin:0; font-size:11px; color:#a1a1aa; line-height:1.5;">$safeUnsub</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
HTML;

    $confirmText = $s['headline'] . "\n\n"
        . $s['thanks'] . "\n\n"
        . $s['body'] . "\n\n"
        . "— " . $s['launchLabel'] . ': ' . $s['launchDate'] . "\n"
        . "— " . $s['b1'] . ' : ' . $s['b1d'] . "\n"
        . "— " . $s['b2'] . ' : ' . $s['b2d'] . "\n"
        . "— " . $s['b3'] . ' : ' . $s['b3d'] . "\n\n"
        . $s['signature'] . "\n"
        . $s['role'] . "\n"
        . $brandUrl . "\n\n"
        . "--\n"
        . $s['footer'] . "\n"
        . $s['unsub'] . "\n";

    cabs_send_mail($email, $s['subject'], $confirmText, $confirmHtml);
}

cabs_json_response(200, [
    'ok' => true,
    'receivedAt' => (int) round(microtime(true) * 1000),
]);
