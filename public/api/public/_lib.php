<?php
// Cabs · shared backend helpers (PHP, native — no Composer required)
// Runs on Hostinger Web Hosting via Apache. Mirrors the Node version
// in server/index.js. The two implementations should stay functionally
// equivalent (same JSON contract, same status codes, same validation).

declare(strict_types=1);

/**
 * Loads the local _config.php file (gitignored, contains secrets).
 * Returns a sane fallback if missing — production deploys MUST have it.
 */
function cabs_config(): array
{
    static $cfg = null;
    if ($cfg !== null) return $cfg;
    $path = __DIR__ . '/_config.php';
    if (!is_file($path)) {
        return [
            'mail_from_address' => '',
            'mail_from_name' => 'Cabs',
            'mail_inbound_to' => '',
            'turnstile_secret_key' => '',
            'brand_url' => 'https://www.joincabs.com',
            'send_notify_confirmation' => true,
        ];
    }
    $cfg = require $path;
    return $cfg;
}

/**
 * Sets CORS headers + JSON content-type. Handles OPTIONS preflight.
 * Same allowed origins as the Node server's ALLOWED_ORIGIN default.
 */
function cabs_set_cors_and_json(): void
{
    $allowed = [
        'https://www.joincabs.com',
        'https://joincabs.com',
        'http://localhost:5173',
        'http://localhost:4173',
    ];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowed, true)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');
    header('Content-Type: application/json; charset=utf-8');
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function cabs_json_input(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function cabs_json_response(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function cabs_is_email(string $v): bool
{
    return (bool) filter_var($v, FILTER_VALIDATE_EMAIL);
}

function cabs_escape_html(string $v): string
{
    return htmlspecialchars($v, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/**
 * Verifies a Cloudflare Turnstile token against the siteverify endpoint.
 * Returns true if valid. If TURNSTILE_SECRET_KEY is empty, verification
 * is skipped (dev convenience) — production MUST have it set.
 */
function cabs_verify_turnstile(?string $token): bool
{
    $cfg = cabs_config();
    $secret = $cfg['turnstile_secret_key'] ?? '';
    if ($secret === '') return true;
    if (!$token || !is_string($token)) return false;

    $ip = $_SERVER['HTTP_CF_CONNECTING_IP']
        ?? $_SERVER['HTTP_X_FORWARDED_FOR']
        ?? $_SERVER['REMOTE_ADDR']
        ?? '';

    $payload = http_build_query([
        'secret' => $secret,
        'response' => $token,
        'remoteip' => $ip,
    ]);

    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => $payload,
            'timeout' => 8,
            'ignore_errors' => true,
        ],
    ]);
    $res = @file_get_contents(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        false,
        $ctx,
    );
    if ($res === false) return false;
    $data = json_decode($res, true);
    return is_array($data) && (($data['success'] ?? false) === true);
}

/**
 * Sends a multipart (text + html) email via PHP's mail().
 * On Hostinger, mail() is wired to the local MTA which authenticates
 * outbound on behalf of the joincabs.com domain (SPF/DKIM aligned).
 */
function cabs_send_mail(
    string $to,
    string $subject,
    string $textBody,
    string $htmlBody,
    ?string $replyTo = null
): bool {
    $cfg = cabs_config();
    $fromAddr = $cfg['mail_from_address'] ?? '';
    $fromName = $cfg['mail_from_name'] ?? 'Cabs';

    if ($fromAddr === '') {
        error_log('[cabs_send_mail] mail_from_address is empty');
        return false;
    }

    $boundary = '=_cabs_' . bin2hex(random_bytes(8));
    $headers = [
        'From: ' . cabs_format_addr($fromName, $fromAddr),
    ];
    if ($replyTo) {
        $headers[] = 'Reply-To: ' . $replyTo;
    }
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = "Content-Type: multipart/alternative; boundary=\"$boundary\"";
    $headers[] = 'X-Mailer: Cabs/1.0';

    $body = '';
    $body .= "--$boundary\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $textBody . "\r\n\r\n";
    $body .= "--$boundary\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $htmlBody . "\r\n\r\n";
    $body .= "--$boundary--\r\n";

    return @mail(
        $to,
        cabs_encode_header_value($subject),
        $body,
        implode("\r\n", $headers),
    );
}

function cabs_format_addr(string $name, string $email): string
{
    return cabs_encode_header_value($name) . " <$email>";
}

function cabs_encode_header_value(string $v): string
{
    if (preg_match('/[^\x20-\x7E]/', $v)) {
        return '=?UTF-8?B?' . base64_encode($v) . '?=';
    }
    return $v;
}
