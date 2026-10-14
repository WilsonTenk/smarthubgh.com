# Production: smarthubgh.com on cPanel

The committed `dist` directory is the production site. It contains HTML for all
20 routes, canonical URLs on https://smarthubgh.com/, responsive images,
`robots.txt`, `sitemap.xml`, and Apache security/caching rules in `.htaccess`.
It requires no Node process on the public server.

In cPanel **Git Version Control**, use this repository's **master** branch,
open **Manage → Pull or Deploy**, choose **Update from
Remote**, then **Deploy HEAD**. The repository's `.cpanel.yml` runs
`deploy/cpanel.sh`, which asks cPanel for smarthubgh.com's actual document root,
backs up overwritten files outside the public directory, and copies the built
site including `.htaccess`. Published files use mode `644` and their directories
use `755` so Apache can read styles, scripts, fonts, and images. It retains
unrelated server files. The **gh-pages** branch serves only the GitHub Pages
preview; use **master** for this domain. If the domain
already points directly to the committed `dist` directory, pulling the commit is
enough. The script stops when domain lookup or build validation fails.

If deploying manually, upload the **contents** of `dist`, including hidden files,
to the domain's document root shown under cPanel **Domains**. Apache 2.4 with
`mod_headers`, `mod_rewrite`, and `mod_deflate` enables headers, redirects, and
compression. Verify those server capabilities before claiming they are active.
The build does not replace cPanel account security, server patching, TLS setup,
or hosting access controls.

After deployment, check https://smarthubgh.com/sitemap.xml and the Reach for Her
article directly. Known routes must return 200 after any directory slash redirect;
unknown URLs must return 404. In the **smarthubgh.com** Search Console property,
submit `https://smarthubgh.com/sitemap.xml`, inspect key URLs, and request indexing.
Search Console verification and Google's indexing decisions require the site
owner's account; neither can be guaranteed by code changes.

## Development and builds

Run `npm ci`, `npm run check`, and `npm run build`. The build generates responsive
media from preserved original photos, renders HTML, and generates metadata from
the same route inventory as the app. Keep secrets on the server; this static
site does not need a Gemini/API key. `npm audit` checks both runtime and build
dependencies. Re-run it when dependencies change.

For the separate GitHub Pages preview, build with
`VITE_BASE_PATH=/smarthubgh/ VITE_NOINDEX=true npm run build -- --outDir <preview-dir>`.
Preview pages keep canonical URLs on smarthubgh.com and carry `noindex`, preventing
the preview from competing with the production site.
