/* @layer store-site @kind component */
import { useEffect, useMemo } from 'react';
import { UploadLayer } from '@rotp/design';
import { useCatalog } from '../catalog/useCatalog';
import { usePublications } from '../publications/usePublications';
import { STORE_QUEUE } from '../upload/store-queue/store-queue.constants';
import { StoreDataContext } from './store-data-context/store-data-context';
import type { StoreData } from './store-data-context/store-data-context.type';
import type { StoreDataProviderProps } from './StoreDataProvider.type';

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
