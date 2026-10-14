
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '../utils/usePrefersReducedMotion';
import { AnimatedSection } from '../components/AnimatedSection';
import { leadershipData, partnersData } from '../data';
import { Users, Globe, Layers, CheckCircle2, X } from 'lucide-react';
import { LeadershipMember } from '../types';
import { getResponsiveImageProps } from '../utils/responsiveImage';
import CountUp from '../components/CountUp';
import PartnerMarquee from '../components/PartnerMarquee';

const About: React.FC = () => {
  const [selectedLeader, setSelectedLeader] = useState<LeadershipMember | null>(null);
  const reduceMotion = usePrefersReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedLeader) return;

    const trigger = document.activeElement as HTMLElement | null;
    const closeButton = dialogRef.current?.querySelector<HTMLButtonElement>('button');
    closeButton?.focus({ preventScroll: true });
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedLeader(null);
      if (e.key === 'Tab') {
        e.preventDefault();
        closeButton?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [selectedLeader]);

  return (
    <div className="bg-white dark:bg-brand-navy min-h-screen transition-colors duration-300">

      {/* Header - Optimized Padding */}
      <div className="relative bg-brand-navy text-white pt-32 md:pt-40 pb-16 md:pb-24 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-blue/10 blur-[150px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection direction="right">
            <h1 className="text-5xl md:text-8xl font-black uppercase mb-6 tracking-tighter leading-none">About <span className="text-brand-blue">Us</span></h1>
            <div className="h-1.5 w-16 bg-brand-green mb-8"></div>
            <p className="text-base md:text-2xl font-medium text-slate-300 max-w-2xl leading-relaxed">
              A youth-led future of competent, healthy, and like-minded people making Ghana a premier nation.
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <AnimatedSection direction="right" className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-white/5 transition-colors">
            <h2 className="text-xl md:text-2xl font-black text-brand-navy dark:text-white uppercase mb-4 tracking-tight">Our Vision</h2>
            <p className="text-base md:text-lg font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
              A future of competent, healthy and like-minded people making Ghana a premier nation.
            </p>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.1} className="bg-brand-blue p-6 md:p-8 rounded-2xl text-white shadow-sm">
            <h2 className="text-xl md:text-2xl font-black uppercase mb-4 tracking-tight">Our Mission</h2>
            <p className="text-base md:text-lg font-medium leading-relaxed text-white/90">
              To impact the Ghanaian society through education, capacity building and advocacy in child protection, adolescents and reproductive health.
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* NEW: Impact Statistics Section */}
      <section className="py-14 md:py-16 bg-brand-navy text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(0,85,255,0.1),transparent)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection direction="up" className="text-center mb-10">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">Our <span className="text-brand-green">Footprint</span></h2>
            <p className="text-slate-400 font-medium text-lg">Measurable change across the region since 2016.</p>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {[
              { label: "Lives Impacted", value: 5000, suffix: "+", icon: <Users className="text-brand-blue" /> },
              { label: "Projects Completed", value: 12, suffix: "", icon: <Layers className="text-brand-green" /> },
              { label: "Communities Reached", value: 30, suffix: "+", icon: <Globe className="text-brand-blue" /> },
              { label: "Active Volunteers", value: 35, suffix: "+", icon: <CheckCircle2 className="text-brand-green" /> }
            ].map((stat, i) => (
              <AnimatedSection key={i} direction="up" delay={i * 0.1} className="bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10 text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-2 leading-none">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.12em] text-slate-400">{stat.label}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Partners Section */}
      <section id="partners" aria-labelledby="partners-heading" className="py-14 md:py-16 bg-white dark:bg-slate-900 overflow-hidden border-y border-slate-100 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <AnimatedSection direction="right">
            <h2 id="partners-heading" className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-brand-navy dark:text-white">
              Trusted by <span className="text-brand-blue">Global</span> Partners
            </h2>
          </AnimatedSection>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PartnerMarquee partners={partnersData} />
        </div>
      </section>

      {/* Significance Grid */}
      <section className="bg-slate-50 dark:bg-slate-900/30 py-16 md:py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <AnimatedSection direction="right">
              <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
                <h3 className="text-xl md:text-2xl font-black text-brand-navy dark:text-white mb-6 uppercase tracking-tight">Identity & Values</h3>
                <div className="space-y-5 md:space-y-6">
                  {[
                    { label: "Impact Now", desc: "Commitment to immediate and effective action." },
                    { label: "Unity", desc: "Two hands holding, signifying collective strength." },
                    { label: "Results", desc: "Two leaves sprouting, representing teamwork results." }
                  ].map((val, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span className="text-brand-blue font-black text-xl md:text-2xl leading-none">0{i + 1}</span>
                      <div>
                        <h4 className="font-black text-brand-navy dark:text-white uppercase text-sm md:text-base tracking-tight">{val.label}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1 leading-normal">{val.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.2}>
              <h3 className="text-2xl md:text-4xl font-black text-brand-navy dark:text-white uppercase mb-8 tracking-tighter">What We Do</h3>
              <div className="space-y-3 md:space-y-4">
                {[
                  "Promoting holistic health of children and adolescents.",
                  "Empowering young people with digital capacity.",
                  "Championing child protection and SRHR.",
                  "Advocacy and intervention in GBV issues."
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-white/5">
                    <div className="w-2 h-2 rounded-full bg-brand-green shrink-0"></div>
                    <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium leading-tight">{item}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 md:py-20 bg-white dark:bg-brand-navy transition-colors relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="up" className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-brand-navy dark:text-white uppercase tracking-tighter">Our Leadership</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto font-medium text-sm md:text-base">
              A diverse team of experts dedicated to advocacy and healthcare.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {leadershipData.map((leader, idx) => (
              <AnimatedSection key={idx} direction="up" delay={idx * 0.1} className="text-center">
                <button type="button" onClick={() => setSelectedLeader(leader)} aria-haspopup="dialog" aria-label={`View ${leader.name}'s profile`} className="w-full text-center rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue">
                  <div className="relative rounded-2xl overflow-hidden mb-4 aspect-[3/4] bg-slate-100 dark:bg-slate-900 shadow-sm">
                    <img {...getResponsiveImageProps(leader.image, '(min-width: 1024px) 280px, 45vw')} alt={leader.name} loading="lazy" decoding="async" className="w-full h-full object-contain object-top" />
                  </div>
                  <h4 className="text-base md:text-lg font-black text-brand-navy dark:text-white uppercase tracking-tight">{leader.name}</h4>
                  <p className="text-brand-blue font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] mt-1">{leader.role}</p>
                  {leader.occupation && <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">{leader.occupation}</p>}
                </button>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {typeof document !== 'undefined' && createPortal(<AnimatePresence initial={false}>
          {selectedLeader && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brand-navy/80"
              onClick={() => setSelectedLeader(null)}
            >
              <motion.div 
                ref={dialogRef}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="leader-profile-title"
                className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90svh] md:h-[min(560px,90svh)]"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  type="button"
                  onClick={() => setSelectedLeader(null)}
                  aria-label="Close leadership profile"
                  className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="w-full md:w-2/5 h-[min(32svh,288px)] md:h-auto shrink-0 relative bg-slate-100 dark:bg-slate-950">
                  <img {...getResponsiveImageProps(selectedLeader.image, '(min-width: 768px) 308px, 90vw')} alt={selectedLeader.name} decoding="async" className="w-full h-full md:absolute md:inset-0 object-contain object-top" />
                </div>
                <div className="p-6 md:p-8 flex-1 min-h-0 overflow-y-auto">
                  <h3 id="leader-profile-title" className="text-2xl md:text-3xl font-black text-brand-navy dark:text-white uppercase tracking-tight mb-2">{selectedLeader.name}</h3>
                  <div className="mb-6 flex flex-col gap-1">
                    <span className="text-brand-blue font-black uppercase text-xs tracking-[0.2em]">{selectedLeader.role}</span>
                    {selectedLeader.occupation && <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">{selectedLeader.occupation}</span>}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-line space-y-4">
                    {selectedLeader.bio}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>, document.body)}
      </section>
    </div>
  );
};

export default About;
