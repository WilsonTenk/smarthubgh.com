<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';

// Public and read-only: everything the website shows, in one request.
sh_method('GET');
$stored = sh_read('content', null);
if ($stored === null) sh_fail(503, 'The admin has not been set up yet.');

$content = [];
foreach (SH_COLLECTIONS as $collection) {
    $items = array_values(array_filter($stored[$collection] ?? [], 'is_array'));
    if ($collection === 'settings') {
        $settings = $items[0] ?? [];
        unset($settings['id']);
        $content['settings'] = $settings ?: new stdClass();
    } else {
        $content[$collection] = $items;
    }
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=30');
header('X-Content-Type-Options: nosniff');
echo json_encode($content, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
