
import React, { useMemo } from 'react';
import { AnimatedSection } from '../components/AnimatedSection';
import { projectsData } from '../data';
import { getResponsiveImageProps } from '../utils/responsiveImage';

// A build seed keeps the initial server and browser photo order identical.
const gallerySeed = import.meta.env.VITE_BUILD_SEED || 'smart-hub-gallery';

// Shuffle an array using a seeded Fisher-Yates algorithm.
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  let state = 2166136261;
  for (const character of gallerySeed) {
    state = Math.imul(state ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  for (let i = a.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = Math.floor((state / 4294967296) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const Gallery: React.FC = () => {
  // Collect all images — thumbnail + gallery images for every project
  const allImages = useMemo(() => {
    const imgs: { src: string; caption: string; alt: string }[] = [];
    projectsData.forEach(p => {
      if (p.image) imgs.push({ src: p.image, caption: p.title, alt: p.imageAlt || p.title });
      if (p.galleryImages) {
        p.galleryImages.filter(g => g !== p.image).forEach(g => imgs.push({ src: g, caption: p.title, alt: p.title }));
      }
    });
    // Keep this arrangement stable throughout hydration and subsequent rendering.
    return shuffleArray(imgs);
  }, []);

  return (
    <div className="bg-white dark:bg-brand-navy min-h-screen transition-colors duration-300">
      <div className="bg-brand-navy text-white pt-32 md:pt-40 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection direction="right">
            <h1 className="text-5xl md:text-8xl font-black uppercase mb-6 tracking-tighter">Our <span className="text-brand-green">Gallery</span></h1>
            <p className="text-base md:text-xl text-gray-400 max-w-2xl font-medium leading-relaxed">
              Moments of impact, connection, and change captured across our various projects in Ghana.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {allImages.map((item, idx) => (
            <AnimatedSection key={idx} direction="up" delay={Math.min(idx * 0.03, 0.5)} className="break-inside-avoid">
              <div className="relative group rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-white/5">
                <img
                  {...getResponsiveImageProps(item.src, '(min-width: 1024px) 400px, (min-width: 768px) 45vw, 100vw')}
                  alt={item.alt}
                  decoding="async"
                  className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/50 transition-colors duration-300 flex items-end">
                  <p className="text-white text-xs font-black uppercase tracking-widest px-4 pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.caption}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
