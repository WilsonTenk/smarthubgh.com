import { useSyncExternalStore } from 'react';

const query = '(prefers-reduced-motion: reduce)';
const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

// Subscribe to changes as well as the initial preference, including while the page is open.
export const usePrefersReducedMotion = (): boolean => useSyncExternalStore(
  subscribe,
  () => window.matchMedia(query).matches,
  () => false
);
