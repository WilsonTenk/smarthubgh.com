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
gallery photos, the team, partners and contact details. Changes appear on the
live site straight away, with no rebuild.

No database is used. The admin's PHP files (dist/api) save everything as JSON
files in a private folder called smarthub-data, next to dist/:

    /home/twinkleh/public_html/smarthubgh.com/smarthub-data/
      content.json.php   all website content
      users.json.php     admin logins (passwords are stored hashed)
      attempts.json.php  recent failed sign-ins (for the 15-minute lockout)

The folder is outside the domain's document root (dist), is blocked with its own
.htaccess, and each file starts with a PHP exit line, so its contents are never
shown in a browser. It is not in Git, so pulls and deploys leave it alone.

The pages still ship with the content from data.ts built in, so they render
(and Google can read them) even if the API is unavailable; once a page loads
it switches to the live content saved by the admin.

Requirements: PHP 8.0 or newer (cPanel > Select PHP Version). PHP must be able
to create and write the smarthub-data and dist/uploads folders, which is the
normal setup on cPanel.

### First-time setup

1. Deploy as usual (pull and Deploy HEAD Commit).
2. Open https://smarthubgh.com/api/install.php and choose an admin username and
   password. This creates the smarthub-data folder, copies the current website
   content into it (from dist/api/seed.json, generated from data.ts at build
   time) and creates the admin account. It locks itself once an admin exists.
3. Sign in at https://smarthubgh.com/admin.

To keep the data in a different folder (for example /home/twinkleh/smarthub-data),
copy smarthub-config.example.php to smarthub-config.php in the project folder
and set data_dir. This is optional.

### Day to day

- Back up two folders: smarthub-data (the content and logins) and dist/uploads
  (uploaded images). cPanel > Backup or File Manager > Compress both work.
- Forgot the admin password? In File Manager, delete smarthub-data/users.json.php
  and open /api/install.php again to create a new admin. The content is kept.
- After setup, the admin's saved content is the source of truth. Editing data.ts
  only changes the built-in fallback and the prerendered HTML; it does not change
  what the admin saved. Make content changes in the admin.
- Blog posts and projects added in the admin are served by the app shell (see the
  rewrite rule in public/.htaccess), so they work for visitors but are not
  prerendered for search engines.

### Testing the admin locally

1. Run npm run build, then serve dist with PHP:
   php -S 127.0.0.1:8000 -t dist
   PHP's built-in server ignores .htaccess, so open /api/install.php and then
   /admin/ directly. For /admin without the trailing slash and new blog URLs,
   use a small router script that serves 404.html for those paths.
2. Local data goes in smarthub-data/ in the project folder (git-ignored).
3. npm run dev also proxies /api and /uploads to 127.0.0.1:8000, so you can
   work on the React code with hot reload while the PHP server runs.
