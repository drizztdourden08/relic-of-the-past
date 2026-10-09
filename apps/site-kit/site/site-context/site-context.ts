/* @layer site-kit @kind logic */
import { createContext } from 'react';
import type { SiteDefinition } from '../site-definition.type';

const SiteContext = createContext<SiteDefinition | null>(null);

export { SiteContext };
