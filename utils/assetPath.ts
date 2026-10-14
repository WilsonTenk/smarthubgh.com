/**
 * Returns the correct URL for a public asset, prepending the Vite base URL.
 * This ensures images load correctly both locally and on GitHub Pages.
 * @param path - The path to the asset, starting with '/' (e.g., '/images/photo.jpg')
 */
export function getAssetPath(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  // Remove leading slash from path, add it to base
  return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}
