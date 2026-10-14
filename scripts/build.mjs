import { build, createServer } from 'vite';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const outArg = args.indexOf('--outDir');
const outDir = path.resolve(root, outArg >= 0 ? args[outArg + 1] : 'dist');
if (args.some(arg => !['--outDir', '--emptyOutDir', args[outArg + 1]].includes(arg))) throw new Error('Unsupported build argument');
await build({ root, build: { outDir, emptyOutDir: true } });

const template = await readFile(path.join(outDir, 'index.html'), 'utf8');
const bootstrap = template.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (!bootstrap || !template.includes('<div id="root"></div>')) throw new Error('Unexpected HTML template');
const hash = createHash('sha256').update(bootstrap).digest('base64');
const policy = `default-src 'self'; script-src 'self' 'sha256-${hash}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'`;
const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const meta = (name, content, property = false) => `<meta ${property ? 'property' : 'name'}="${escape(name)}" content="${escape(content)}" />`;

const server = await createServer({root,server:{middlewareMode:true},appType:'custom'});
try {
  const renderer = await server.ssrLoadModule('/scripts/render.tsx');
  for (const route of [...renderer.getSeoRoutes(), '/404']) {
    const seo = renderer.getPageSeo(route);
    const tags = [
      `<title>${escape(seo.title)}</title>`, meta('description',seo.description),meta('robots',`${seo.robots}, max-image-preview:large`),
      ...(process.env.VITE_GOOGLE_SITE_VERIFICATION ? [meta('google-site-verification',process.env.VITE_GOOGLE_SITE_VERIFICATION)] : []),
      `<link rel="canonical" href="${escape(seo.canonical)}" />`,
      ...Object.entries({'og:type':seo.type,'og:site_name':'SMART HUB GH','og:locale':'en_GH','og:title':seo.title,'og:description':seo.description,'og:url':seo.canonical,'og:image':seo.image,'og:image:alt':seo.imageAlt}).map(([name,value])=>meta(name,value,true)),
      ...Object.entries({'twitter:card':'summary_large_image','twitter:title':seo.title,'twitter:description':seo.description,'twitter:url':seo.canonical,'twitter:image':seo.image,'twitter:image:alt':seo.imageAlt}).map(([name,value])=>meta(name,value)),
      ...(seo.publishedTime?[meta('article:published_time',seo.publishedTime,true)]:[]),
      ...(seo.modifiedTime?[meta('article:modified_time',seo.modifiedTime,true)]:[]),
      ...(seo.schemas.length?[`<script id="page-schema" type="application/ld+json">${renderer.serializeJsonLd(seo.schemas)}</script>`]:[])
    ].join('\n    ');
    const markup = renderer.render(route);
    const html = template.replace('<!-- page-seo -->', tags)
      .replace('<!-- security-policy -->', meta('Content-Security-Policy',policy).replace('name=', 'http-equiv='))
      .replace('<div id="root"></div>', `<div id="root"${route === '/404' ? ' data-error-page="true"' : ''}>${markup}</div>`);
    const destination = route === '/404' ? path.join(outDir,'404.html') : path.join(outDir,route === '/' ? '' : route.slice(1),'index.html');
    await mkdir(path.dirname(destination),{recursive:true});
    await writeFile(destination,html.split('\n').map(line=>line.trimEnd()).join('\n').trimEnd()+'\n');
  }
  const sitemap = renderer.getSeoRoutes().map(route=>{
    const seo=renderer.getPageSeo(route);
    const modified=seo.modifiedTime || seo.publishedTime;
    return `  <url><loc>${escape(seo.canonical)}</loc>${modified?`<lastmod>${modified}</lastmod>`:''}</url>`;
  }).join('\n');
  await writeFile(path.join(outDir,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`);
  const preview = process.env.VITE_NOINDEX === 'true';
  await writeFile(path.join(outDir,'robots.txt'),preview?'User-agent: *\nDisallow: /\n':`User-agent: *\nAllow: /\nSitemap: ${renderer.SITE_URL}/sitemap.xml\n`);
  const base=process.env.VITE_BASE_PATH || '/';
  const htaccess=(await readFile(path.join(root,'public/.htaccess'),'utf8')).replaceAll('__CSP__',`${policy}; frame-ancestors 'self'`).replaceAll('__BASE__',base);
  await writeFile(path.join(outDir,'.htaccess'),htaccess);
  await writeFile(path.join(outDir,'.nojekyll'),'');
  console.log(`Prerendered ${renderer.getSeoRoutes().length} pages, sitemap, robots and security rules.`);
} finally {await server.close();}

// The source photographs remain untouched; the deployable fallback copies are smaller.
const filenames=(await readdir(path.join(root,'public/images'))).filter(name=>/\.(?:jpe?g|png)$/i.test(name));
let next=0;
await Promise.all(Array.from({length:2},async()=>{
  while(next<filenames.length){
    const name=filenames[next++];
    const input=path.join(root,'public/images',name), output=path.join(outDir,'images',name);
    let image=sharp(input).rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true});
    image=/\.png$/i.test(name)?image.png({compressionLevel:9}):image.jpeg({quality:85});
    await writeFile(output,await image.toBuffer());
  }
}));
await rm(path.join(outDir,'media/.image-cache.json'),{force:true});
