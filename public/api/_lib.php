<?php
declare(strict_types=1);

/*
 * Shared helpers for the SMART Hub admin API.
 * Database credentials live in smarthub-config.php, which is searched for in
 * this folder's parents so it can sit outside the public web root.
 */

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === '_lib.php') { http_response_code(404); exit; }

const SH_COLLECTIONS = ['projects', 'blog', 'partners', 'leadership', 'gallery', 'settings'];

function sh_config(): array {
    static $config = null;
    if ($config !== null) return $config;
    $candidates = [];
    if ($env = getenv('SMARTHUB_CONFIG')) $candidates[] = $env;
    $dir = __DIR__;
    for ($i = 0; $i < 6; $i++) {
        $candidates[] = $dir . DIRECTORY_SEPARATOR . 'smarthub-config.php';
        $parent = dirname($dir);
        if ($parent === $dir) break;
        $dir = $parent;
    }
    foreach ($candidates as $file) {
        if (is_file($file)) { $config = require $file; return $config; }
    }
    sh_fail(500, 'The admin is not configured yet. Create smarthub-config.php (see smarthub-config.example.php).');
}

function sh_db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $c = sh_config();
    try {
        $pdo = new PDO($c['dsn'], $c['db_user'] ?? null, $c['db_pass'] ?? null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $e) {
        sh_fail(500, 'Could not connect to the database.');
    }
    return $pdo;
}

function sh_is_mysql(): bool { return sh_db()->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql'; }

function sh_json($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function sh_fail(int $status, string $message): void { sh_json(['error' => $message], $status); }

function sh_method(string ...$allowed): string {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($method, $allowed, true)) sh_fail(405, 'Method not allowed.');
    return $method;
}

function sh_body(): array {
    $data = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($data)) sh_fail(400, 'Invalid JSON body.');
    return $data;
}

function sh_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name('sh_admin');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => $secure, 'httponly' => true, 'samesite' => 'Strict']);
    session_start();
    // Sign out after 8 hours of inactivity.
    if (isset($_SESSION['seen']) && time() - $_SESSION['seen'] > 8 * 3600) { $_SESSION = []; session_regenerate_id(true); }
    $_SESSION['seen'] = time();
}

function sh_csrf(): string {
    sh_session();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

/** Requires a signed-in admin; state-changing requests must also carry the CSRF token. */
function sh_require_admin(): string {
    sh_session();
    if (empty($_SESSION['user'])) sh_fail(401, 'Please sign in.');
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method !== 'GET' && !hash_equals($_SESSION['csrf'] ?? '', $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) {
        sh_fail(403, 'Your session expired. Reload the page and try again.');
    }
    return $_SESSION['user'];
}

function sh_create_tables(): void {
    $text = sh_is_mysql() ? 'MEDIUMTEXT' : 'TEXT';
    $suffix = sh_is_mysql() ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci' : '';
    $db = sh_db();
    $db->exec("CREATE TABLE IF NOT EXISTS sh_items (
        collection VARCHAR(32) NOT NULL,
        id VARCHAR(150) NOT NULL,
        position INT NOT NULL DEFAULT 0,
        data $text NOT NULL,
        updated_at VARCHAR(32) NOT NULL,
        PRIMARY KEY (collection, id)
    )$suffix");
    $db->exec("CREATE TABLE IF NOT EXISTS sh_users (
        username VARCHAR(64) NOT NULL PRIMARY KEY,
        password_hash VARCHAR(255) NOT NULL
    )$suffix");
    $db->exec("CREATE TABLE IF NOT EXISTS sh_login_attempts (
        ip VARCHAR(64) NOT NULL,
        attempted_at INT NOT NULL
    )$suffix");
}

function sh_slug(string $value): string {
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $value) ?? '', '-'));
    return substr($slug !== '' ? $slug : bin2hex(random_bytes(4)), 0, 120);
}

/*
 * Field rules per collection: s = short text, t = long text, n = number,
 * l = list of strings, g = list of {src, alt, caption}, e:a|b = one of the values.
 */
