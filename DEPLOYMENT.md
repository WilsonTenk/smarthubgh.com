# Production: smarthubgh.com on cPanel

The committed dist directory contains the production site: prerendered HTML,
compiled JavaScript and CSS, responsive images, sitemap.xml, robots.txt, and
Apache rules in .htaccess. No Node process is needed on the public server.

## Hosting configuration

Use master in cPanel Git Version Control. This checkout is stored at:
/home/twinkleh/public_html/smarthubgh.com

In cPanel Domains, the document root for smarthubgh.com must be:
/public_html/smarthubgh.com/dist

The domain serves only the built dist directory. The repository's source files
and Git metadata stay outside the domain's document root.

## Publish changes

1. Run npm ci, npm run check, npm run build, and npm run verify:build locally.
2. Commit source changes together with the regenerated dist directory and push master.
3. In cPanel Git Version Control, open Manage > Pull or Deploy > Update from Remote.
4. Choose Deploy HEAD Commit to validate the build and set readable permissions.

The .cpanel.yml checks for production HTML, assets, and .htaccess, and sets files
and directories readable by Apache. Since the domain points directly at dist,
a successful pull updates the site without copying files over the source checkout.

For a manual upload, upload the contents of dist, including hidden files, into
the domain's actual document root. Do not serve the source index.html or index.tsx.

After deployment, check the homepage, an internal page, and sitemap.xml. The
production build must load compiled files from /assets/, not /index.tsx.

## Admin panel (/admin)

The site has an admin at https://smarthubgh.com/admin for blog posts, projects,
gallery photos, the team, partners and contact details. Changes are saved to
MySQL through a small PHP API in dist/api and appear on the live site straight
away, with no rebuild. The pages still ship with the content from data.ts built
in, so they render (and Google can read them) even if the API is down; once a
page loads it switches to the live content from the database.

Requirements: PHP 8.0 or newer with PDO MySQL (cPanel > Select PHP Version).

### First-time setup

1. cPanel > MySQL Databases: create a database and a user, and add the user to
   the database with ALL PRIVILEGES.
2. Copy smarthub-config.example.php to /home/twinkleh/smarthub-config.php
   (your home folder, outside public_html) and fill in the database name,
   user and password. The API finds it by searching the folders above dist/api.
3. Deploy as usual (pull and Deploy HEAD Commit).
4. Open https://smarthubgh.com/api/install.php, choose an admin username and
   password. This creates the tables, copies the current website content
   (dist/api/seed.json, generated from data.ts at build time) into the database
   and creates the admin account. It locks itself once an admin exists.
5. Sign in at https://smarthubgh.com/admin.

### Day to day

- Uploaded images are stored in dist/uploads/YYYY/MM on the server. That folder
  is not in Git, so pulls and deploys leave it alone. Back it up together with
  the database (cPanel > Backup).
- After setup the database is the source of truth. Editing data.ts only changes
  the built-in fallback and the prerendered HTML; it does not change the
  database. Make content changes in the admin.
- New blog posts and projects made in the admin are served by the app shell
  (see the rewrite rule in public/.htaccess). Run a build now and then
  if you want them prerendered for search engines: copy the content into
  data.ts first, or ask a developer to add a build step that reads the API.

### Testing the admin locally

1. Create smarthub-config.php in the project folder with
   `<?php return ['dsn' => 'sqlite:' . __DIR__ . '/smarthub-local.sqlite'];`
   (it is git-ignored), or point it at a local MySQL database.
2. Run npm run build, then serve dist with PHP:
   php -S 127.0.0.1:8000 -t dist
   (enable the pdo_sqlite or pdo_mysql extension). PHP's built-in server
   ignores .htaccess, so open /api/install.php and then /admin/ directly;
   for /admin without the trailing slash and new blog URLs, use a small router
   script that serves 404.html for those paths.
3. npm run dev also proxies /api and /uploads to 127.0.0.1:8000, so you can
   work on the React code with hot reload while the PHP server runs.
