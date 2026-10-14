import { blogData, projectsData } from '../data';

export const SITE_NAME = 'SMART HUB GH';
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://smarthubgh.com').replace(/\/+$/, '');
const organizationName = 'SMART Youth Connekt (SMART Hub)';
const homeDescription = 'SMART Hub connects young people in Ghana with health education, digital skills, youth advocacy, and opportunities to build stronger communities.';

export type StructuredData = Record<string, unknown>;

export interface PageSeo {
  path: string;
  title: string;
  description: string;
  canonical: string;
  image: string;
  imageAlt: string;
  robots: 'index, follow' | 'noindex, follow';
  type: 'website' | 'article';
  schemas: StructuredData[];
  publishedTime?: string;
  modifiedTime?: string;
}

// The canonical site uses native routes even when a preview is mounted at /smarthubgh.
export function normalizePathname(pathname: string): string {
  let path = pathname.split(/[?#]/, 1)[0] || '/';
  if (/^https?:\/\//i.test(pathname)) path = new URL(pathname).pathname;
  path = `/${path.replace(/^\/+/, '')}`.replace(/\/{2,}/g, '/');
  path = path.replace(/^\/smarthubgh(?=\/|$)/, '') || '/';
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return new URL(path).href;
  const nativePath = path.replace(/^\/smarthubgh(?=\/|$)/, '');
  return new URL(nativePath.replace(/^\/+/, ''), `${SITE_URL}/`).href;
}

const canonicalUrl = (path: string): string => absoluteUrl(path === '/' ? '/' : `${path}/`);
const organizationId = `${canonicalUrl('/')}#organization`;
const websiteId = `${canonicalUrl('/')}#website`;
const defaultImage = absoluteUrl('/SMART-HUB-LOGO-ORIGINAL.png');

export function getSeoRoutes(): string[] {
  return [
    '/', '/about', '/projects', '/gallery', '/blog', '/contact',
    ...projectsData.map(project => `/projects/${project.id}`),
    ...blogData.map(post => `/blog/${post.id}`)
  ];
}

// Reject partial dates and invalid calendar dates rather than inventing a day or time.
export function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const iso = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const written = value.trim().match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);
  if (!iso && !written) return undefined;
  const year = Number(iso ? iso[1] : written![3]);
  const month = iso ? Number(iso[2]) : months.indexOf(written![1].toLowerCase()) + 1;
  const day = Number(iso ? iso[3] : written![2]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined;
  return date.toISOString().slice(0, 10);
}

export function serializeJsonLd(value: unknown): string {
  return (JSON.stringify(value) ?? 'null')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

const conciseDescription = (value: string): string => {
  const text = value.replace(/\s+/g, ' ').trim();
  return text.length <= 160 ? text : `${text.slice(0, 157).replace(/\s+\S*$/, '')}…`;
};

const organization: StructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': organizationId,
  name: organizationName,
  alternateName: SITE_NAME,
  url: canonicalUrl('/'),
  logo: defaultImage,
  description: homeDescription
};

const standardPages: Record<string, { title: string; description: string; label: string; collection?: boolean }> = {
  '/': { title: 'SMART Hub GH | Youth Health, Education & Advocacy in Ghana', description: homeDescription, label: 'Home' },
  '/about': { title: 'About SMART Hub GH | Youth Empowerment in Ghana', description: 'Learn about SMART Hub’s mission, values, leadership, and work supporting youth health, education, and community advocacy in Ghana.', label: 'About' },
  '/projects': { title: 'Community Projects | SMART Hub GH', description: 'Explore SMART Hub projects supporting menstrual dignity, adolescent health, digital skills, and youth empowerment in communities across Ghana.', label: 'Projects', collection: true },
  '/gallery': { title: 'Project Photo Gallery | SMART Hub GH', description: 'View photographs from SMART Hub community projects, school activities, health education, and youth skills programmes in Ghana.', label: 'Gallery' },
  '/blog': { title: 'News, Stories & Project Updates | SMART Hub GH', description: 'Read SMART Hub stories and project updates on menstrual health, digital skills, youth advocacy, and community engagement in Ghana.', label: 'Blog', collection: true },
  '/contact': { title: 'Contact & Support SMART Hub GH', description: 'Contact SMART Hub in Ho, Ghana, to volunteer, partner, or support youth health, education, and community projects.', label: 'Contact' }
};

function breadcrumbs(path: string, label: string): StructuredData {
  const items = [{ name: 'Home', item: canonicalUrl('/') }];
  if (path.startsWith('/projects/')) items.push({ name: 'Projects', item: canonicalUrl('/projects') });
  if (path.startsWith('/blog/')) items.push({ name: 'Blog', item: canonicalUrl('/blog') });
  items.push({ name: label, item: canonicalUrl(path) });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item }))
  };
}

