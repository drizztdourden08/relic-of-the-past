/* @layer sanctuary-site @kind component */
/**
 * Loads the files and (with the reports right) the reports once for the signed-in frame,
 * holds each list page's scope tab, and mounts the upload tray and dialog over every page.
 * Every file an upload finishes reaches the files list.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useSessionContext } from '@site-kit/session/session-context';
import { UploadLayer } from '@site-kit/components/UploadLayer';
import { canSeeReports } from '@shared/sanctuary/sanctuary-rights';
import { useFiles } from '../files/useFiles';
import { useReports } from '../reports/useReports';
import { SANCTUARY_QUEUE } from '../upload/sanctuary-queue';
import { ALL_SCOPE_ID } from '../pages/Files/Files.constants';
import { REPORT_SCOPE_IDS } from '../pages/Reports/Reports.constants';
import { SiteDataContext } from './site-data-context';
import type { ListSurface, SiteData } from './site-data-context';

/** Both list pages open on their "All" tab. */
const INITIAL_SCOPES: Record<ListSurface, string> = { files: ALL_SCOPE_ID, reports: REPORT_SCOPE_IDS.all };

type SiteDataProviderProps = { children: ReactNode };

const SiteDataProvider = (props: SiteDataProviderProps) => {
  const { children } = props;
  const { rights } = useSessionContext();
  const files = useFiles();
  const reports = useReports(canSeeReports(rights));
  const { upsert } = files;
  useEffect(() => SANCTUARY_QUEUE.onRecord(upsert), [upsert]);
  const [scopes, setScopes] = useState(INITIAL_SCOPES);
  const setScope = useCallback((surface: ListSurface, scopeId: string) => {
    setScopes((current) => (current[surface] === scopeId ? current : { ...current, [surface]: scopeId }));
  }, []);

  const value = useMemo<SiteData>(
    () => ({ files, reports, uploads: SANCTUARY_QUEUE, scopes, setScope }),
    [files, reports, scopes, setScope],
  );
  return (
    <SiteDataContext.Provider value={value}>
      {children}
      <UploadLayer queue={SANCTUARY_QUEUE} />
    </SiteDataContext.Provider>
  );
};

export { SiteDataProvider };
