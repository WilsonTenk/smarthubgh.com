# SMART Hub GH website

React/Vite website for SMART Youth Connekt in Ghana, with static HTML for every
page and responsive media. Production uses https://smarthubgh.com/ on cPanel.

## Run and check

```sh
npm ci
npm run dev
npm run check
npm run build
npm run verify:build
npm audit
```

Development serves the site at the root path. Images are prepared automatically
before development and production builds; original photographs remain preserved.
The website does not require an API key or a running Node server after building.

Read [DEPLOYMENT.md](DEPLOYMENT.md) for cPanel deployment, security headers,
Search Console submission, and the separate GitHub Pages preview.
