/* @layer sanctuary-site @kind component */
/** Loads the files and the reports once for the signed-in frame and holds each list page's scope tab. */
import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useFiles } from '../files/useFiles';
import { useReports } from '../reports/useReports';
import { useMultipartUpload } from '../upload/useMultipartUpload';
import { ALL_SCOPE_ID } from '../pages/Files/Files.constants';
import { REPORT_SCOPE_IDS } from '../pages/Reports/Reports.constants';
import { SiteDataContext } from './site-data-context';
import type { ListSurface, SiteData } from './site-data-context';

/** Both list pages open on their "All" tab. */
const INITIAL_SCOPES: Record<ListSurface, string> = { files: ALL_SCOPE_ID, reports: REPORT_SCOPE_IDS.all };

type SiteDataProviderProps = { children: ReactNode };

const SiteDataProvider = (props: SiteDataProviderProps) => {
  const { children } = props;
  const files = useFiles();
  const reports = useReports();
  const uploads = useMultipartUpload(files.upsert);
  const [scopes, setScopes] = useState(INITIAL_SCOPES);
  const setScope = useCallback((surface: ListSurface, scopeId: string) => {
    setScopes((current) => (current[surface] === scopeId ? current : { ...current, [surface]: scopeId }));
  }, []);

  const value = useMemo<SiteData>(() => ({ files, reports, uploads, scopes, setScope }), [files, reports, uploads, scopes, setScope]);
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
};

export { SiteDataProvider };
