import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputDirectory = path.join(root, 'public/media');
const cachePath = path.join(outputDirectory, '.image-cache.json');
const photoWidths = [480, 960, 1600];
const logoWidths = [96, 192, 384];
const partnerLogoWidths = [192, 384, 768];
const partnerLogos = new Set(['plan-international.jpg', 'kgl-foundation.png', 'developers-net.png', 'teleycare.jpg']);
const recipe = 'webp-q82-logo-lossless-effort4-auto-orient-v1';
const portraits = [
  'Benedicta Afrifah Baah.jpeg', 'Bright Vakpor.jpeg', 'Foster D. Kamasa.jpeg',
  'Josephine Nyator.jpeg', 'Rita Dzifa Katso.jpeg', 'Tamakloe Felrose.jpeg',
  'Victor Kofi Norgbedzi.jpeg', 'Zenas Fiagbe.jpeg'
];

// Keep large portrait decoding within the cloud machine's memory budget.
sharp.concurrency(2);
sharp.cache({ memory: 32, files: 0, items: 32 });
await mkdir(outputDirectory, { recursive: true });

let cache = {};
try { cache = JSON.parse(await readFile(cachePath, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }

const filenames = (await readdir(path.join(root, 'public/images')))
  .filter(name => /\.(?:jpe?g|png|webp)$/i.test(name)).sort();
const sources = new Map(filenames.map(name => [name, path.join(root, 'public/images', name)]));
for (const filename of portraits) {
  if (!sources.has(filename)) sources.set(filename, path.join(root, 'images', filename));
}
sources.set('SMART-HUB-LOGO-ORIGINAL.png', path.join(root, 'public/SMART-HUB-LOGO-ORIGINAL.png'));
for (const filename of partnerLogos) sources.set(filename, path.join(root, 'public/logos', filename));

let generated = 0;
let reused = 0;
const entries = [...sources];
let nextIndex = 0;

async function processImage(filename, sourcePath) {
  const source = await readFile(sourcePath);
  const isPartnerLogo = partnerLogos.has(filename);
  const fingerprint = createHash('sha256').update(isPartnerLogo ? 'partner-webp-lossless-effort4-auto-orient-v1' : recipe).update(source).digest('hex');
  const metadata = await sharp(source).metadata();
  const rotated = [5, 6, 7, 8].includes(metadata.orientation);
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  const targets = isPartnerLogo ? partnerLogoWidths : filename === 'SMART-HUB-LOGO-ORIGINAL.png' ? logoWidths : photoWidths;
  const widths = [...new Set(targets.map(target => Math.min(target, width)))];

  for (const variantWidth of widths) {
    const destination = path.join(outputDirectory, `${filename}-${variantWidth}.webp`);
    let exists = false;
    try { exists = (await stat(destination)).size > 0; }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (cache[filename]?.fingerprint === fingerprint && exists) {
      reused++;
      continue;
    }
    // Resize and encode only; preserve the full frame, colour and orientation.
    await sharp(source).rotate().resize({ width: variantWidth, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4, lossless: isPartnerLogo || filename === 'SMART-HUB-LOGO-ORIGINAL.png' }).toFile(destination);
    generated++;
  }
  cache[filename] = { fingerprint, width, height, widths };
}

await Promise.all(Array.from({ length: 2 }, async () => {
  while (nextIndex < entries.length) {
    const [filename, sourcePath] = entries[nextIndex++];
    await processImage(filename, sourcePath);
  }
}));

await writeFile(cachePath, JSON.stringify(cache, null, 2) + '\n');
console.log(`Responsive images: ${generated} generated, ${reused} unchanged (${sources.size} originals preserved).`);
