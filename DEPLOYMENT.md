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
