
import React from 'react';
import { MotionConfig } from 'framer-motion';
import { usePrefersReducedMotion } from './utils/usePrefersReducedMotion';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Gallery from './pages/Gallery';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Seo from './components/Seo';
import NotFound from './pages/NotFound';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const AppContent: React.FC = () => {
  const reduceMotion = usePrefersReducedMotion();
  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'never'}>
        <Seo />
        <ScrollToTop />
        <div className="flex flex-col min-h-screen font-sans text-gray-900 dark:text-white bg-white dark:bg-brand-navy transition-colors duration-300">
          <Navbar />
          <div className="bg-white dark:bg-brand-navy">
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
          <Footer />
        </div>
    </MotionConfig>
  );
};

const App: React.FC = () => {
  const basename = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') || '/';
  return <BrowserRouter basename={basename}><AppContent /></BrowserRouter>;
};

export default App;
