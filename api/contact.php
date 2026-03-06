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

$name = trim((string)($data['name'] ?? ''));
$preferredContactMethod = trim((string)($data['preferredContactMethod'] ?? ''));
$contactCredentials = trim((string)($data['contactCredentials'] ?? ''));
$service = trim((string)($data['service'] ?? ''));
$message = trim((string)($data['message'] ?? ''));

$allowedMethods = ['mail', 'messenger', 'phone'];
$contactMethodLabels = [
    'mail' => 'Хочет обратную связь по электронной почте',
    'messenger' => 'Хочет обратную связь в мессенджерах Telegram/WhatsApp',
    'phone' => 'Хочет обратную связь по телефону',
];

$allowedServices = [
    'llc-ie',
    'ready-company',
    'residence',
    'citizenship',
    'accounting',
    'social-card',
    'bank-card',
    'registration',
    'logistics',
    'other',
];
$serviceLabels = [
    'llc-ie' => 'Открытие ИП или ООО',
    'ready-company' => 'Готовые компании',
    'residence' => 'ВНЖ',
    'citizenship' => 'Гражданство',
    'accounting' => 'Бухгалтерские услуги',
    'social-card' => 'Социальная карта',
    'bank-card' => 'Банковские карты для физ. лиц',
    'registration' => 'Прописка',
    'logistics' => 'Логистика и таможня',
    'other' => 'Другое',
];

$errors = [];

if (mb_strlen($name) < 2 || mb_strlen($name) > 120) {
    $errors['name'] = 'Укажите имя или ник от 2 до 120 символов.';
}
if (!in_array($preferredContactMethod, $allowedMethods, true)) {
    $errors['preferredContactMethod'] = 'Выберите способ связи.';
}
if (mb_strlen($contactCredentials) < 3 || mb_strlen($contactCredentials) > 160) {
    $errors['contactCredentials'] = 'Укажите контакт для связи от 3 до 160 символов.';
}
if (!in_array($service, $allowedServices, true)) {
    $errors['service'] = 'Выберите услугу из списка.';
}
if (mb_strlen($message) > 2000) {
    $errors['message'] = 'Сообщение не должно превышать 2000 символов.';
}

if ($errors) {
    json_response(422, ['error' => 'Validation failed', 'fields' => $errors]);
}

$homeDir = $_SERVER['HOME'] ?? dirname(__DIR__, 3);
$secretPath = rtrim($homeDir, '/\\') . '/.secrets/resend.php';

if (!is_file($secretPath)) {
    json_response(500, ['error' => 'Server config is missing']);
}

$config = require $secretPath;
$apiKey = (string)($config['resend_api_key'] ?? '');
$to = (string)($config['contact_to'] ?? '');
$from = (string)($config['contact_from'] ?? '');
$telegramBotToken = (string)($config['telegram_bot_token'] ?? '');
$telegramChatId = (string)($config['telegram_chat_id'] ?? '');

if ($apiKey === '' || $to === '' || $from === '') {
    json_response(500, ['error' => 'Server config is invalid']);
}

$contactMethodLabel = $contactMethodLabels[$preferredContactMethod] ?? $preferredContactMethod;
$serviceLabel = $serviceLabels[$service] ?? $service;
$submittedAt = (new DateTimeImmutable('now', new DateTimeZone('Asia/Yerevan')))->format('d.m.Y H:i');

$esc = static fn(string $v): string => htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

$safeName = $esc($name);
$safeContactMethod = $esc($contactMethodLabel);
$safeContactCredentials = $esc($contactCredentials);
$safeService = $esc($serviceLabel);
$safeSubmittedAt = $esc($submittedAt);
$safeMessage = $message !== '' ? nl2br($esc($message), false) : 'Клиент не оставил сообщение.';

