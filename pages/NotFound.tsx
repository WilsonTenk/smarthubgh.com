import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[70vh] px-6 pt-40 pb-20 bg-brand-light dark:bg-brand-navy text-center">
    <h1 className="text-4xl md:text-6xl font-black text-brand-navy dark:text-white">Page not found</h1>
    <p className="mt-6 text-slate-600 dark:text-slate-400">This page may have moved. Explore our projects and latest stories from the home page.</p>
    <Link to="/" className="inline-block mt-8 rounded-full bg-brand-blue text-white px-8 py-4 font-bold">Back to home</Link>
  </div>
);

export default NotFound;
