
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Minus, Plus, Quote } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';
import BlogCover from '../components/BlogCover';
import { blogData, projectsData } from '../data';
import { HomeHero, HomeStory } from '../components/HomeHero';
import { sortBlogsNewestFirst, sortProjectsNewestFirst } from '../utils/contentOrder';

const testimonials = [
  {
    quote: "SMART HUB has fundamentally changed how our youth perceive digital opportunity. They are no longer just consumers, but creators.",
    author: "Kwadwo Mensah",
    role: "Community Leader, Ho"
  },
  {
    quote: "The Safe Flow project restored dignity to our school-going girls. The impact on attendance has been immediate and profound.",
    author: "Ama Serwaa",
    role: "Headteacher, Adaklu"
  },
  {
    quote: "Bridging the gap between raw potential and impactful advocacy. A true partner in development for the Volta Region.",
    author: "Samuel Boateng",
    role: "Project Director, Brave Movement"
  }
];

const Home: React.FC = () => {
  const featuredProjects = sortProjectsNewestFirst(projectsData).slice(0, 2);
  const recentPosts = sortBlogsNewestFirst(blogData).slice(0, 3);
  const faqs = [
    {
      question: "How can I volunteer with SMART HUB GH?",
      answer: "We welcome passionate individuals! Reach out via our contact page or email us directly at admin@smarthubgh.com for current opportunities."
    },
    {
      question: "Where are you located?",
      answer: "We are based in Ho, Volta Region, Ghana. Our office is on Daglama Street, Near Mirage, House Number AJ552."
    },
    {
      question: "How are donations used?",
      answer: "Donations fund our projects directly, including educational materials, sanitary products for Safe Flow, and community workshops."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-x-clip bg-white dark:bg-brand-navy transition-colors duration-300">

      <HomeHero />
      <HomeStory />

      {/* Featured Projects */}
      <section id="recent-projects" aria-labelledby="recent-projects-heading" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
            <AnimatedSection direction="right">
              <h2 id="recent-projects-heading" className="text-4xl md:text-7xl text-brand-navy dark:text-white font-black tracking-tighter uppercase">Recent <span className="text-brand-blue">Projects</span></h2>
              <p className="text-slate-400 dark:text-slate-500 mt-2 text-base md:text-xl font-medium">Our latest work in the communities we serve.</p>
            </AnimatedSection>
            <Link to="/projects" className="flex items-center gap-3 font-black uppercase tracking-[0.2em] text-brand-navy dark:text-white hover:text-brand-blue transition-all text-xs md:text-sm group">
              All Projects <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {featuredProjects.map((project, i) => (
              <AnimatedSection key={project.id} direction="up" delay={i * 0.1} className="group flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 dark:border-white/5">
                <div className="h-[250px] md:h-[350px] overflow-hidden relative">
                  <BlogCover post={project} />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 dark:bg-brand-navy/95 text-brand-navy dark:text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg shadow-sm">
                      {project.sponsor}
                    </span>
                  </div>
                </div>
                <div className="p-6 md:p-7 flex flex-col flex-grow">
                  <h3 className="text-xl md:text-2xl font-black text-brand-navy dark:text-white mb-3 leading-tight tracking-tight group-hover:text-brand-blue transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium mb-5 line-clamp-3 flex-grow leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap justify-between items-center gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-white/5">
                    <Link to={`/projects/${project.id}`} className="text-brand-blue font-black text-xs md:text-sm uppercase tracking-widest hover:text-brand-navy dark:hover:text-white transition-colors flex items-center gap-2">
                      Read Case Study <ArrowRight size={16} />
                    </Link>
                    <span className="text-[9px] md:text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">{project.period}</span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activities & Blogs */}
      <section id="recent-activities" aria-labelledby="recent-activities-heading" className="py-16 md:py-24 bg-white dark:bg-brand-navy transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
            <AnimatedSection direction="right">
              <h2 id="recent-activities-heading" className="text-4xl md:text-6xl text-brand-navy dark:text-white font-black tracking-tighter uppercase">
                Recent Activities <span className="text-brand-blue">& Blogs</span>
              </h2>
              <p className="text-slate-400 dark:text-slate-500 mt-2 text-base md:text-xl font-medium">The latest stories and updates from our communities.</p>
            </AnimatedSection>
            <Link to="/blog" className="flex items-center gap-3 font-black uppercase tracking-[0.2em] text-brand-navy dark:text-white hover:text-brand-blue transition-all text-xs md:text-sm group shrink-0">
              View All Blogs <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {recentPosts.map((post, index) => (
              <AnimatedSection key={post.id} direction="up" delay={index * 0.1} className="group h-full bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-500">
                <article className="flex flex-col h-full">
                  <Link to={`/blog/${post.id}`} aria-label={`Read ${post.title}`} className="block h-56 overflow-hidden relative shrink-0">
                    <BlogCover post={post} />
                    <span className="absolute top-4 left-4 bg-brand-green text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-sm">
                      {post.category}
                    </span>
                  </Link>
                  <div className="p-6 md:p-7 flex flex-col flex-grow">
                    {(post.updatedAt || post.date) && (
                      <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                        <Calendar size={14} aria-hidden="true" className="text-brand-green" /> {post.updatedAt ? `Updated ${post.updatedAt}` : post.date}
                      </p>
                    )}
                    <h3 className="text-xl font-black text-brand-navy dark:text-white mb-3 tracking-tight leading-tight hover:text-brand-blue transition-colors">
                      <Link to={`/blog/${post.id}`}>{post.title}</Link>
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium mb-5 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <Link to={`/blog/${post.id}`} className="inline-flex items-center gap-2 text-brand-blue font-black uppercase tracking-widest hover:text-brand-navy dark:hover:text-white text-[11px] mt-auto">
                      Read Article <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Testimonials Section */}
      <section className="py-20 bg-white dark:bg-brand-navy transition-colors overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-4">
              <AnimatedSection direction="right">
                <div className="w-16 h-1 w-12 bg-brand-green mb-6"></div>
                <h2 className="text-4xl md:text-7xl font-black text-brand-navy dark:text-white tracking-tighter uppercase leading-none mb-8">
                  Voices of <br />
                  <span className="text-brand-blue">Impact</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                  The real change isn't measured in reports, but in the stories of the people we serve.
                </p>
              </AnimatedSection>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <div className="absolute top-0 right-0 text-brand-blue/10 pointer-events-none -translate-y-12">
                <Quote size={200} fill="currentColor" />
              </div>

              {testimonials.map((testimonial, i) => (
                <AnimatedSection
                  key={i}
                  direction="right"
                  delay={i * 0.1}
                  className={`p-6 md:p-7 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-lg transition-all duration-300 ${i === 2 ? 'md:col-span-2' : ''}`}
                >
                  <div className="flex flex-col h-full">
                    <Quote className="text-brand-blue mb-4" size={24} fill="currentColor" />
                    <p className="text-brand-navy dark:text-white font-bold text-lg md:text-xl tracking-tight leading-relaxed mb-6 flex-grow">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-200/50 dark:border-white/5">
                      <div>
                        <h4 className="font-black text-brand-navy dark:text-white uppercase text-xs tracking-widest">{testimonial.author}</h4>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors border-y border-slate-100 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="up" className="text-center mb-12">
            <h2 className="text-3xl md:text-6xl text-brand-navy dark:text-white font-black mb-6 tracking-tighter uppercase">Quick <span className="text-brand-blue">Answers</span></h2>
            <p className="text-slate-400 dark:text-slate-500 text-base md:text-xl font-medium">Everything you need to know about our operations.</p>
          </AnimatedSection>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

const FAQItem: React.FC<{ question: string, answer: string, index: number }> = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <AnimatedSection direction="right" delay={index * 0.1} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 hover:shadow-lg transition-all duration-300">
      <button onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-controls={`faq-answer-${index}`} className="w-full flex items-center justify-between p-5 md:p-6 text-left group">
        <span className="text-base md:text-lg font-black text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors leading-tight pr-4 tracking-tight">{question}</span>
        <span className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-xl bg-slate-50 dark:bg-white/10 text-brand-blue shadow-sm transition-all duration-500 flex items-center justify-center ${isOpen ? 'rotate-180 bg-brand-blue text-white' : ''}`}>
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>
      <div id={`faq-answer-${index}`} aria-hidden={!isOpen} className={`faq-panel ${isOpen ? 'faq-panel-open' : ''}`}>
        <div className="min-h-0 overflow-hidden">
        <div className="px-5 md:px-6 pb-5 md:pb-6 text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base leading-relaxed border-t border-slate-100/30 dark:border-white/5 pt-4">
          {answer}
        </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

export default Home;
