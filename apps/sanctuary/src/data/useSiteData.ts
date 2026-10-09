/* @layer sanctuary-site @kind hook */
import { useContext } from 'react';
import { SiteDataContext } from './site-data-context';
import type { SiteData } from './site-data-context.type';

const useSiteData = (): SiteData => {
  const data = useContext(SiteDataContext);
  if (!data) throw new Error('useSiteData: no SiteDataProvider above');
  return data;
};

export { useSiteData };
