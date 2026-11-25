<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';

$method = sh_method('GET', 'POST');
sh_session();

if ($method === 'GET') {
    if (!sh_exists('users')) sh_fail(503, 'The admin has not been set up yet.');
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
    $ip = substr($_SERVER['REMOTE_ADDR'] ?? 'unknown', 0, 64);
    $window = time() - 15 * 60;

    // Keep only recent failures; allow 8 per address per 15 minutes.
    $recent = sh_update('attempts', [], function (array &$attempts) use ($ip, $window) {
        foreach ($attempts as $key => $times) {
            $attempts[$key] = array_values(array_filter((array) $times, fn($t) => $t >= $window));
            if (!$attempts[$key]) unset($attempts[$key]);
        }
        return count($attempts[$ip] ?? []);
    });
    if ($recent >= 8) sh_fail(429, 'Too many attempts. Try again in 15 minutes.');

    $username = is_string($body['username'] ?? null) ? trim($body['username']) : '';
    $password = is_string($body['password'] ?? null) ? $body['password'] : '';
    $hash = sh_read('users')[$username] ?? null;
    // Always run one password check, so a wrong username takes as long as a wrong password
    // and response times don't reveal which usernames exist.
    $valid = password_verify($password, is_string($hash) ? $hash : '$2y$10$abcdefghijklmnopqrstuuJ0r8u6M5Gm1r2s3t4u5v6w7x8y9z0AB');
    if (!is_string($hash) || !$valid) {
        sh_update('attempts', [], function (array &$attempts) use ($ip) { $attempts[$ip][] = time(); });
        usleep(random_int(700000, 1200000));   // Slows password guessing spread across many addresses.
        sh_fail(401, 'Wrong username or password.');
    }
    sh_update('attempts', [], function (array &$attempts) use ($ip) { unset($attempts[$ip]); });
    session_regenerate_id(true);
    $_SESSION['user'] = $username;
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
    sh_json(['user' => $username, 'csrf' => $_SESSION['csrf']]);
}

if ($action === 'password') {
    $user = sh_require_admin();
    $next = (string) ($body['next'] ?? '');
    if (strlen($next) < 10) sh_fail(422, 'The new password must be at least 10 characters.');
    $current = (string) ($body['current'] ?? '');
    sh_update('users', [], function (array &$users) use ($user, $current, $next) {
        if (!password_verify($current, (string) ($users[$user] ?? ''))) sh_fail(422, 'Your current password is wrong.');
        $users[$user] = password_hash($next, PASSWORD_DEFAULT);
    });
    sh_json(['ok' => true]);
}

sh_fail(400, 'Unknown action.');
