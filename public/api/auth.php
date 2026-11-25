<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';

$method = sh_method('GET', 'POST');
sh_session();

if ($method === 'GET') {
    sh_json(['user' => $_SESSION['user'] ?? null, 'csrf' => sh_csrf()]);
}

$body = sh_body();
$action = $body['action'] ?? '';

if ($action === 'logout') {
    $_SESSION = [];
    session_regenerate_id(true);
    sh_json(['user' => null, 'csrf' => sh_csrf()]);
}

if ($action === 'login') {
    $db = sh_db();
    $ip = substr($_SERVER['REMOTE_ADDR'] ?? 'unknown', 0, 64);
    $db->prepare('DELETE FROM sh_login_attempts WHERE attempted_at < ?')->execute([time() - 15 * 60]);
    $count = $db->prepare('SELECT COUNT(*) FROM sh_login_attempts WHERE ip = ?');
    $count->execute([$ip]);
    if ((int) $count->fetchColumn() >= 8) sh_fail(429, 'Too many attempts. Try again in 15 minutes.');

    $username = trim((string) ($body['username'] ?? ''));
    $password = (string) ($body['password'] ?? '');
    $find = $db->prepare('SELECT password_hash FROM sh_users WHERE username = ?');
    $find->execute([$username]);
    $hash = $find->fetchColumn();
    if (!$hash || !password_verify($password, $hash)) {
        $db->prepare('INSERT INTO sh_login_attempts (ip, attempted_at) VALUES (?, ?)')->execute([$ip, time()]);
        sh_fail(401, 'Wrong username or password.');
    }
    $db->prepare('DELETE FROM sh_login_attempts WHERE ip = ?')->execute([$ip]);
    session_regenerate_id(true);
    $_SESSION['user'] = $username;
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
    sh_json(['user' => $username, 'csrf' => $_SESSION['csrf']]);
}

if ($action === 'password') {
    $user = sh_require_admin();
    $next = (string) ($body['next'] ?? '');
    if (strlen($next) < 10) sh_fail(422, 'The new password must be at least 10 characters.');
    $find = sh_db()->prepare('SELECT password_hash FROM sh_users WHERE username = ?');
    $find->execute([$user]);
    if (!password_verify((string) ($body['current'] ?? ''), (string) $find->fetchColumn())) sh_fail(422, 'Your current password is wrong.');
    sh_db()->prepare('UPDATE sh_users SET password_hash = ? WHERE username = ?')->execute([password_hash($next, PASSWORD_DEFAULT), $user]);
    sh_json(['ok' => true]);
}

sh_fail(400, 'Unknown action.');
