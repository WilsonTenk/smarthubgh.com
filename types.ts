export interface Project {
  id: string;
  title: string;
  period?: string;
  completedOn?: string; // Confirmed completion date or month (YYYY-MM[-DD]).
  listedOn?: string; // Website publication date, separate from the project period.
  category?: string;
  relatedBlogId?: string;
  sponsor: string;
  communities: string;
  reach: string;
  description: string;
  image?: string;
  imageAlt?: string;
  imageFit?: 'cover' | 'contain';
  fullContent?: string; // For the detailed view
  galleryImages?: string[]; // For the collage
}

export interface TeamMember {
  role: string;
  description: string;
}

export interface Partner {
  name: string;
  logo?: string;
  logoScale?: number;
  logoOffsetY?: string;
}

export interface LeadershipMember {
  name: string;
  role: string;
  image: string;
  occupation?: string;
  bio?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  date?: string;
  updatedAt?: string;
  excerpt: string;
  content: string;
  image?: string;
  imageAlt?: string;
  imageFit?: 'cover' | 'contain';
  imageCaption?: string;
  galleryImages?: { src: string; alt: string; caption?: string }[];
  author: string;
  category: string;
}
