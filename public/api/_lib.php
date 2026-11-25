<?php
declare(strict_types=1);

/*
 * Shared helpers for the SMART Hub admin API.
 *
 * No database: everything is stored as JSON in a private data folder,
 * by default "smarthub-data" next to dist/ (outside the website's document
 * root). Each file starts with "<?php exit; ?>" and ends in .php, so even if
 * the folder were ever reachable from the web, the server would run it and
 * print nothing instead of showing its contents.
 *
 * Files: content.json.php (all site content), users.json.php (admin
 * logins, hashed passwords only) and attempts.json.php (failed sign-ins).
 */

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === '_lib.php') { http_response_code(404); exit; }

const SH_COLLECTIONS = ['projects', 'blog', 'partners', 'leadership', 'gallery', 'settings'];
const SH_GUARD = "<?php exit; ?>\n";

/** Optional smarthub-config.php (in this folder's parents) may set 'data_dir'. */
function sh_config(): array {
    static $config = null;
    if ($config !== null) return $config;
    $config = [];
    $dir = __DIR__;
    for ($i = 0; $i < 6; $i++) {
        $file = $dir . DIRECTORY_SEPARATOR . 'smarthub-config.php';
        if (is_file($file)) { $loaded = require $file; $config = is_array($loaded) ? $loaded : []; break; }
        $parent = dirname($dir);
        if ($parent === $dir) break;
        $dir = $parent;
    }
    return $config;
}

function sh_data_dir(): string {
    static $dir = null;
    if ($dir !== null) return $dir;
    $dir = rtrim((string) (getenv('SMARTHUB_DATA_DIR') ?: (sh_config()['data_dir'] ?? dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'smarthub-data')), '/\\');
    if (!is_dir($dir) && !@mkdir($dir, 0750, true)) {
        sh_fail(500, 'The admin data folder could not be created. Check that PHP can write to: ' . basename(dirname($dir)) . '/' . basename($dir));
    }
    $guard = $dir . DIRECTORY_SEPARATOR . '.htaccess';
    if (!is_file($guard)) @file_put_contents($guard, "Require all denied\nOptions -Indexes\n");
    $index = $dir . DIRECTORY_SEPARATOR . 'index.html';
    if (!is_file($index)) @file_put_contents($index, '');
    return $dir;
}

function sh_path(string $name): string { return sh_data_dir() . DIRECTORY_SEPARATOR . $name . '.json.php'; }

function sh_exists(string $name): bool { return is_file(sh_path($name)); }

function sh_read(string $name, $default = []) {
    $file = sh_path($name);
    if (!is_file($file)) return $default;
    $raw = (string) file_get_contents($file);
    if (str_starts_with($raw, SH_GUARD)) $raw = substr($raw, strlen(SH_GUARD));
    $data = json_decode($raw, true);
    return is_array($data) ? $data : $default;
}

/** Writes atomically: a temporary file is renamed over the old one. */
function sh_write(string $name, array $data): void {
    $file = sh_path($name);
    $json = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if ($json === false) sh_fail(500, 'The data could not be saved.');
    $temp = $file . '.' . bin2hex(random_bytes(4)) . '.tmp';
    if (file_put_contents($temp, SH_GUARD . $json, LOCK_EX) === false || !@rename($temp, $file)) {
        @unlink($temp);
        sh_fail(500, 'The data could not be saved. Check that PHP can write to the data folder.');
    }
    @chmod($file, 0640);
}

/** Runs $change on a file's data while holding a lock, so two saves can't overwrite each other. */
function sh_update(string $name, $default, callable $change) {
    $lock = fopen(sh_data_dir() . DIRECTORY_SEPARATOR . '.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) sh_fail(500, 'The data folder is busy. Please try again.');
    try {
        $data = sh_read($name, $default);
        $result = $change($data);
        sh_write($name, $data);
        return $result;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

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
    // A user removed from users.json.php loses access straight away.
    if (!isset(sh_read('users')[$_SESSION['user']])) { $_SESSION = []; sh_fail(401, 'Please sign in.'); }
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method !== 'GET' && !hash_equals($_SESSION['csrf'] ?? '', $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) {
        sh_fail(403, 'Your session expired. Reload the page and try again.');
    }
    return $_SESSION['user'];
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

/** Converts the build snapshot (seed.json) into stored content. */
function sh_seed_content(): array {
    $seed = is_file(__DIR__ . '/seed.json') ? json_decode((string) file_get_contents(__DIR__ . '/seed.json'), true) : null;
    $content = array_fill_keys(SH_COLLECTIONS, []);
    if (!is_array($seed)) return $content;
    foreach (SH_COLLECTIONS as $collection) {
        $items = $collection === 'settings' ? (isset($seed['settings']) ? [$seed['settings']] : []) : ($seed[$collection] ?? []);
        $seen = [];
        foreach ($items as $item) {
            if (!is_array($item)) continue;
            $clean = sh_clean($collection, $item, false);
            unset($clean['id']);
            $id = $collection === 'settings' ? 'site' : sh_slug((string) ($item['id'] ?? $item['title'] ?? $item['name'] ?? $item['caption'] ?? ''));
            if (isset($seen[$id])) continue;
            $seen[$id] = true;
            $content[$collection][] = ['id' => $id] + $clean;
        }
    }
    return $content;
}
