/* @layer site-kit @kind logic */
/** The site definition the kit's frame, nav and pages read, set once by SiteKit at the root. */
import { createContext, useContext } from 'react';
import type { SiteDefinition } from './site-definition.type';

const SiteContext = createContext<SiteDefinition | null>(null);

const useSiteDefinition = (): SiteDefinition => {
  const site = useContext(SiteContext);
  if (!site) throw new Error('useSiteDefinition: no SiteKit above');
  return site;
};

export { SiteContext, useSiteDefinition };
