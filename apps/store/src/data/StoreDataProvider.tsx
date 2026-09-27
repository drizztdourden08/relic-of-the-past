/* @layer store-site @kind component */
/** Loads the catalogue and the player's publications once for the signed-in frame, and runs pack uploads. */
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useUploads } from '@site-kit/upload/useUploads';
import { useCatalog } from '../catalog/useCatalog';
import { usePublications } from '../publications/usePublications';
import { STORE_UPLOADER } from '../upload/store-uploader';
import { StoreDataContext } from './store-data-context';
import type { StoreData } from './store-data-context';

type StoreDataProviderProps = { children: ReactNode };

const StoreDataProvider = (props: StoreDataProviderProps) => {
  const { children } = props;
  const catalog = useCatalog();
  const publications = usePublications();
  const uploads = useUploads(STORE_UPLOADER, publications.upsert);
  const value = useMemo<StoreData>(
    () => ({ catalog, publications, uploads, onItem: publications.upsert }),
    [catalog, publications, uploads],
  );
  return <StoreDataContext.Provider value={value}>{children}</StoreDataContext.Provider>;
};

export { StoreDataProvider };
