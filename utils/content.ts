import { useSyncExternalStore } from 'react';
import { blogData, galleryData, leadershipData, partnersData, projectsData, siteSettings } from '../data';
import { SiteContent } from '../types';
import { getAssetPath } from './assetPath';

// The built-in content renders the prerendered HTML and is the fallback when the API is unreachable.
const builtIn: SiteContent = {
  projects: projectsData,
  blog: blogData,
  partners: partnersData,
  leadership: leadershipData,
  gallery: galleryData,
  settings: siteSettings
};

let current: SiteContent = builtIn;
let live = false;
let request: Promise<void> | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach(listener => listener());

export const getContent = (): SiteContent => current;
export const isLiveContent = (): boolean => live;

/** Loads the published content from the admin API once per page load. */
export function loadLiveContent(force = false): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (request && !force) return request;
  request = fetch(getAssetPath('/api/content.php'), { headers: { Accept: 'application/json' }, cache: 'no-store' })
    .then(response => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
    .then((data: Partial<SiteContent>) => {
      current = {
        projects: Array.isArray(data.projects) ? data.projects : builtIn.projects,
        blog: Array.isArray(data.blog) ? data.blog : builtIn.blog,
        partners: Array.isArray(data.partners) ? data.partners : builtIn.partners,
        leadership: Array.isArray(data.leadership) ? data.leadership : builtIn.leadership,
        gallery: Array.isArray(data.gallery) ? data.gallery : builtIn.gallery,
        // Saved settings replace the defaults entirely, so cleared fields stay cleared.
        settings: data.settings && Object.keys(data.settings).length ? (data.settings as SiteContent["settings"]) : builtIn.settings
      };
    })
    .catch(() => { /* Keep the built-in content. */ })
    .finally(() => { live = true; emit(); });
  return request;
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export function useContent(): SiteContent {
  return useSyncExternalStore(subscribe, getContent, () => builtIn);
}

/** True once the live request has finished (successfully or not). */
export function useContentReady(): boolean {
  return useSyncExternalStore(subscribe, isLiveContent, () => false);
}
