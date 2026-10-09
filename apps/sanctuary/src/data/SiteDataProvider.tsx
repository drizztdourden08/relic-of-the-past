/* @layer sanctuary-site @kind component */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSessionContext, UploadLayer } from '@rotp/design';
import { canSeeReports } from '@rotp/hub-contracts';
import { useFiles } from '../files/useFiles';
import { useReports } from '../reports/useReports';
import { sanctuaryQueue } from '../upload/sanctuary-queue';
import { SiteDataContext } from './site-data-context';
import type { ListSurface, SiteData } from './site-data-context.type';
import { INITIAL_SCOPES } from './SiteDataProvider.constants';
import type { SiteDataProviderProps } from './SiteDataProvider.type';

const SiteDataProvider = (props: SiteDataProviderProps) => {
  const { children } = props;
  const { rights } = useSessionContext();
  const files = useFiles();
  const reports = useReports(canSeeReports(rights));
  const { upsert } = files;
  useEffect(() => sanctuaryQueue.onRecord(upsert), [upsert]);
  const [scopes, setScopes] = useState(INITIAL_SCOPES);
  const setScope = useCallback((surface: ListSurface, scopeId: string) => {
    setScopes((current) => (current[surface] === scopeId ? current : { ...current, [surface]: scopeId }));
  }, []);

  const value = useMemo<SiteData>(
    () => ({ files, reports, uploads: sanctuaryQueue, scopes, setScope }),
    [files, reports, scopes, setScope],
  );
  return (
    <SiteDataContext.Provider value={value}>
      {children}
      <UploadLayer queue={sanctuaryQueue} />
    </SiteDataContext.Provider>
  );
};

export { SiteDataProvider };
