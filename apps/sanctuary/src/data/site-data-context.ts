/* @layer sanctuary-site @kind logic */
/**
 * The signed-in site's shared data: every file and every report, loaded once by the
 * frame, and the scope tab each list page stands on. Pages and the global search read
 * the same lists, so a page switch or a search never fetches again.
 */
import { createContext, useContext } from 'react';
import type { useFiles } from '../files/useFiles';
import type { useReports } from '../reports/useReports';
import type { useMultipartUpload } from '../upload/useMultipartUpload';

type ListSurface = 'files' | 'reports';

type SiteData = {
  files: ReturnType<typeof useFiles>;
  reports: ReturnType<typeof useReports>;
  /** Uploads in flight; held here so a page switch or a search does not drop them. */
  uploads: ReturnType<typeof useMultipartUpload>;
  /** The scope tab each list page shows; it outlives the page, so a search can pick it. */
  scopes: Record<ListSurface, string>;
  setScope: (surface: ListSurface, scopeId: string) => void;
};

const SiteDataContext = createContext<SiteData | null>(null);

const useSiteData = (): SiteData => {
  const data = useContext(SiteDataContext);
  if (!data) throw new Error('useSiteData: no SiteDataProvider above');
  return data;
};

export { SiteDataContext, useSiteData };
export type { SiteData, ListSurface };
