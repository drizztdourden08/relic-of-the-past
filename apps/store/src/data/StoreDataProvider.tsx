/* @layer store-site @kind component */
/**
 * Loads the catalogue and the player's publications once for the signed-in frame, and
 * mounts the upload tray and dialog over every page. Every item an upload step answers
 * with reaches the publications list.
 */
import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { UploadLayer } from '@site-kit/components/UploadLayer';
import { useCatalog } from '../catalog/useCatalog';
import { usePublications } from '../publications/usePublications';
import { STORE_QUEUE } from '../upload/store-queue';
import { StoreDataContext } from './store-data-context';
import type { StoreData } from './store-data-context';

type StoreDataProviderProps = { children: ReactNode };

const StoreDataProvider = (props: StoreDataProviderProps) => {
  const { children } = props;
  const catalog = useCatalog();
  const publications = usePublications();
  const { upsert } = publications;
  useEffect(() => STORE_QUEUE.onRecord(upsert), [upsert]);
  const value = useMemo<StoreData>(
    () => ({ catalog, publications, uploads: STORE_QUEUE, onItem: upsert }),
    [catalog, publications, upsert],
  );
  return (
    <StoreDataContext.Provider value={value}>
      {children}
      <UploadLayer queue={STORE_QUEUE} />
    </StoreDataContext.Provider>
  );
};

export { StoreDataProvider };
