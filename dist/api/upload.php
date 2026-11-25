<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';

sh_method('POST');
sh_require_admin();

$file = $_FILES['file'] ?? null;
if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    $tooBig = in_array($file['error'] ?? 0, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true);
    sh_fail(400, $tooBig ? 'That image is too large for the server.' : 'No image was received.');
}
if ($file['size'] > 12 * 1024 * 1024) sh_fail(400, 'Images must be 12 MB or smaller.');

// Trust the image bytes, not the file name.
$info = @getimagesize($file['tmp_name']);
$types = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp', IMAGETYPE_GIF => 'gif'];
if (!$info || !isset($types[$info[2]])) sh_fail(400, 'Please upload a JPG, PNG, WebP or GIF image.');

$root = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads';
$folder = gmdate('Y') . '/' . gmdate('m');
$dir = $root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $folder);
if (!is_dir($dir) && !mkdir($dir, 0755, true)) sh_fail(500, 'The upload folder could not be created.');

// Files in uploads are only ever served as static images, never run as code.
$guard = $root . DIRECTORY_SEPARATOR . '.htaccess';
if (!is_file($guard)) {
    file_put_contents($guard, implode("\n", [
        'Options -Indexes -ExecCGI',
        'RemoveHandler .php .phtml .phar .php3 .php4 .php5 .php7 .php8',
        'RemoveType .php .phtml .phar',
        '<FilesMatch "(?i)\.(?!(?:jpe?g|png|webp|gif)$)[^.]+$">',
        '  Require all denied',
        '</FilesMatch>',
        '<IfModule mod_php.c>',
        '  php_flag engine off',
        '</IfModule>',
        '',
    ]));
}

$base = substr(sh_slug(pathinfo((string) $file['name'], PATHINFO_FILENAME)), 0, 60);
$name = $base . '-' . bin2hex(random_bytes(4)) . '.' . $types[$info[2]];
$target = $dir . DIRECTORY_SEPARATOR . $name;
if (!move_uploaded_file($file['tmp_name'], $target)) sh_fail(500, 'The image could not be saved.');
@chmod($target, 0644);

sh_json(['url' => '/uploads/' . $folder . '/' . $name, 'width' => $info[0], 'height' => $info[1]]);
