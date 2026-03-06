<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function json_response(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function send_telegram_message(string $botToken, string $chatId, string $text): bool {
    if ($botToken === '' || $chatId === '' || $text === '') {
        return false;
    }

    $url = 'https://api.telegram.org/bot' . $botToken . '/sendMessage';

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_POSTFIELDS => http_build_query([
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'HTML',
            'disable_web_page_preview' => true,
        ]),
    ]);

    $responseBody = curl_exec($ch);
    if ($responseBody === false) {
        curl_close($ch);
        return false;
    }

    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return $httpCode >= 200 && $httpCode < 300;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_response(405, ['error' => 'Method not allowed']);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);

if (!is_array($data)) {
    json_response(400, ['error' => 'Invalid JSON']);
}

$eventType = trim((string)($data['eventType'] ?? ''));
$href = trim((string)($data['href'] ?? ''));
$pageTitle = trim((string)($data['pageTitle'] ?? ''));
$pageUrl = trim((string)($data['pageUrl'] ?? ''));
$pagePath = trim((string)($data['pagePath'] ?? ''));
$viewportWidth = trim((string)($data['viewportWidth'] ?? ''));
$browserLanguage = trim((string)($data['browserLanguage'] ?? ''));
$userAgent = trim((string)($data['userAgent'] ?? ''));
$utmTerm = trim((string)($data['utmTerm'] ?? ''));
$utmSource = trim((string)($data['utmSource'] ?? ''));
$utmMedium = trim((string)($data['utmMedium'] ?? ''));
$utmCampaign = trim((string)($data['utmCampaign'] ?? ''));
$utmContent = trim((string)($data['utmContent'] ?? ''));
$at = trim((string)($data['at'] ?? ''));

$allowedTypes = ['phone', 'email', 'messenger', 'telegram', 'whatsapp', 'map', 'instagram'];
if (!in_array($eventType, $allowedTypes, true) || $href === '') {
    json_response(422, ['error' => 'Validation failed']);
}

$eventLabels = [
    'phone' => 'Клик по номеру телефона на сайте Armbiz Consulting',
    'email' => 'Клик по почте на сайте Armbiz Consulting',
    'messenger' => 'Переход в мессенджер на сайте Armbiz Consulting',
    'telegram' => 'Клик по Telegram на сайте Armbiz Consulting',
    'whatsapp' => 'Клик по WhatsApp на сайте Armbiz Consulting',
    'map' => 'Клик по адресу или картам на сайте Armbiz Consulting',
    'instagram' => 'Клик по Instagram на сайте Armbiz Consulting',
];

$homeDir = $_SERVER['HOME'] ?? dirname(__DIR__, 3);
$secretPath = rtrim($homeDir, '/\\') . '/.secrets/resend.php';

if (!is_file($secretPath)) {
    json_response(500, ['error' => 'Server config is missing']);
}

$config = require $secretPath;
$telegramBotToken = (string)($config['telegram_bot_token'] ?? '');
$telegramChatId = (string)($config['telegram_chat_id'] ?? '');

if ($telegramBotToken === '' || $telegramChatId === '') {
    json_response(200, ['ok' => true, 'skipped' => true]);
}

$clientIp =
    (string)($_SERVER['HTTP_CF_CONNECTING_IP'] ?? '') ?:
    (string)($_SERVER['HTTP_X_FORWARDED_FOR'] ?? '') ?:
    (string)($_SERVER['REMOTE_ADDR'] ?? '-');

$eventDate = '-';
$eventTime = '-';
if ($at !== '') {
    try {
        $eventDateTime = new DateTimeImmutable($at);
        $eventDate = $eventDateTime->format('d.m.Y');
        $eventTime = $eventDateTime->format('H:i:s');
    } catch (Throwable $e) {
        $eventDate = '-';
        $eventTime = '-';
    }
}

$siteTitleSuffix = ' | Armbiz Consulting';
$normalizedPageTitle = $pageTitle;
if (
    $normalizedPageTitle !== '' &&
    strlen($normalizedPageTitle) > strlen($siteTitleSuffix) &&
    substr($normalizedPageTitle, -strlen($siteTitleSuffix)) === $siteTitleSuffix
) {
    $normalizedPageTitle = rtrim(substr($normalizedPageTitle, 0, -strlen($siteTitleSuffix)));
}
$pageName = $normalizedPageTitle !== '' ? $normalizedPageTitle : ($pagePath !== '' ? $pagePath : $pageUrl);
$screenWidthLabel = $viewportWidth !== '' ? $viewportWidth . 'px' : 'Нет данных';
$browserLanguageLabel = $browserLanguage !== '' ? strtoupper($browserLanguage) : 'Нет данных';
$userAgentLabel = $userAgent !== '' ? $userAgent : 'Нет данных';
$utmFallback = 'Нет данных о метке';

$tgEsc = static fn(string $v): string => htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$telegramMessage = implode("\n", [
    '&#128276; <b>' . $tgEsc($eventLabels[$eventType] ?? $eventType) . '</b>',
    '',
    '&#128197; <b>Дата:</b> ' . $tgEsc($eventDate),
    '&#128339; <b>Время:</b> ' . $tgEsc($eventTime),
    '&#128196; <b>Страница:</b> ' . $tgEsc($pageName),
    '&#128241; <b>Ширина экрана:</b> ' . $tgEsc($screenWidthLabel),
    '&#127760; <b>Язык браузера:</b> ' . $tgEsc($browserLanguageLabel),
    '&#129504; <b>Браузер:</b>',
    '<code>' . $tgEsc($userAgentLabel) . '</code>',
    '&#128279; <b>Ссылка:</b> ',
    '<code>' . $tgEsc($href) . '</code>',
    '',
    '&#128279; <b>UTM Source:</b> ' . $tgEsc($utmSource !== '' ? $utmSource : $utmFallback),
    '&#128279; <b>UTM Medium:</b> ' . $tgEsc($utmMedium !== '' ? $utmMedium : $utmFallback),
    '&#128279; <b>UTM Campaign:</b> ' . $tgEsc($utmCampaign !== '' ? $utmCampaign : $utmFallback),
    '&#128279; <b>UTM Content:</b> ' . $tgEsc($utmContent !== '' ? $utmContent : $utmFallback),
    '&#128279; <b>UTM Term:</b> ' . $tgEsc($utmTerm !== '' ? $utmTerm : $utmFallback),
    '',
    '&#127760; <b>IP:</b> ' . $tgEsc($clientIp !== '' ? $clientIp : 'Нет данных'),
]);

$sent = send_telegram_message($telegramBotToken, $telegramChatId, $telegramMessage);
json_response(200, ['ok' => true, 'telegramSent' => $sent]);
