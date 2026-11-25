import type { LucideIcon } from 'lucide-react';
import { FolderKanban, Handshake, Images, Newspaper, Phone, Users } from 'lucide-react';
import type { Item } from './api';

export type FieldKind = 'text' | 'textarea' | 'html' | 'select' | 'number' | 'image' | 'images' | 'captionedImages';

export interface Field {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Half width inside its card. */
  half?: boolean;
  /** Large heading-style input (used for titles). */
  big?: boolean;
}

export interface FieldGroup {
  title: string;
  description?: string;
  /** Shown in the right-hand column of the editor. */
  side?: boolean;
  fields: string[];
}

export type ListLayout = 'rows' | 'photos' | 'people' | 'logos';

export interface CollectionConfig {
  key: string;
  label: string;
  singular: string;
  description: string;
  icon: LucideIcon;
  layout: ListLayout;
  fields: Field[];
  groups: FieldGroup[];
  title: (item: Item) => string;
  subtitle?: (item: Item) => string;
  badge?: (item: Item) => string | undefined;
  image?: (item: Item) => string | undefined;
  viewUrl?: (item: Item) => string;
  newItem?: () => Item;
  singleton?: boolean;
  /** Whether the list order is used on the website (blog posts and projects are sorted by date). */
  sortable?: boolean;
}

const text = (value: unknown) => (typeof value === 'string' ? value : '');
const fit: Field = {
  key: 'imageFit', label: 'Image fit', kind: 'select',
  options: [{ value: '', label: 'Fill the frame (crop edges)' }, { value: 'contain', label: 'Show the whole image' }]
};
const idField = (what: string): Field => ({
  key: 'id', label: 'Web address', kind: 'text', placeholder: 'created-from-the-title',
  help: `The end of the ${what} link. Leave empty to create it from the title. Changing it breaks old links.`
});