export function getPageSeo(pathname: string): PageSeo {
  const path = normalizePathname(pathname);
  const standard = standardPages[path];
  const project = projectsData.find(item => path === `/projects/${item.id}`);
  const post = blogData.find(item => path === `/blog/${item.id}`);
  const known = Boolean(standard || project || post);
  const title = standard?.title || (project ? `${project.title} | SMART Hub Projects` : post ? `${post.title} | SMART Hub Blog` : 'Page Not Found | SMART Hub GH');
  const description = conciseDescription(standard?.description || project?.description || post?.excerpt || 'The requested page could not be found. Explore SMART Hub projects, stories, and community activities.');
  const canonical = canonicalUrl(path);
  const image = absoluteUrl(project?.image || post?.image || '/SMART-HUB-LOGO-ORIGINAL.png');
  const label = standard?.label || project?.title || post?.title || 'Page Not Found';
  const schemas: StructuredData[] = [];

  if (path === '/') {
    schemas.push(organization, {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId,
      name: SITE_NAME,
      url: canonical,
      description,
      publisher: { '@id': organizationId },
      inLanguage: 'en-GH'
    });
  } else if (known) {
    schemas.push(breadcrumbs(path, label));
    if (post) {
      const published = toIsoDate(post.date);
      const modified = toIsoDate(post.updatedAt);
      const institutionalByline = /smart/i.test(post.author);
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `${canonical}#article`,
        headline: post.title,
        description,
        url: canonical,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        image,
        author: institutionalByline ? { '@type': 'Organization', name: post.author } : { '@type': 'Organization', '@id': organizationId, name: organizationName },
        creditText: post.author,
        publisher: { '@type': 'Organization', '@id': organizationId, name: organizationName, logo: { '@type': 'ImageObject', url: defaultImage } },
        articleSection: post.category,
        inLanguage: 'en-GH',
        ...(published ? { datePublished: published } : {}),
        ...(modified ? { dateModified: modified } : {})
      });
    } else {
      const list = path === '/projects' ? projectsData.map(item => ({ name: item.title, url: canonicalUrl(`/projects/${item.id}`) })) : path === '/blog' ? blogData.map(item => ({ name: item.title, url: canonicalUrl(`/blog/${item.id}`) })) : undefined;
      schemas.push({
        '@context': 'https://schema.org',
        '@type': standard?.collection ? 'CollectionPage' : 'WebPage',
        '@id': `${canonical}#webpage`,
        name: title,
        description,
        url: canonical,
        image,
        isPartOf: { '@id': websiteId },
        about: { '@id': organizationId },
        inLanguage: 'en-GH',
        ...(list ? { mainEntity: { '@type': 'ItemList', itemListElement: list.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })) } } : {})
      });
    }
  }

  return {
    path, title, description, canonical, image,
    imageAlt: project?.imageAlt || post?.imageAlt || (project?.image ? project.title : post?.image ? post.title : 'SMART Hub GH logo'),
    robots: known && import.meta.env.VITE_NOINDEX !== 'true' ? 'index, follow' : 'noindex, follow',
    type: post ? 'article' : 'website',
    schemas,
    ...(post && toIsoDate(post.date) ? { publishedTime: toIsoDate(post.date) } : {}),
    ...(post && toIsoDate(post.updatedAt) ? { modifiedTime: toIsoDate(post.updatedAt) } : {})
  };
}
