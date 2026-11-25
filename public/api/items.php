<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';

$method = sh_method('GET', 'POST', 'DELETE');
sh_require_admin();

$collection = (string) ($_GET['collection'] ?? '');
if (!in_array($collection, SH_COLLECTIONS, true)) sh_fail(400, 'Unknown collection.');

$empty = array_fill_keys(SH_COLLECTIONS, []);
$list = fn(array $content) => array_values(array_filter($content[$collection] ?? [], 'is_array'));

if ($method === 'GET') sh_json(['items' => $list(sh_read('content', $empty))]);

if ($method === 'DELETE') {
    $id = (string) ($_GET['id'] ?? '');
    $items = sh_update('content', $empty, function (array &$content) use ($collection, $id, $list) {
        $content[$collection] = array_values(array_filter($list($content), fn($item) => ($item['id'] ?? '') !== $id));
        return $content[$collection];
    });
    sh_json(['items' => $items]);
}

$body = sh_body();

// Reorder: {"order": ["id-a", "id-b", ...]}. Items missing from the list keep their place at the end.
if (isset($body['order']) && is_array($body['order'])) {
    $order = array_flip(array_map('strval', array_values($body['order'])));
    $items = sh_update('content', $empty, function (array &$content) use ($collection, $order, $list) {
        $items = $list($content);
        $rank = fn($item, $index) => $order[$item['id'] ?? ''] ?? (count($order) + $index);
        $ranked = array_map(fn($item, $index) => [$rank($item, $index), $item], $items, array_keys($items));
        usort($ranked, fn($a, $b) => $a[0] <=> $b[0]);
        $content[$collection] = array_column($ranked, 1);
        return $content[$collection];
    });
    sh_json(['items' => $items]);
}

// Save one item: {"item": {...}, "originalId": "id-before-editing" | null}
$item = $body['item'] ?? null;
if (!is_array($item)) sh_fail(400, 'Missing item.');
$clean = sh_clean($collection, $item);
unset($clean['id']);

$id = $collection === 'settings'
    ? 'site'
    : sh_slug((string) ($item['id'] ?? '') !== '' ? (string) $item['id'] : (string) ($clean['title'] ?? $clean['name'] ?? $clean['caption'] ?? ''));
$originalId = isset($body['originalId']) && $body['originalId'] !== '' ? (string) $body['originalId'] : null;
$saved = ['id' => $id] + $clean;

$items = sh_update('content', $empty, function (array &$content) use ($collection, $id, $originalId, $saved, $list) {
    $items = $list($content);
    $ids = array_map(fn($entry) => (string) ($entry['id'] ?? ''), $items);
    $taken = array_search($id, $ids, true);

    if ($collection === 'settings') {
        $content['settings'] = [$saved];
        return $content['settings'];
    }
    if ($taken !== false && $originalId !== $id) {
        sh_fail(409, 'Another entry already uses the web address "' . $id . '". Change the title or the web address.');
    }

    $at = $originalId !== null ? array_search($originalId, $ids, true) : false;
    if ($at !== false) {
        $items[$at] = $saved;            // Edit in place, even if the web address changed.
    } else {
        array_unshift($items, $saved);   // New entries go to the top of the list.
    }
    $content[$collection] = array_values($items);
    return $content[$collection];
});

sh_json(['item' => $saved, 'items' => $items]);
