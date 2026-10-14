
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnimatedSection } from '../components/AnimatedSection';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { blogData } from '../data';
import BlogCover from '../components/BlogCover';
import { getImageDimensions } from '../utils/imageDimensions';
import { getResponsiveImageProps } from '../utils/responsiveImage';

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const post = blogData.find(p => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-brand-light dark:bg-brand-navy flex items-center justify-center flex-col gap-4 transition-colors">
        <h1 className="text-4xl font-black text-brand-navy dark:text-white">Article Not Found</h1>
        <Link to="/blog" className="text-brand-blue underline font-black uppercase tracking-widest">Back to Blog</Link>
      </div>
    );
  }

  const containCover = Boolean(post.image && post.imageFit === 'contain');
  const coverDimensions = post.image ? getImageDimensions(post.image) : undefined;

  return (
    <div className="bg-brand-light dark:bg-brand-navy min-h-screen transition-colors duration-300">
      
      {/* Header Section */}
      <div className="bg-brand-navy text-white pt-32 md:pt-40 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection direction="up">
             <Link to="/blog" className="inline-flex items-center gap-2 text-white/60 hover:text-brand-green mb-8 font-black uppercase tracking-widest text-xs transition-colors">
                <ArrowLeft size={16} /> Back to Blog
             </Link>
             
             <div className="flex flex-wrap items-center gap-6 mb-6 text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2 text-brand-green"><Tag size={16} /> {post.category}</span>
                {post.date && <span className="flex items-center gap-2"><Calendar size={16} /> Published {post.date}</span>}
                {post.updatedAt && <span className="flex items-center gap-2"><Calendar size={16} /> Updated {post.updatedAt}</span>}
                <span className="flex items-center gap-2"><User size={16} /> {post.author}</span>
             </div>

             <h1 className="text-4xl md:text-7xl text-white font-black uppercase leading-[1.05] tracking-tighter">
               {post.title}
             </h1>
          </AnimatedSection>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-20">
         <AnimatedSection direction="up" delay={0.2} className="mb-12">
            <figure>
               <div className={`rounded-[2.5rem] overflow-hidden shadow-2xl w-full border-[8px] border-white dark:border-slate-800 ${containCover ? '' : 'h-[350px] md:h-[500px]'}`}>
                  {containCover ? (
                    <div style={{ aspectRatio: coverDimensions ? `${coverDimensions.width} / ${coverDimensions.height}` : '16 / 9' }}>
                       <BlogCover post={post} loading="eager" sizes="(min-width: 1024px) 896px, 100vw" />
                    </div>
                  ) : <BlogCover post={post} loading="eager" sizes="(min-width: 1024px) 896px, 100vw" />}
               </div>
               {post.imageCaption && <figcaption className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{post.imageCaption}</figcaption>}
            </figure>
         </AnimatedSection>

         <AnimatedSection direction="up" delay={0.3} className="bg-white dark:bg-slate-900 p-8 md:p-16 rounded-[2.5rem] shadow-sm mb-12 border border-slate-50 dark:border-white/5 transition-colors">
            <div className="text-gray-600 dark:text-slate-400 font-medium leading-relaxed space-y-8 text-base md:text-xl transition-colors">
               <p className="text-xl md:text-3xl font-black text-brand-navy dark:text-white leading-tight border-l-8 border-brand-green pl-8 transition-colors">
                 {post.excerpt}
               </p>
               <div className="blog-content prose dark:prose-invert max-w-none [&_h2]:text-2xl md:[&_h2]:text-3xl [&_h2]:font-black [&_h2]:text-brand-navy dark:[&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_p]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/><br/>') }} />
            </div>

            {post.galleryImages && post.galleryImages.length > 0 && (
              <section aria-label="Project photos" className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {post.galleryImages.map(photo => (
                  <figure key={photo.src}>
                    <img {...getResponsiveImageProps(photo.src, '(min-width: 1024px) 400px, 100vw')} alt={photo.alt} loading="lazy" decoding="async" className="w-full rounded-2xl" />
                    {photo.caption && <figcaption className="mt-3 text-sm text-gray-600 dark:text-slate-400">{photo.caption}</figcaption>}
                  </figure>
                ))}
              </section>
            )}

            <div className="py-12 border-t border-gray-100 dark:border-white/10 mt-16">
                <h3 className="text-xl md:text-2xl font-black text-brand-navy dark:text-white uppercase mb-8 tracking-tighter transition-colors">Share Impact</h3>
                <div className="flex flex-wrap gap-3">
                  {['Facebook', 'Twitter', 'LinkedIn'].map(platform => (
                    <button key={platform} className="px-6 py-3 border-2 border-slate-100 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all font-black uppercase text-[10px] tracking-widest">
                        {platform}
                    </button>
                  ))}
                </div>
            </div>
         </AnimatedSection>
         
      </div>

    </div>
  );
};

export default BlogPost;
