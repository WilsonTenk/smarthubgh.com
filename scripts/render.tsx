import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { AppContent } from '../App';
export { getSeoRoutes, getPageSeo, serializeJsonLd, SITE_URL } from '../utils/seo';

export function render(pathname: string) {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/';
  const location = `${base === '/' ? '' : base}${pathname}`;
  return renderToString(<StaticRouter basename={base} location={location}><AppContent /></StaticRouter>);
}
