import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { ActionLink, IconButton } from './Action';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = location.pathname.replace(/\/+$/, '') || '/';
  useLayoutEffect(() => { setIsDark(document.documentElement.classList.contains('dark')); }, []);
  useEffect(() => { setIsOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setIsOpen(false); menuButtonRef.current?.focus(); }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);
  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    try { localStorage.setItem('theme', newDark ? 'dark' : 'light'); } catch { /* Theme still works without storage. */ }
  };
  const navLinks = [
    { name: 'Home', path: '/' }, { name: 'About', path: '/about' },
    { name: 'Projects', path: '/projects' }, { name: 'Gallery', path: '/gallery' }, { name: 'Blog', path: '/blog' },
  ];
  return (
    <nav aria-label="Main navigation" className="absolute top-0 left-0 w-full z-[100] border-b bg-[#F4F7FF] dark:bg-brand-navy border-slate-200 dark:border-white/10 py-4 transition-colors duration-300">
      <div className="max-w-[1168px] px-5 md:px-6 mx-auto">
        <div className="flex justify-between items-center">
          <Link to="/" aria-label="SMARTHUB home" className="flex shrink-0 items-center gap-2.5 sm:gap-3 group relative z-[110]">
            <BrandLogo />
            <span className="text-xl sm:text-2xl font-black tracking-[0.03em] text-brand-navy dark:text-white">SMARTHUB</span>
          </Link>
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-6">
              {navLinks.map(link => (
                <Link key={link.name} to={link.path} aria-current={pathname === link.path ? 'page' : undefined}
                  className={`text-[13px] font-semibold transition-all relative group py-1 ${pathname === link.path ? 'text-brand-blue dark:text-white' : 'text-brand-navy/80 dark:text-white/80 hover:text-brand-blue dark:hover:text-white'}`}>
                  {link.name}
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-brand-blue dark:bg-white transition-all duration-300 group-hover:w-full ${pathname === link.path ? 'w-full' : ''}`} />
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <IconButton onClick={toggleTheme} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} aria-pressed={isDark}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </IconButton>
              <ActionLink to="/contact">Donate</ActionLink>
            </div>
          </div>
          <div className="lg:hidden flex items-center gap-1 sm:gap-3 relative z-[110]">
            <IconButton onClick={toggleTheme} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} aria-pressed={isDark}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>
            <IconButton ref={menuButtonRef} onClick={() => setIsOpen(open => !open)} aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isOpen} aria-controls="mobile-navigation">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </IconButton>
          </div>
        </div>
      </div>
      <div id="mobile-navigation" aria-hidden={!isOpen} inert={!isOpen}
        className={`lg:hidden fixed inset-0 bg-[#F4F7FF] dark:bg-brand-navy z-[105] transition-[opacity,transform] duration-200 ease-out flex flex-col justify-center items-center p-8 ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col gap-8 text-center">
          {navLinks.map(link => (
            <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} aria-current={pathname === link.path ? 'page' : undefined}
              className={`text-4xl font-black tracking-tighter transition-all ${pathname === link.path ? 'text-brand-blue dark:text-white' : 'text-brand-navy/75 dark:text-white/75 hover:text-brand-blue dark:hover:text-white'}`}>
              {link.name}
            </Link>
          ))}
          <ActionLink to="/contact" onClick={() => setIsOpen(false)} className="mt-6">Donate Now</ActionLink>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
