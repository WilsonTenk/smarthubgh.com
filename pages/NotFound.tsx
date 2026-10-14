import { ActionLink } from '../components/Action';

const NotFound = () => (
  <div className="min-h-[70vh] px-6 pt-40 pb-20 bg-brand-light dark:bg-brand-navy text-center">
    <h1 className="text-4xl md:text-6xl font-black text-brand-navy dark:text-white">Page not found</h1>
    <p className="mt-6 text-slate-600 dark:text-slate-400">This page may have moved. Explore our projects and latest stories from the home page.</p>
    <ActionLink to="/" className="mt-8">Back to home</ActionLink>
  </div>
);

export default NotFound;
