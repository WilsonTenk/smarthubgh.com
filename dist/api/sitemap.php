<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';

/*
 * Serves /sitemap.xml (see the rewrite in .htaccess). Once the admin is set up,
 * the list is built from the saved content, so blog posts and projects added
 * in the admin are included automatically. Before that, the sitemap generated
 * at build time is served as it is.
 */

const SH_SITE = 'https://smarthubgh.com';

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');
header('X-Content-Type-Options: nosniff');

$content = sh_read('content', null);
if ($content === null) {
    $static = dirname(__DIR__) . '/sitemap.xml';
    if (is_file($static)) { readfile($static); exit; }
    $content = [];
}

$day = function (?string $date): ?string {
    $time = $date ? strtotime($date) : false;
    return $time ? gmdate('Y-m-d', $time) : null;
};

$urls = [];
foreach (['/', '/about/', '/projects/', '/gallery/', '/blog/', '/contact/'] as $path) $urls[] = [$path, null];
foreach ($content['projects'] ?? [] as $item) {
    if (is_array($item) && preg_match('/^[a-z0-9-]+$/', (string) ($item['id'] ?? ''))) {
        $urls[] = ['/projects/' . $item['id'] . '/', $day($item['completedOn'] ?? null)];
    }
}
foreach ($content['blog'] ?? [] as $item) {
    if (is_array($item) && preg_match('/^[a-z0-9-]+$/', (string) ($item['id'] ?? ''))) {
        $dates = array_filter([$day($item['date'] ?? null), $day($item['updatedAt'] ?? null)]);
        $urls[] = ['/blog/' . $item['id'] . '/', $dates ? max($dates) : null];
    }
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($urls as [$path, $modified]) {
    echo '  <url><loc>' . htmlspecialchars(SH_SITE . $path, ENT_XML1) . '</loc>'
        . ($modified ? '<lastmod>' . $modified . '</lastmod>' : '') . "</url>\n";
}
echo "</urlset>\n";
