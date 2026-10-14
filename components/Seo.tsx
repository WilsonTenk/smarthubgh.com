import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageSeo, serializeJsonLd, SITE_NAME } from '../utils/seo';

function setMeta(attribute: 'name' | 'property', key: string, content?: string): void {
  const selector = `meta[${attribute}="${key}"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(selector);
  if (!content) {
    existing?.remove();
    return;
  }
  const element = existing || document.createElement('meta');
  element.setAttribute(attribute, key);
  element.content = content;
  if (!existing) document.head.appendChild(element);
}

const Seo = (): null => {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getPageSeo(pathname);
    document.title = seo.title;
    setMeta('name', 'description', seo.description);
    setMeta('name', 'robots', `${seo.robots}, max-image-preview:large`);
    setMeta('property', 'og:type', seo.type);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:locale', 'en_GH');
    setMeta('property', 'og:title', seo.title);
    setMeta('property', 'og:description', seo.description);
    setMeta('property', 'og:url', seo.canonical);
    setMeta('property', 'og:image', seo.image);
    setMeta('property', 'og:image:alt', seo.imageAlt);
    setMeta('property', 'article:published_time', seo.publishedTime);
    setMeta('property', 'article:modified_time', seo.modifiedTime);
    // Replace legacy property-style Twitter tags with their standard name form.
    for (const key of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:url', 'twitter:image', 'twitter:image:alt']) {
      document.head.querySelector(`meta[property="${key}"]`)?.remove();
    }
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', seo.title);
    setMeta('name', 'twitter:description', seo.description);
    setMeta('name', 'twitter:url', seo.canonical);
    setMeta('name', 'twitter:image', seo.image);
    setMeta('name', 'twitter:image:alt', seo.imageAlt);

    const existingCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const canonical = existingCanonical || document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = seo.canonical;
    if (!existingCanonical) document.head.appendChild(canonical);

    const existingSchema = document.getElementById('page-schema');
    if (seo.schemas.length) {
      const script = existingSchema || document.createElement('script');
      script.id = 'page-schema';
      script.setAttribute('type', 'application/ld+json');
      script.textContent = serializeJsonLd(seo.schemas);
      if (!existingSchema) document.head.appendChild(script);
    } else {
      existingSchema?.remove();
    }
  }, [pathname]);

  return null;
};

export default Seo;
