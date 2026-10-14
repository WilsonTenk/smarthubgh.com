import { getAssetPath } from './assetPath';
import { getImageDimensions } from './imageDimensions';

// These portraits are stored in the checkout's images directory. The media
// preparation script includes them alongside the public project photographs.
const additionalDimensions: Record<string, { width: number; height: number }> = {
  'SMART-HUB-LOGO-ORIGINAL.png': { width: 1080, height: 1080 },
  'plan-international.jpg': { width: 3141, height: 1688 },
  'kgl-foundation.png': { width: 3849, height: 1401 },
  'developers-net.png': { width: 1662, height: 810 },
  'teleycare.jpg': { width: 3508, height: 2482 },
  'Benedicta Afrifah Baah.jpeg': { width: 1061, height: 1080 },
  'Bright Vakpor.jpeg': { width: 1638, height: 2048 },
  'Foster D. Kamasa.jpeg': { width: 7000, height: 10500 },
  'Josephine Nyator.jpeg': { width: 3024, height: 4032 },
  'Rita Dzifa Katso.jpeg': { width: 768, height: 1024 },
  'Tamakloe Felrose.jpeg': { width: 1080, height: 1813 },
  'Victor Kofi Norgbedzi.jpeg': { width: 695, height: 1024 },
  'Zenas Fiagbe.jpeg': { width: 4480, height: 6720 }
};

const partnerLogoNames = new Set(['plan-international.jpg', 'kgl-foundation.png', 'developers-net.png', 'teleycare.jpg']);

/** Responsive derivatives use the original photo's composition and aspect ratio. */
export function getResponsiveImageProps(src: string, sizes = '100vw') {
  // Remote assets and unknown files keep their original URLs.
  if (/^(?:https?:|data:|blob:)/i.test(src)) return { src };

  const filename = decodeURIComponent(src.split('/').pop() || '');
  const dimensions = getImageDimensions(src) || additionalDimensions[filename];
  if (!dimensions) return { src };

  const targets = partnerLogoNames.has(filename) ? [192, 384, 768] : filename === 'SMART-HUB-LOGO-ORIGINAL.png' ? [96, 192, 384] : [480, 960, 1600];
  const widths = [...new Set(targets.map(width => Math.min(width, dimensions.width)))];
  const variantUrl = (width: number) => getAssetPath(`/media/${encodeURIComponent(filename)}-${width}.webp`);

  return {
    src: variantUrl(widths[widths.length - 1]),
    srcSet: widths.map(width => `${variantUrl(width)} ${width}w`).join(', '),
    sizes,
    width: dimensions.width,
    height: dimensions.height
  };
}
