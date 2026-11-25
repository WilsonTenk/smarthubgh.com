<?php
// OPTIONAL. The admin works without this file.
//
// By default the admin stores its data (content, admin logins, failed sign-ins)
// as JSON files in a "smarthub-data" folder next to dist/, which is outside the
// website's document root. To keep the data somewhere else, copy this file to
// smarthub-config.php (in the project folder or any folder above dist/) and set
// data_dir. Never commit smarthub-config.php to Git.

return [
    // For example a folder in your cPanel home, outside public_html:
    'data_dir' => '/home/twinkleh/smarthub-data',
];
