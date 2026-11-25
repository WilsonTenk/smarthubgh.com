<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';

// Public and read-only: everything the website shows, in one request.
sh_method('GET');
$rows = sh_db()->query('SELECT collection, data FROM sh_items ORDER BY collection, position, id')->fetchAll();
$content = ['projects' => [], 'blog' => [], 'partners' => [], 'leadership' => [], 'gallery' => [], 'settings' => new stdClass()];
foreach ($rows as $row) {
    $item = json_decode($row['data'], true);
    if (!is_array($item)) continue;
    if ($row['collection'] === 'settings') { unset($item['id']); $content['settings'] = $item; continue; }
    if (isset($content[$row['collection']])) $content[$row['collection']][] = $item;
}
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=30');
header('X-Content-Type-Options: nosniff');
echo json_encode($content, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
