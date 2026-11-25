<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';

$method = sh_method('GET', 'POST', 'DELETE');
sh_require_admin();
$db = sh_db();

$collection = (string) ($_GET['collection'] ?? '');
if (!in_array($collection, SH_COLLECTIONS, true)) sh_fail(400, 'Unknown collection.');

function sh_list(string $collection): array {
    $stmt = sh_db()->prepare('SELECT data FROM sh_items WHERE collection = ? ORDER BY position, id');
    $stmt->execute([$collection]);
    return array_map(fn($row) => json_decode($row['data'], true), $stmt->fetchAll());
}

if ($method === 'GET') sh_json(['items' => sh_list($collection)]);

if ($method === 'DELETE') {
    $db->prepare('DELETE FROM sh_items WHERE collection = ? AND id = ?')->execute([$collection, (string) ($_GET['id'] ?? '')]);
    sh_json(['items' => sh_list($collection)]);
}

$body = sh_body();

// Reorder: {"order": ["id-a", "id-b", ...]}
if (isset($body['order']) && is_array($body['order'])) {
    $update = $db->prepare('UPDATE sh_items SET position = ? WHERE collection = ? AND id = ?');
    $db->beginTransaction();
    foreach (array_values($body['order']) as $position => $id) $update->execute([$position, $collection, (string) $id]);
    $db->commit();
    sh_json(['items' => sh_list($collection)]);
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

$positionOf = $db->prepare('SELECT position FROM sh_items WHERE collection = ? AND id = ?');
$positionOf->execute([$collection, $id]);
$position = $positionOf->fetchColumn();
if ($position !== false && $originalId !== $id && $collection !== 'settings') {
    sh_fail(409, 'Another entry already uses the ID "' . $id . '". Change the title or the ID.');
}

$db->beginTransaction();
if ($originalId !== null && $originalId !== $id) {
    // The ID (web address) changed: keep the old position, remove the old row.
    $positionOf->execute([$collection, $originalId]);
    $position = $positionOf->fetchColumn();
    $db->prepare('DELETE FROM sh_items WHERE collection = ? AND id = ?')->execute([$collection, $originalId]);
}
if ($position === false || $position === null) {
    // New entries go to the top of the list.
    $min = $db->prepare('SELECT MIN(position) FROM sh_items WHERE collection = ?');
    $min->execute([$collection]);
    $position = ((int) $min->fetchColumn()) - 1;
}
sh_store($collection, $id, (int) $position, $clean);
$db->commit();

sh_json(['item' => ['id' => $id] + $clean, 'items' => sh_list($collection)]);
