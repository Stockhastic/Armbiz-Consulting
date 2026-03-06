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

$allowedMethods = ['mail', 'messenger', 'phone'];
$contactMethodLabels = [
    'mail' => 'По электронной почте',
    'messenger' => 'Telegram/WhatsApp',
    'phone' => 'По телефону',
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
    'llc-ie' => 'Регистрация ИП и ООО',
    'ready-company' => 'Готовые компании',
    'residence' => 'ВНЖ',
    'citizenship' => 'Гражданство',
    'accounting' => 'Бухгалтерские услуги',
    'social-card' => 'Социальная карта',
    'bank-card' => 'Банковская карта для физ лица',
    'registration' => 'Прописка',
    'logistics' => 'Логистика и Таможня',
    'other' => 'Другое',
];

$errors = [];

if (mb_strlen($name) < 2 || mb_strlen($name) > 120) {
    $errors['name'] = 'Укажите ФИО или ник от 2 до 120 символов';
}
if (!in_array($preferredContactMethod, $allowedMethods, true)) {
    $errors['preferredContactMethod'] = 'Выберите удобный для вас способ связи';
}
if (mb_strlen($contactCredentials) < 3 || mb_strlen($contactCredentials) > 160) {
    $errors['contactCredentials'] = 'Укажите контакт для связи от 3 до 160 символов';
}
if (!in_array($service, $allowedServices, true)) {
    $errors['service'] = 'Выберите услугу из списка';
}
if (mb_strlen($message) > 2000) {
    $errors['message'] = 'Сообщение не должно превышать 2000 символов';
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
$submittedDateTime = new DateTimeImmutable('now', new DateTimeZone('Asia/Yerevan'));
$submittedAt = $submittedDateTime->format('d.m.Y H:i');

$esc = static fn(string $v): string => htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

$safeName = $esc($name);
$safeContactMethod = $esc($contactMethodLabel);
$safeContactCredentials = $esc($contactCredentials);
$safeService = $esc($serviceLabel);
$safeSubmittedAt = $esc($submittedAt);
$safeMessage = $message !== '' ? nl2br($esc($message), false) : 'Клиент не оставил сообщение';

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
    ($message !== '' ? $message : 'Клиент не оставил сообщение'),
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
                <h1 style="margin:8px 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:1.25;color:#ffffff;">Новая заявка с сайта Armbiz Consulting</h1>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#dbe8ff;">armbiz.biz</p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 8px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;width:190px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#646d83;vertical-align:top;">Клиент‚</td>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.4;color:#1e2736;vertical-align:top;">{$safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;width:190px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#646d83;vertical-align:top;">Обратная связь</td>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.4;color:#1e2736;vertical-align:top;">{$safeContactMethod}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;width:190px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#646d83;vertical-align:top;">Контактные данные</td>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.4;color:#1e2736;vertical-align:top;">{$safeContactCredentials}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;width:190px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#646d83;vertical-align:top;">Интересует услуга</td>
                    <td style="padding:10px 0;border-bottom:1px solid #d7deef;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.4;color:#1e2736;vertical-align:top;">{$safeService}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;width:190px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#646d83;vertical-align:top;">Дата и время обращения (Asia/Yerevan)</td>
                    <td style="padding:10px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.4;color:#1e2736;vertical-align:top;">{$safeSubmittedAt}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 20px 28px;">
                <div style="border:1px solid #d7deef;border-radius:12px;background-color:#f7f9ff;padding:16px 18px;">
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#646d83;margin-bottom:8px;">Обращение</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1e2736;">{$safeMessage}</div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 28px;border-top:1px solid #d7deef;background-color:#f8fbff;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.4;color:#646d83;text-align:center;">
                Ð­Ñ‚Ð¾ Ð°Ð²Ñ‚Ð¾Ð¼Ð°Ñ‚Ð¸Ñ‡ÐµÑÐºÐ¾Ðµ Ð¿Ð¸ÑÑŒÐ¼Ð¾ Ñ Ñ„Ð¾Ñ€Ð¼Ñ‹ Ð·Ð°ÑÐ²ÐºÐ¸  Ð½Ð° ÑÐ°Ð¹Ñ‚Ðµ armbiz.biz
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
    'subject' => 'Заявка на сайте Armbiz Consulting - ' . $serviceLabel,
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
    $clientIp =
        (string)($_SERVER['HTTP_CF_CONNECTING_IP'] ?? '') ?:
        (string)($_SERVER['HTTP_X_FORWARDED_FOR'] ?? '') ?:
        (string)($_SERVER['REMOTE_ADDR'] ?? '-');

    $eventDate = $submittedDateTime->format('d.m.Y');
    $eventTime = $submittedDateTime->format('H:i:s');
    if ($at !== '') {
        try {
            $eventDateTime = (new DateTimeImmutable($at))->setTimezone(new DateTimeZone('Asia/Yerevan'));
            $eventDate = $eventDateTime->format('d.m.Y');
            $eventTime = $eventDateTime->format('H:i:s');
        } catch (Throwable $e) {
            $eventDate = $submittedDateTime->format('d.m.Y');
            $eventTime = $submittedDateTime->format('H:i:s');
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

    $pageName = $normalizedPageTitle !== '' ? $normalizedPageTitle : ($pagePath !== '' ? $pagePath : 'Нет данных');
    $pageLink = $pageUrl !== '' ? $pageUrl : ($pagePath !== '' ? $pagePath : 'Нет данных');
    $screenWidthLabel = $viewportWidth !== '' ? $viewportWidth . 'px' : 'Нет данных';
    $browserLanguageLabel = $browserLanguage !== '' ? strtoupper($browserLanguage) : 'Нет данных';
    $userAgentLabel = $userAgent !== '' ? $userAgent : 'Нет данных';
    $utmFallback = 'Нет данных о метке';
    $messageText = $message !== '' ? $message : 'Клиент не оставил сообщение.';

    $tgEsc = static fn(string $v): string => htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $telegramMessage = implode("\n", [
        '&#128276; <b>Новая заявка с формы на сайте Armbiz Consulting</b>',
        '',
        '&#128197; <b>Дата:</b> ' . $tgEsc($eventDate),
        '&#128339; <b>Время:</b> ' . $tgEsc($eventTime),
        '&#128196; <b>Страница:</b> ' . $tgEsc($pageName),
        '&#128241; <b>Ширина экрана:</b> ' . $tgEsc($screenWidthLabel),
        '&#127760; <b>Язык браузера:</b> ' . $tgEsc($browserLanguageLabel),
        '&#129504; <b>Браузер:</b>',
        '<code>' . $tgEsc($userAgentLabel) . '</code>',
        '&#128279; <b>Ссылка:</b> ',
        '<code>' . $tgEsc($pageLink) . '</code>',
        '',
        '&#128100; <b>Клиент:</b> ' . $tgEsc($name),
        '&#128222; <b>Метод связи:</b> ' . $tgEsc($contactMethodLabel),
        '&#128209; <b>Контакты:</b> ' . $tgEsc($contactCredentials),
        '&#128188; <b>Услуга:</b> ' . $tgEsc($serviceLabel),
        '',
        '&#128172; <b>Сообщение:</b> ' . $tgEsc($messageText),
        '',
        '&#128279; <b>UTM Source:</b> ' . $tgEsc($utmSource !== '' ? $utmSource : $utmFallback),
        '&#128279; <b>UTM Medium:</b> ' . $tgEsc($utmMedium !== '' ? $utmMedium : $utmFallback),
        '&#128279; <b>UTM Campaign:</b> ' . $tgEsc($utmCampaign !== '' ? $utmCampaign : $utmFallback),
        '&#128279; <b>UTM Content:</b> ' . $tgEsc($utmContent !== '' ? $utmContent : $utmFallback),
        '&#128279; <b>UTM Term:</b> ' . $tgEsc($utmTerm !== '' ? $utmTerm : $utmFallback),
        '',
        '&#127760; <b>IP:</b> ' . $tgEsc($clientIp !== '' ? $clientIp : 'Нет данных'),
    ]);

    send_telegram_message($telegramBotToken, $telegramChatId, $telegramMessage);
}

json_response(200, ['ok' => true]);