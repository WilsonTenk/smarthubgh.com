
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Sun, Moon, ArrowUpRight } from 'lucide-react';
import BrandLogo from './BrandLogo';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = location.pathname.replace(/\/+$/, '') || '/';
  const isHome = pathname === '/';

  useLayoutEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
    } catch {
      // The current page can still change theme when browser storage is unavailable.
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Projects', path: '/projects' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Blog', path: '/blog' },
  ];



  return (
    <nav
      aria-label="Main navigation"
      className={`absolute top-0 left-0 w-full z-[100] border-b transition-colors duration-300 ${isHome ? 'bg-[#F4F7FF] dark:bg-brand-navy border-slate-200 dark:border-white/10 py-4' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 py-4 md:py-5'}`}
    >
      <div className={`${isHome ? 'max-w-[1168px] px-5 md:px-6' : 'max-w-7xl px-4 sm:px-6 lg:px-8'} mx-auto`}>
        <div className="flex justify-between items-center">

          <Link to="/" aria-label="SMARTHUB home" className="flex shrink-0 items-center gap-2.5 sm:gap-3 group relative z-[110]">
            <BrandLogo />
            <span className="text-xl sm:text-2xl font-black tracking-[0.03em] text-brand-navy dark:text-white">SMARTHUB</span>
          </Link>

          <div className={`hidden lg:flex items-center ${isHome ? 'gap-6' : 'gap-8'}`}>
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  aria-current={pathname === link.path ? 'page' : undefined}
                  className={`transition-all relative group py-1 ${isHome ? `text-[13px] font-semibold ${pathname === link.path ? 'text-brand-blue dark:text-white' : 'text-brand-navy/80 dark:text-white/80 hover:text-brand-blue dark:hover:text-white'}` : `text-[11px] font-bold tracking-[0.15em] uppercase ${pathname === link.path ? 'text-brand-blue' : 'text-slate-500 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white'}`}`}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isHome ? 'bg-brand-blue dark:bg-white' : 'bg-brand-blue'} ${pathname === link.path ? 'w-full' : ''}`}></span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className={`p-2 transition-colors ${isHome ? 'rounded-full text-brand-navy dark:text-white hover:bg-brand-navy/5 dark:hover:bg-white/10' : 'rounded-xl bg-slate-50 dark:bg-white/5 text-brand-navy dark:text-white hover:bg-slate-100 dark:hover:bg-white/10'}`}
                aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                aria-pressed={isDark}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <Link
                to="/contact"
                className={`transition-all active:scale-95 flex items-center ${isHome ? 'pl-5 pr-1.5 py-1.5 gap-4 rounded-full text-[12px] font-semibold bg-brand-blue text-white hover:bg-blue-600' : 'px-6 py-2.5 gap-2 rounded-xl font-black uppercase text-[10px] tracking-[0.15em] bg-brand-navy dark:bg-white text-white dark:text-brand-navy hover:bg-brand-blue dark:hover:bg-brand-green shadow-lg'}`}
              >
                {!isHome && <Heart size={12} fill="currentColor" />}
                Donate
                {isHome && <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-blue"><ArrowUpRight size={16} /></span>}
              </Link>
            </div>
          </div>

          <div className="lg:hidden flex items-center gap-1 sm:gap-3 relative z-[110]">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-brand-navy dark:text-white"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={isDark}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              ref={menuButtonRef}
              onClick={() => setIsOpen((open) => !open)}
              className={`p-2 rounded-lg transition-colors ${isHome ? 'text-brand-navy dark:text-white hover:bg-brand-navy/5 dark:hover:bg-white/10' : 'text-brand-navy dark:text-white hover:bg-slate-50 dark:hover:bg-white/5'}`}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`lg:hidden fixed inset-0 ${isHome ? 'bg-[#F4F7FF] dark:bg-brand-navy' : 'bg-white dark:bg-slate-900'} z-[105] transition-[opacity,transform] duration-200 ease-out flex flex-col justify-center items-center p-8 ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0 pointer-events-none'
          }`}
      >
        <div className="flex flex-col gap-8 text-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              aria-current={pathname === link.path ? 'page' : undefined}
              className={`text-4xl font-black tracking-tighter transition-all ${isHome ? (pathname === link.path ? 'text-brand-blue dark:text-white' : 'text-brand-navy/75 dark:text-white/75 hover:text-brand-blue dark:hover:text-white') : `uppercase ${pathname === link.path ? 'text-brand-blue' : 'text-slate-300 dark:text-slate-700 hover:text-brand-navy dark:hover:text-white'}`}`}
            >
              {link.name}
            </Link>
          ))}

          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className={`mt-6 flex items-center justify-center gap-3 ${isHome ? 'bg-brand-blue text-white pl-7 pr-2 py-2 rounded-full font-semibold text-lg' : 'bg-brand-navy dark:bg-white text-white dark:text-brand-navy px-10 py-4 rounded-2xl font-black uppercase text-lg tracking-widest shadow-xl'}`}
          >
            {!isHome && <Heart size={20} fill="currentColor" />} Donate Now
            {isHome && <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-blue"><ArrowUpRight size={20} /></span>}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