export const today = () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export const collections: CollectionConfig[] = [
  {
    key: 'blog', label: 'Blog posts', singular: 'blog post', icon: Newspaper, layout: 'rows',
    description: 'Stories and news on the Blog page and the homepage.',
    title: item => text(item.title),
    subtitle: item => [text(item.date), text(item.author)].filter(Boolean).join(' · '),
    badge: item => text(item.category) || undefined,
    image: item => text(item.image) || undefined,
    viewUrl: item => `/blog/${text(item.id)}`,
    newItem: () => ({ date: today(), author: 'SMART HUB Media' }),
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true, big: true, placeholder: 'Give your story a title' },
      { key: 'excerpt', label: 'Short summary', kind: 'textarea', required: true, help: 'Shown on the blog list and in Google results. One or two sentences.' },
      { key: 'content', label: 'Article', kind: 'html', required: true },
      { key: 'galleryImages', label: 'Photos', kind: 'captionedImages' },
      { key: 'image', label: 'Cover image', kind: 'image' },
      { key: 'imageAlt', label: 'Image description', kind: 'text', help: 'Describe the photo for people using screen readers.' },
      { key: 'imageCaption', label: 'Caption', kind: 'text' },
      fit,
      { key: 'category', label: 'Category', kind: 'text', required: true, placeholder: 'Health, Education…' },
      { key: 'author', label: 'Author', kind: 'text', required: true },
      { key: 'date', label: 'Published', kind: 'text', placeholder: 'October 11, 2026', half: true },
      { key: 'updatedAt', label: 'Updated', kind: 'text', placeholder: 'Optional', half: true },
      idField('blog post')
    ],
    groups: [
      { title: 'Story', fields: ['title', 'excerpt', 'content'] },
      { title: 'Photo gallery', description: 'Optional photos shown under the article.', fields: ['galleryImages'] },
      { title: 'Cover image', side: true, fields: ['image', 'imageAlt', 'imageCaption', 'imageFit'] },
      { title: 'Details', side: true, fields: ['category', 'author', 'date', 'updatedAt', 'id'] }
    ]
  },
  {
    key: 'projects', label: 'Projects', singular: 'project', icon: FolderKanban, layout: 'rows',
    description: 'Projects on the Projects page, the homepage and the gallery.',
    title: item => text(item.title),
    subtitle: item => [text(item.period), text(item.sponsor)].filter(Boolean).join(' · '),
    badge: item => text(item.category) || undefined,
    image: item => text(item.image) || undefined,
    viewUrl: item => `/projects/${text(item.id)}`,
    newItem: () => ({ listedOn: new Date().toISOString().slice(0, 10) }),
    fields: [
      { key: 'title', label: 'Project name', kind: 'text', required: true, big: true, placeholder: 'Name of the project' },
      { key: 'description', label: 'Short description', kind: 'textarea', required: true, help: 'Shown on the project cards.' },
      { key: 'fullContent', label: 'Full description', kind: 'textarea', help: 'Shown on the project page. Leave a blank line between paragraphs.' },
      { key: 'sponsor', label: 'Sponsor / partner', kind: 'text', required: true, half: true },
      { key: 'reach', label: 'Reach', kind: 'text', required: true, placeholder: '395 participants', half: true },
      { key: 'communities', label: 'Communities', kind: 'text', required: true },
      { key: 'galleryImages', label: 'Photos', kind: 'images', help: 'These also appear on the Gallery page.' },
      { key: 'image', label: 'Main image', kind: 'image' },
      { key: 'imageAlt', label: 'Image description', kind: 'text' },
      fit,
      { key: 'category', label: 'Category', kind: 'text', placeholder: 'Menstrual Health & SRHR' },
      { key: 'period', label: 'Period', kind: 'text', placeholder: 'January – June 2026' },
      { key: 'completedOn', label: 'Completed', kind: 'text', placeholder: '2026-06', half: true },
      { key: 'listedOn', label: 'Added', kind: 'text', placeholder: '2026-10-11', half: true, help: '' },
      { key: 'relatedBlogId', label: 'Related blog post', kind: 'text', placeholder: 'blog-post-web-address', help: 'Optional: the web address of a blog post about this project.' },
      idField('project')
    ],
    groups: [
      { title: 'About the project', fields: ['title', 'description', 'fullContent'] },
      { title: 'Impact', fields: ['sponsor', 'reach', 'communities'] },
      { title: 'Photos', fields: ['galleryImages'] },
      { title: 'Main image', side: true, fields: ['image', 'imageAlt', 'imageFit'] },
      { title: 'Details', side: true, description: 'Projects are listed newest first by completion date.', fields: ['category', 'period', 'completedOn', 'listedOn', 'relatedBlogId', 'id'] }
    ]
  },
  {
    key: 'gallery', label: 'Gallery', singular: 'photo', icon: Images, layout: 'photos', sortable: true,
    description: 'Extra photos for the Gallery page. Project photos appear there automatically.',
    title: item => text(item.caption) || text(item.alt) || 'Untitled photo',
    image: item => text(item.src) || undefined,
    viewUrl: () => '/gallery',
    fields: [
      { key: 'src', label: 'Photo', kind: 'image', required: true },
      { key: 'caption', label: 'Caption', kind: 'text', placeholder: 'What is happening in this photo?' },
      { key: 'alt', label: 'Photo description', kind: 'text', help: 'Describe the photo for people using screen readers.' }
    ],
    groups: [
      { title: 'Photo', fields: ['src'] },
      { title: 'Text', side: true, fields: ['caption', 'alt'] }
    ]
  },
  {
    key: 'leadership', label: 'Team', singular: 'team member', icon: Users, layout: 'people', sortable: true,
    description: 'The leadership team on the About page.',
    title: item => text(item.name),
    subtitle: item => text(item.role),
    image: item => text(item.image) || undefined,
    viewUrl: () => '/about',
    fields: [
      { key: 'name', label: 'Full name', kind: 'text', required: true, big: true, placeholder: 'Full name' },
      { key: 'role', label: 'Role', kind: 'text', required: true, half: true },
      { key: 'occupation', label: 'Occupation', kind: 'text', half: true },
      { key: 'bio', label: 'Short bio', kind: 'textarea' },
      { key: 'image', label: 'Portrait', kind: 'image', required: true }
    ],
    groups: [
      { title: 'Profile', fields: ['name', 'role', 'occupation', 'bio'] },
      { title: 'Portrait', side: true, fields: ['image'] }
    ]
  },
  {
    key: 'partners', label: 'Partners', singular: 'partner', icon: Handshake, layout: 'logos', sortable: true,
    description: 'Partner logos in the scrolling strip on the About page.',
    title: item => text(item.name),
    image: item => text(item.logo) || undefined,
    viewUrl: () => '/about',
    fields: [
      { key: 'name', label: 'Partner name', kind: 'text', required: true, big: true, placeholder: 'Organisation name' },
      { key: 'logo', label: 'Logo', kind: 'image' },
      { key: 'logoScale', label: 'Size adjustment', kind: 'number', placeholder: '1', help: '1 is normal, 2 is twice as large.' },
      { key: 'logoOffsetY', label: 'Vertical nudge', kind: 'text', placeholder: '9%', help: 'For logos with extra space around them.' }
    ],
    groups: [
      { title: 'Partner', fields: ['name', 'logo'] },
      { title: 'Fine-tuning', side: true, description: 'Optional. Only needed if the logo looks too small or off-centre.', fields: ['logoScale', 'logoOffsetY'] }
    ]
  },
  {
    key: 'settings', label: 'Contact details', singular: 'contact details', icon: Phone, layout: 'rows', singleton: true,
    description: 'Shown in the footer of every page and on the Contact page.',
    title: () => 'Contact details',
    viewUrl: () => '/contact',
    fields: [
      { key: 'email', label: 'Email', kind: 'text', required: true },
      { key: 'phonePrimary', label: 'Main phone', kind: 'text', required: true, half: true },
      { key: 'phoneSecondary', label: 'Second phone', kind: 'text', half: true },
      { key: 'addressLine1', label: 'Address line 1', kind: 'text', required: true },
      { key: 'addressLine2', label: 'Address line 2', kind: 'text' },
      { key: 'digitalAddress', label: 'GhanaPost digital address', kind: 'text', placeholder: 'VH-0000-0000' }
    ],
    groups: [
      { title: 'Email and phone', fields: ['email', 'phonePrimary', 'phoneSecondary'] },
      { title: 'Office address', fields: ['addressLine1', 'addressLine2', 'digitalAddress'] }
    ]
  }
];
