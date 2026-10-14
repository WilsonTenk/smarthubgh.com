
import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatedSection } from '../components/AnimatedSection';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { blogData } from '../data';
import BlogCover from '../components/BlogCover';
import { sortBlogsNewestFirst } from '../utils/contentOrder';

const Blog: React.FC = () => {
  return (
    <div className="bg-brand-light dark:bg-brand-navy min-h-screen transition-colors duration-300">
      <div className="bg-brand-navy text-white pt-32 md:pt-40 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection direction="right">
            <h1 className="text-5xl md:text-8xl font-black uppercase mb-6 tracking-tighter">News & <span className="text-brand-green">Updates</span></h1>
            <p className="text-base md:text-xl text-gray-400 max-w-2xl font-medium leading-relaxed">
              Stories, insights, and updates from the field.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
           {sortBlogsNewestFirst(blogData).map((post, index) => (
             <AnimatedSection key={post.id} direction="up" delay={index * 0.1} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full">
                <div className="h-56 overflow-hidden relative">
                   <BlogCover post={post} />
                   <div className="absolute top-4 left-4">
                      <span className="bg-brand-green text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-sm">
                        {post.category}
                      </span>
                   </div>
                </div>
                <div className="p-6 md:p-7 flex flex-col flex-grow">
                   <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4 transition-colors">
                      {(post.updatedAt || post.date) && <span className="flex items-center gap-1"><Calendar size={14} className="text-brand-green" /> {post.updatedAt ? `Updated ${post.updatedAt}` : post.date}</span>}
                      <span className="flex items-center gap-1"><User size={14} className="text-brand-green" /> {post.author}</span>
                   </div>
                   <h3 className="text-xl font-black text-brand-navy dark:text-white uppercase mb-3 tracking-tight line-clamp-2 hover:text-brand-blue transition-colors">
                     <Link to={`/blog/${post.id}`}>
                       {post.title}
                     </Link>
                   </h3>
                   <p className="text-gray-500 dark:text-slate-400 text-sm md:text-base font-medium mb-5 line-clamp-3 leading-relaxed transition-colors">
                     {post.excerpt}
                   </p>
                   <Link to={`/blog/${post.id}`} className="inline-flex items-center gap-2 text-brand-blue font-black uppercase tracking-widest hover:text-brand-navy dark:hover:text-white text-[11px] mt-auto">
                     Read Article <ArrowRight size={16} />
                   </Link>
                </div>
             </AnimatedSection>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