function sh_schema(string $collection): array {
    $schemas = [
        'projects' => ['id' => 's', 'title' => 's', 'period' => 's', 'completedOn' => 's', 'listedOn' => 's', 'category' => 's',
            'relatedBlogId' => 's', 'sponsor' => 's', 'communities' => 's', 'reach' => 's', 'description' => 't', 'image' => 's',
            'imageAlt' => 's', 'imageFit' => 'e:cover|contain', 'fullContent' => 't', 'galleryImages' => 'l'],
        'blog' => ['id' => 's', 'title' => 's', 'date' => 's', 'updatedAt' => 's', 'excerpt' => 't', 'content' => 't', 'image' => 's',
            'imageAlt' => 's', 'imageFit' => 'e:cover|contain', 'imageCaption' => 's', 'galleryImages' => 'g', 'author' => 's', 'category' => 's'],
        'partners' => ['id' => 's', 'name' => 's', 'logo' => 's', 'logoScale' => 'n', 'logoOffsetY' => 's'],
        'leadership' => ['id' => 's', 'name' => 's', 'role' => 's', 'image' => 's', 'occupation' => 's', 'bio' => 't'],
        'gallery' => ['id' => 's', 'src' => 's', 'alt' => 's', 'caption' => 's'],
        'settings' => ['id' => 's', 'email' => 's', 'phonePrimary' => 's', 'phoneSecondary' => 's', 'addressLine1' => 's',
            'addressLine2' => 's', 'digitalAddress' => 's'],
    ];
    return $schemas[$collection] ?? [];
}

const SH_REQUIRED = [
    'projects' => ['title', 'sponsor', 'communities', 'reach', 'description'],
    'blog' => ['title', 'excerpt', 'content', 'author', 'category'],
    'partners' => ['name'],
    'leadership' => ['name', 'role', 'image'],
    'gallery' => ['src'],
    'settings' => ['email', 'phonePrimary', 'addressLine1'],
];

/** Keeps only known fields, trims text, and drops empty optional values. */
function sh_clean(string $collection, array $item, bool $strict = true): array {
    $clean = [];
    foreach (sh_schema($collection) as $field => $rule) {
        if (!array_key_exists($field, $item) || $item[$field] === null) continue;
        $value = $item[$field];
        if ($rule === 's' || $rule === 't') {
            if (!is_scalar($value)) continue;
            $value = trim((string) $value);
            $max = $rule === 's' ? 500 : 200000;
            if (mb_strlen($value) > $max) sh_fail(422, "The field \"$field\" is too long.");
            if ($value === '') continue;
        } elseif ($rule === 'n') {
            if ($value === '' || !is_numeric($value)) continue;
            $value = (float) $value;
        } elseif ($rule === 'l') {
            if (!is_array($value)) continue;
            $value = array_values(array_filter(array_map(fn($v) => is_scalar($v) ? trim((string) $v) : '', $value), fn($v) => $v !== ''));
            if (!$value) continue;
        } elseif ($rule === 'g') {
            if (!is_array($value)) continue;
            $out = [];
            foreach ($value as $image) {
                if (!is_array($image) || trim((string) ($image['src'] ?? '')) === '') continue;
                $entry = ['src' => trim((string) $image['src']), 'alt' => trim((string) ($image['alt'] ?? ''))];
                if (trim((string) ($image['caption'] ?? '')) !== '') $entry['caption'] = trim((string) $image['caption']);
                $out[] = $entry;
            }
            if (!$out) continue;
            $value = $out;
        } elseif (str_starts_with($rule, 'e:')) {
            if (!in_array($value, explode('|', substr($rule, 2)), true)) continue;
        }
        $clean[$field] = $value;
    }
    if ($strict) {
        foreach (SH_REQUIRED[$collection] ?? [] as $field) {
            if (!isset($clean[$field])) sh_fail(422, "Please fill in \"$field\".");
        }
    }
    return $clean;
}

/** Inserts or replaces one stored item. */
function sh_store(string $collection, string $id, int $position, array $item): void {
    $db = sh_db();
    $json = json_encode(['id' => $id] + $item, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $db->prepare('DELETE FROM sh_items WHERE collection = ? AND id = ?')->execute([$collection, $id]);
    $db->prepare('INSERT INTO sh_items (collection, id, position, data, updated_at) VALUES (?, ?, ?, ?, ?)')
       ->execute([$collection, $id, $position, $json, gmdate('c')]);
}
