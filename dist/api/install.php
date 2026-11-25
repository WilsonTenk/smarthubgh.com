<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';

/*
 * One-time setup: creates the tables, imports the website's current content
 * from seed.json and creates the first admin account. It refuses to run again
 * once an admin exists.
 */

sh_create_tables();
$db = sh_db();
$installed = (int) $db->query('SELECT COUNT(*) FROM sh_users')->fetchColumn() > 0;
$message = '';
$done = false;

if (!$installed && ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    if (!preg_match('/^[A-Za-z0-9_.@-]{3,64}$/', $username)) {
        $message = 'Use 3–64 letters, numbers, dots, dashes or underscores for the username.';
    } elseif (strlen($password) < 10) {
        $message = 'The password must be at least 10 characters.';
    } elseif ($password !== (string) ($_POST['confirm'] ?? '')) {
        $message = 'The two passwords do not match.';
    } else {
        $seed = is_file(__DIR__ . '/seed.json') ? json_decode((string) file_get_contents(__DIR__ . '/seed.json'), true) : null;
        $db->beginTransaction();
        $imported = 0;
        $hasContent = (int) $db->query('SELECT COUNT(*) FROM sh_items')->fetchColumn() > 0;
        if (is_array($seed) && !$hasContent) {
            foreach (SH_COLLECTIONS as $collection) {
                $items = $collection === 'settings' ? (isset($seed['settings']) ? [$seed['settings']] : []) : ($seed[$collection] ?? []);
                foreach (array_values($items) as $position => $item) {
                    if (!is_array($item)) continue;
                    $clean = sh_clean($collection, $item, false);
                    unset($clean['id']);
                    $id = $collection === 'settings' ? 'site' : sh_slug((string) ($item['id'] ?? $item['title'] ?? $item['name'] ?? $item['caption'] ?? ''));
                    sh_store($collection, $id, $position, $clean);
                    $imported++;
                }
            }
        }
        $db->prepare('INSERT INTO sh_users (username, password_hash) VALUES (?, ?)')->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
        $db->commit();
        $installed = true;
        $done = true;
        $message = $imported ? "Imported $imported items from the current website." : 'No content was imported (the database already had content, or seed.json was missing).';
    }
}

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
$e = fn(string $s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>SMART Hub admin setup</title>
<style>
body{font-family:system-ui,sans-serif;background:#f1f5f9;color:#0f172a;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px}
main{background:#fff;border-radius:16px;padding:32px;max-width:420px;width:100%;box-shadow:0 10px 30px rgba(15,23,42,.08)}
h1{font-size:22px;margin:0 0 8px}p{color:#475569;line-height:1.5}label{display:block;font-weight:600;font-size:14px;margin:16px 0 6px}
input{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:16px}
button,a.btn{display:inline-block;margin-top:24px;background:#0b1f3a;color:#fff;border:0;border-radius:8px;padding:12px 18px;font-size:15px;font-weight:600;text-decoration:none;cursor:pointer}
.msg{background:#fef3c7;border-radius:8px;padding:10px 12px;color:#78350f}.ok{background:#dcfce7;color:#14532d}
</style>
</head>
<body><main>
<?php if ($installed): ?>
  <h1>Admin is set up</h1>
  <?php if ($message): ?><p class="msg <?= $done ? 'ok' : '' ?>"><?= $e($message) ?></p><?php endif; ?>
  <p>This setup page is now locked. Sign in to manage the website.</p>
  <a class="btn" href="/admin">Go to the admin</a>
<?php else: ?>
  <h1>Set up the SMART Hub admin</h1>
  <p>This creates the database tables, copies the website's current content into them, and creates your admin account.</p>
  <?php if ($message): ?><p class="msg"><?= $e($message) ?></p><?php endif; ?>
  <form method="post" autocomplete="off">
    <label for="username">Admin username</label>
    <input id="username" name="username" required minlength="3" maxlength="64" value="<?= $e((string) ($_POST['username'] ?? '')) ?>">
    <label for="password">Password (at least 10 characters)</label>
    <input id="password" name="password" type="password" required minlength="10" autocomplete="new-password">
    <label for="confirm">Repeat password</label>
    <input id="confirm" name="confirm" type="password" required minlength="10" autocomplete="new-password">
    <button type="submit">Create admin</button>
  </form>
<?php endif; ?>
</main></body>
</html>
