<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';

/*
 * Serves /blog/{id}/ and /projects/{id}/ (see the rewrite in .htaccess).
 *
 * Search engines read a page's <head> before running any JavaScript, so this
 * fills in the title, description, canonical link, social tags and structured
 * data from the content saved in the admin:
 * - pages that were prerendered at build time keep their full HTML body;
 * - pages added in the admin get the app shell, which renders them in the browser;
 * - unknown or deleted entries return a real 404.
 */

const SH_SITE = 'https://smarthubgh.com';
const SH_SITE_NAME = 'SMART HUB GH';
const SH_ORG = 'SMART Youth Connekt (SMART Hub)';

$type = (string) ($_GET['type'] ?? '');
$id = (string) ($_GET['id'] ?? '');
if (!in_array($type, ['blog', 'projects'], true) || !preg_match('/^[a-z0-9-]{1,120}$/', $id)) sh_not_found();

// One address per page: /blog/my-post/ (with the trailing slash).
$path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';
if (!str_ends_with($path, '/')) {
    header('Location: ' . SH_SITE . "/$type/$id/", true, 301);
    exit;
}

$docroot = dirname(__DIR__);
$static = $docroot . "/$type/$id/index.html";
$content = sh_read('content', null);

// Before the admin is set up, the prerendered files are the source of truth.
if ($content === null) {
    is_file($static) ? sh_send_html((string) file_get_contents($static), 200) : sh_not_found();
}

$item = null;
foreach ($content[$type] ?? [] as $entry) {
    if (is_array($entry) && ($entry['id'] ?? '') === $id) { $item = $entry; break; }
}
if ($item === null) sh_not_found();

$template = is_file($static) ? (string) file_get_contents($static) : (string) file_get_contents($docroot . '/404.html');
sh_send_html(sh_with_seo($template, $type, $item), 200);

/* ------------------------------------------------------------------------- */

function sh_send_html(string $html, int $status): void {
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: public, max-age=0, must-revalidate');
    echo $html;
    exit;
}

function sh_not_found(): void {
    $file = dirname(__DIR__) . '/404.html';
    sh_send_html(is_file($file) ? (string) file_get_contents($file) : 'Not found', 404);
}

function sh_abs(string $url): string {
    if ($url === '') return SH_SITE . '/SMART-HUB-LOGO-ORIGINAL.png';
    if (preg_match('#^https?://#i', $url)) return $url;
    return SH_SITE . '/' . ltrim($url, '/');
}

function sh_iso(?string $date): ?string {
    if (!$date) return null;
    $time = strtotime($date);
    return $time ? gmdate('Y-m-d', $time) : null;
}

/** Plain, single-line description of at most ~160 characters. */
function sh_description(string $text): string {
    $text = trim(preg_replace('/\s+/', ' ', html_entity_decode(strip_tags($text), ENT_QUOTES, 'UTF-8')) ?? '');
    if (mb_strlen($text) <= 160) return $text;
    $cut = mb_substr($text, 0, 157);
    $space = mb_strrpos($cut, ' ');
    return rtrim($space > 100 ? mb_substr($cut, 0, $space) : $cut, " ,.;:") . '…';
}

function sh_with_seo(string $html, string $type, array $item): string {
    $a = fn(string $s) => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $isPost = $type === 'blog';
    $name = (string) ($item['title'] ?? '');
    $title = $name . ($isPost ? ' | SMART Hub Blog' : ' | SMART Hub Projects');
    $canonical = SH_SITE . "/$type/" . $item['id'] . '/';
    $description = sh_description((string) ($isPost ? ($item['excerpt'] ?? '') : ($item['description'] ?? '')));
    $image = sh_abs((string) ($item['image'] ?? ''));
    $imageAlt = (string) ($item['imageAlt'] ?? (!empty($item['image']) ? $name : 'SMART Hub GH logo'));
    $published = $isPost ? sh_iso($item['date'] ?? null) : null;
    $modified = $isPost ? sh_iso($item['updatedAt'] ?? null) : null;

    $meta = fn(string $key, string $value, bool $property = false) =>
        '<meta ' . ($property ? 'property' : 'name') . '="' . $a($key) . '" content="' . $a($value) . '" />';

    $crumbs = [
        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => SH_SITE . '/'],
        ['@type' => 'ListItem', 'position' => 2, 'name' => $isPost ? 'Blog' : 'Projects', 'item' => SH_SITE . "/$type/"],
        ['@type' => 'ListItem', 'position' => 3, 'name' => $name, 'item' => $canonical],
    ];
    $schemas = [['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $crumbs]];
    if ($isPost) {
        $schemas[] = array_filter([
            '@context' => 'https://schema.org', '@type' => 'BlogPosting', '@id' => "$canonical#article",
            'headline' => $name, 'description' => $description, 'url' => $canonical,
            'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $canonical], 'image' => $image,
            'author' => ['@type' => 'Organization', 'name' => (string) ($item['author'] ?? SH_ORG)],
            'publisher' => ['@type' => 'Organization', 'name' => SH_ORG, 'logo' => ['@type' => 'ImageObject', 'url' => SH_SITE . '/SMART-HUB-LOGO-ORIGINAL.png']],
            'articleSection' => $item['category'] ?? null, 'inLanguage' => 'en-GH',
            'datePublished' => $published, 'dateModified' => $modified,
        ], fn($v) => $v !== null);
    } else {
        $schemas[] = [
            '@context' => 'https://schema.org', '@type' => 'WebPage', '@id' => "$canonical#webpage",
            'name' => $title, 'description' => $description, 'url' => $canonical, 'image' => $image, 'inLanguage' => 'en-GH',
        ];
    }
    $jsonLd = json_encode($schemas, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP);

    $tags = [
        '<title>' . $a($title) . '</title>',
        $meta('description', $description),
        $meta('robots', 'index, follow, max-image-preview:large'),
        '<link rel="canonical" href="' . $a($canonical) . '" />',
        $meta('og:type', $isPost ? 'article' : 'website', true),
        $meta('og:site_name', SH_SITE_NAME, true),
        $meta('og:locale', 'en_GH', true),
        $meta('og:title', $title, true),
        $meta('og:description', $description, true),
        $meta('og:url', $canonical, true),
        $meta('og:image', $image, true),
        $meta('og:image:alt', $imageAlt, true),
        $meta('twitter:card', 'summary_large_image'),
        $meta('twitter:title', $title),
        $meta('twitter:description', $description),
        $meta('twitter:url', $canonical),
        $meta('twitter:image', $image),
        $meta('twitter:image:alt', $imageAlt),
    ];
    if ($published) $tags[] = $meta('article:published_time', $published, true);
    if ($modified) $tags[] = $meta('article:modified_time', $modified, true);
    $tags[] = '<script id="page-schema" type="application/ld+json">' . $jsonLd . '</script>';

    // Remove the template's own SEO tags, then add the live ones.
    $patterns = [
        '#<title>.*?</title>\s*#is',
        '#<meta\s+name="(?:description|robots|twitter:[^"]*)"[^>]*>\s*#i',
        '#<meta\s+property="(?:og:[^"]*|article:[^"]*)"[^>]*>\s*#i',
        '#<link\s+rel="canonical"[^>]*>\s*#i',
        '#<script\s+id="page-schema"[^>]*>.*?</script>\s*#is',
    ];
    $html = preg_replace($patterns, '', $html) ?? $html;
    return preg_replace('#</head>#i', '    ' . implode("\n    ", $tags) . "\n  </head>", $html, 1) ?? $html;
}
