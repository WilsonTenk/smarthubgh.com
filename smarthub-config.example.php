<?php
// Copy this file to smarthub-config.php and fill in your database details.
// On cPanel put it in your home folder (for example /home/twinkleh/smarthub-config.php),
// outside public_html. The API looks for it in the parent folders of dist/api.
// Never commit smarthub-config.php to Git.

return [
    // cPanel > MySQL Databases: create a database and a user, and give the user ALL PRIVILEGES on it.
    'dsn' => 'mysql:host=localhost;dbname=twinkleh_smarthub;charset=utf8mb4',
    'db_user' => 'twinkleh_smarthub',
    'db_pass' => 'change-me',

    // For local testing without MySQL you can use SQLite instead:
    // 'dsn' => 'sqlite:' . __DIR__ . '/smarthub-local.sqlite',
];
