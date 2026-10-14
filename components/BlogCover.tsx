import React from 'react';
import { Heart } from 'lucide-react';
import { BlogPost } from '../types';
import { getResponsiveImageProps } from '../utils/responsiveImage';

interface BlogCoverProps {
  post: Pick<BlogPost, 'title' | 'image' | 'imageAlt' | 'imageFit'>;
  loading?: 'eager' | 'lazy';
  sizes?: string;
}

const BlogCover: React.FC<BlogCoverProps> = ({ post, loading = 'lazy', sizes = '(min-width: 1024px) 600px, (min-width: 768px) 45vw, 100vw' }) => {
  if (post.image) {
    return <img {...getResponsiveImageProps(post.image, sizes)} alt={post.imageAlt || post.title} loading={loading} decoding="async" fetchPriority={loading === 'eager' ? 'high' : 'auto'} className={`w-full h-full ${post.imageFit === 'contain' ? 'object-contain' : 'object-cover transition-transform duration-700 hover:scale-110'}`} />;
  }

  return (
    <div aria-hidden="true" className="ui-image-placeholder">
      <Heart size={32} className="text-brand-blue shrink-0" />
      <span className="text-xs font-black uppercase tracking-[0.2em] opacity-70">SMART Youth Connekt</span>
      <span className="text-xl md:text-2xl font-black leading-tight max-w-xl">{post.title}</span>
    </div>
  );
};

export default BlogCover;
