/* @layer site-kit @kind hook */
import { useContext } from 'react';
import type { SiteDefinition } from '../site-definition.type';
import { SiteContext } from './site-context';

const useSiteDefinition = (): SiteDefinition => {
  const site = useContext(SiteContext);
  if (!site) throw new Error('useSiteDefinition: no SiteKit above');
  return site;
};

export { useSiteDefinition };
