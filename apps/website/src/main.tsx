/* @layer website-site @kind entry */
import './design/index.css';
import './theme.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { routeOf } from './routes';
import { SitePage } from './views/SitePage';

const root = document.getElementById('root');
if (!root) throw new Error('index.html has no #root element');

createRoot(root).render(
  <StrictMode>
    <SitePage route={routeOf(window.location.pathname)} />
  </StrictMode>,
);
