
import React from 'react';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin, ArrowUpRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Facebook size={24} />, url: "https://www.facebook.com/share/1LdwoM8NGF/", name: "Facebook" },
    { icon: <Instagram size={24} />, url: "https://www.instagram.com/smarthub_gh?igsh=MWU5aW4zcHEwcHBrZg==", name: "Instagram" },
    { icon: <Linkedin size={24} />, url: "https://www.linkedin.com/company/smarthub-gh/", name: "LinkedIn" }
  ];

  return (
    <footer className="w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Big Brand & CTA Section */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 sm:gap-4 mb-5">
                <BrandLogo className="h-14 w-14 sm:h-16 sm:w-16" loading="lazy" sizes="(min-width: 640px) 96px, 84px" />
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-navy dark:text-white tracking-tighter uppercase leading-none">
                  Impact <br />
                  <span className="text-brand-blue">Starts Now.</span>
                </h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-medium max-w-md mb-6 leading-relaxed transition-colors">
                Empowering the next generation of Ghanaian leaders through digital innovation and health advocacy.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-brand-blue hover:border-brand-blue dark:hover:bg-brand-blue transition-all duration-300"
                >
                  <span className="text-brand-navy dark:text-white group-hover:text-white transition-colors">{social.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy dark:text-white group-hover:text-white transition-colors">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Column */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-green mb-8">Navigation</h4>
            <ul className="space-y-4">
              {[
                { name: 'About the Hub', path: '/about' },
                { name: 'Impact Projects', path: '/projects' },
                { name: 'Photo Gallery', path: '/gallery' },
                { name: 'News Updates', path: '/blog' },
                { name: 'Support Us', path: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-xl md:text-2xl font-black text-brand-navy dark:text-white uppercase tracking-tighter hover:text-brand-blue dark:hover:text-brand-blue transition-all inline-flex items-center gap-2 group"
                  >
                    {link.name}
                    <ArrowUpRight size={24} className="opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-green mb-8">Get in Touch</h4>
            <div className="space-y-8">
              <div className="group cursor-default">
                <div className="flex items-center gap-3 text-brand-blue mb-2">
                  <MapPin size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Head Office</span>
                </div>
                <p className="text-brand-navy dark:text-white font-bold leading-snug group-hover:text-brand-blue transition-colors">
                  Daglama Street, Near Mirage, <br />
                  Ho, Volta Region. AJ552
                </p>
              </div>

              <div className="group cursor-default">
                <div className="flex items-center gap-3 text-brand-blue mb-2">
                  <Phone size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Hotline</span>
                </div>
                <p className="text-brand-navy dark:text-white font-bold leading-snug group-hover:text-brand-blue transition-colors">
                  +233 20 437 4782 <br />
                  +233 59 409 7370
                </p>
              </div>

              <div className="group cursor-default">
                <div className="flex items-center gap-3 text-brand-blue mb-2">
                  <Mail size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Email Us</span>
                </div>
                <a href="mailto:admin@smarthubgh.com" className="text-brand-navy dark:text-white font-bold leading-snug hover:text-brand-blue transition-colors block border-b border-slate-200 dark:border-white/10 pb-1">
                  admin@smarthubgh.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col xl:flex-row justify-between items-center gap-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex gap-1 h-3 shrink-0" aria-hidden="true">
              <div className="w-4 bg-red-600"></div>
              <div className="w-4 bg-yellow-400"></div>
              <div className="w-4 bg-green-600"></div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-relaxed">
              SMART HUB GH (SMART YOUTH CONNEKT LBG)
            </p>
          </div>

          <div className="flex items-center gap-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              © {currentYear} SMART HUB GH
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
              className="text-[10px] font-black uppercase tracking-widest text-brand-navy dark:text-white hover:text-brand-blue transition-colors flex items-center gap-2 group"
            >
              Back to Top
              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-all">
                ↑
              </span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
