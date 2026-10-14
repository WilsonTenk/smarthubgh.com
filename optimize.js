import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.join(__dirname, 'public/images');
const distDirectoryPath = path.join(__dirname, 'dist/images');

async function optimizeImages(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) continue;

    // Only process images > 500KB
    if (stat.size > 500 * 1024) {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        try {
          const tempPath = fullPath + '.tmp';
          let image = sharp(fullPath);
          
          const metadata = await image.metadata();
          // Resize if width > 1920
          if (metadata.width > 1920) {
            image = image.resize({ width: 1920, withoutEnlargement: true });
          }
          
          if (ext === '.jpg' || ext === '.jpeg') {
            await image.jpeg({ quality: 80 }).toFile(tempPath);
          } else if (ext === '.png') {
            await image.png({ quality: 80, compressionLevel: 8 }).toFile(tempPath);
          }
          
          fs.renameSync(tempPath, fullPath);
          console.log(`Optimized: ${file} (from ${(stat.size / 1024 / 1024).toFixed(2)} MB to ${(fs.statSync(fullPath).size / 1024 / 1024).toFixed(2)} MB)`);
        } catch (err) {
          console.error(`Error processing ${file}:`, err);
        }
      }
    }
  }
}

async function run() {
  console.log('Optimizing public/images...');
  await optimizeImages(directoryPath);
  console.log('Done optimizing.');
}

run();