$plainText = implode(PHP_EOL, [
    'Новая заявка с сайта armbiz.biz',
    '',
    'Клиент: ' . $name,
    'Метод связи: ' . $contactMethodLabel,
    'Контакты: ' . $contactCredentials,
    'Услуга: ' . $serviceLabel,
    'Дата: ' . $submittedAt,
    '',
    'Сообщение:',
    ($message !== '' ? $message : 'Клиент не оставил сообщение.'),
]);

$html = <<<HTML
<!doctype html>
<html lang="ru">
    <body style="margin:0;padding:24px;background-color:#eef4ff;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#eef4ff;">
    <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:600px;background-color:#ffffff;border:1px solid #d7deef;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;background:linear-gradient(135deg,#1a6eff 0%,#60a2ff 100%);">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.3;color:#e7effe;letter-spacing:0.8px;text-transform:uppercase;">Armbiz Consulting</div>
                <h1 style="margin:8px 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:1.25;color:#ffffff;">Новая заявка с сайта</h1>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#dbe8ff;">armbiz.biz</p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 8px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;width:190px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#646d83;vertical-align:top;">Клиент</td>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.4;color:#1e2736;vertical-align:top;">{$safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;width:190px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#646d83;vertical-align:top;">Предпочтительный метод связи</td>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.4;color:#1e2736;vertical-align:top;">{$safeContactMethod}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;width:190px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#646d83;vertical-align:top;">Контакты для связи</td>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.4;color:#1e2736;vertical-align:top;">{$safeContactCredentials}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;width:190px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#646d83;vertical-align:top;">Интересующая услуга</td>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.4;color:#1e2736;vertical-align:top;">{$safeService}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;width:190px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#646d83;vertical-align:top;">Дата и время (Asia/Yerevan)</td>
                    <td style="padding:10px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.4;color:#1e2736;vertical-align:top;">{$safeSubmittedAt}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 20px 28px;">
                <div style="border:1px solid #d7deef;border-radius:12px;background-color:#f7f9ff;padding:16px 18px;">
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#646d83;margin-bottom:8px;">Сообщение клиента</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1e2736;">{$safeMessage}</div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 28px;border-top:1px solid #d7deef;background-color:#f8fbff;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.4;color:#646d83;text-align:center;">
                Это автоматическое письмо с формы заявки  на сайте armbiz.biz
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
HTML;

$payload = [
    'from' => $from,
    'to' => [$to],
    'subject' => 'Новая заявка Armbiz Consulting - ' . $serviceLabel,
    'html' => $html,
    'text' => $plainText,
];

if ($preferredContactMethod === 'mail' && filter_var($contactCredentials, FILTER_VALIDATE_EMAIL)) {
    $payload['reply_to'] = $contactCredentials;
}

$ch = curl_init('https://api.resend.com/emails');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
]);

$responseBody = curl_exec($ch);

if ($responseBody === false) {
    $err = curl_error($ch);
    curl_close($ch);
    json_response(502, ['error' => 'Resend request failed: ' . $err]);
}

$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$decoded = json_decode($responseBody, true);

if ($httpCode < 200 || $httpCode >= 300) {
    $msg = is_array($decoded) && isset($decoded['message']) ? (string) $decoded['message'] : 'Resend error';
    json_response(502, ['error' => $msg]);
}

if ($telegramBotToken !== '' && $telegramChatId !== '') {
    $tgEsc = static fn(string $v): string => htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $telegramMessage = implode("\n", [
        '<b>Новая заявка с сайта</b>',
        '<b>Клиент:</b> ' . $tgEsc($name),
        '<b>Метод связи:</b> ' . $tgEsc($contactMethodLabel),
        '<b>Контакты:</b> ' . $tgEsc($contactCredentials),
        '<b>Услуга:</b> ' . $tgEsc($serviceLabel),
        '<b>Дата:</b> ' . $tgEsc($submittedAt),
        '<b>Сообщение:</b> ' . $tgEsc($message !== '' ? $message : 'Клиент не оставил сообщение.'),
    ]);
    send_telegram_message($telegramBotToken, $telegramChatId, $telegramMessage);
}

json_response(200, ['ok' => true]);
