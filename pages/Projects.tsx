
import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatedSection } from '../components/AnimatedSection';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { projectsData } from '../data';
import BlogCover from '../components/BlogCover';
import { sortProjectsNewestFirst } from '../utils/contentOrder';

const Projects: React.FC = () => {
  return (
    <div className="bg-brand-light dark:bg-brand-navy min-h-screen transition-colors duration-300">
      
      {/* Header - Optimized Padding */}
      <div className="bg-brand-navy text-white pt-32 md:pt-40 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection direction="right">
            <h1 className="font-display text-5xl md:text-8xl uppercase mb-6 tracking-tighter leading-none">Our <span className="text-brand-green">Projects</span></h1>
            <p className="text-base md:text-xl text-gray-400 max-w-2xl font-medium leading-relaxed">
              Successfully implemented high-impact projects across Ghana. Explore our journey of impact below.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {sortProjectsNewestFirst(projectsData).map((project, index) => (
            <AnimatedSection key={project.id} direction="up" delay={index * 0.1} className="h-full">
              <div className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-white/5 flex flex-col h-full">
                <div className="relative overflow-hidden h-52 md:h-64">
                   <BlogCover post={project} />
                   <div className="absolute top-4 left-4">
                      <span className="bg-brand-blue text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-lg">
                        {project.sponsor}
                      </span>
                   </div>
                </div>

                <div className="p-6 md:p-7 flex flex-col flex-grow">
                   <h3 className="font-black text-xl md:text-2xl text-brand-navy dark:text-white mb-4 leading-tight uppercase tracking-tight line-clamp-2">
                     {project.title}
                   </h3>
                   <div className="flex flex-wrap gap-3 mb-4">
                     <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full transition-colors">
                       <Calendar size={12} className="text-brand-green" />
                       <span>{project.period}</span>
                     </div>
                     <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full transition-colors">
                       <Users size={12} className="text-brand-green" />
                       <span>{project.reach}</span>
                     </div>
                   </div>
                   <p className="text-gray-500 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium mb-5 line-clamp-3 flex-grow transition-colors">
                     {project.description}
                   </p>
                   <Link 
                    to={`/projects/${project.id}`} 
                    className="inline-flex items-center gap-2 text-brand-blue font-black text-xs md:text-sm uppercase tracking-widest hover:text-brand-navy dark:hover:text-white transition-colors mt-auto"
                   >
                     View Details <ArrowRight size={16} />
                   </Link>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
