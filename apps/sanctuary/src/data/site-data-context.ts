/* @layer sanctuary-site @kind logic */
import { createContext } from 'react';
import type { SiteData } from './site-data-context.type';

const SiteDataContext = createContext<SiteData | null>(null);

export { SiteDataContext };
