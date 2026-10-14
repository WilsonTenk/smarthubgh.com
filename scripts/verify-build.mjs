import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const root=path.resolve(process.argv[2] || 'dist');
const preview=process.argv.includes('--preview');
const base=preview?'/smarthubgh/':'/';
const sitemap=await readFile(path.join(root,'sitemap.xml'),'utf8');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
assert.equal(urls.length,20);
assert.equal(new Set(urls).size,20);
const titles=new Set();
for(const url of urls){
  assert(url.startsWith('https://smarthubgh.com/'));
  const native=new URL(url).pathname;
  const html=await readFile(path.join(root,native.slice(1),'index.html'),'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1,`${native} heading`);
  assert(html.includes('id="root"')&&html.includes('<main'),`${native} content`);
  const title=html.match(/<title>(.*?)<\/title>/)?.[1];
  assert(title&&!titles.has(title),`${native} unique title`);titles.add(title);
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  assert(html.includes(`rel="canonical" href="${url}"`));
  assert(html.includes(preview?'noindex, follow':'index, follow'));
  assert(!html.includes('GEMINI_API_KEY'));
  const schema=html.match(/<script id="page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert(schema); assert(Array.isArray(JSON.parse(schema)));
  const bootstrap=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  const hash=createHash('sha256').update(bootstrap).digest('base64');
  assert(html.includes(`sha256-${hash}`),`${native} script policy`);
  for(const match of html.matchAll(/\s(?:src|href)="([^"#]+)"/g)){
    const target=match[1].replaceAll('&amp;','&');
    if(!target.startsWith(base))continue;
    const local=decodeURIComponent(target.slice(base.length).split(/[?#]/)[0]);
    await access(path.join(root,local));
  }
}
const notFound=await readFile(path.join(root,'404.html'),'utf8');
assert(notFound.includes('noindex, follow'));
assert(!notFound.includes('location.replace'));
const robots=await readFile(path.join(root,'robots.txt'),'utf8');
assert(robots.includes(preview?'Disallow: /':'Sitemap: https://smarthubgh.com/sitemap.xml'));
const htaccess=await readFile(path.join(root,'.htaccess'),'utf8');
assert(htaccess.includes('frame-ancestors')&&!htaccess.includes('__CSP__')&&!htaccess.includes('__BASE__'));
console.log(`Verified ${urls.length} prerendered ${preview?'preview':'production'} routes, metadata, schemas, CSP hashes and asset/link targets.`);
