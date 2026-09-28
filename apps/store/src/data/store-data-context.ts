/* @layer store-site @kind logic */
/**
 * The signed-in site's shared data: the catalogue, the player's own publications and the
 * store's upload queue, loaded once by the frame. Pages and the search read the same
 * lists, and an upload keeps going while the player moves between pages.
 */
import { createContext, useContext } from 'react';
import type { StoreItem } from '@shared/store/types';
import type { Catalog } from '../catalog/useCatalog';
import type { Publications } from '../publications/usePublications';
import type { StoreQueue } from '../upload/store-queue';

type StoreData = {
  catalog: Catalog;
  publications: Publications;
  /** The one upload queue; read its jobs with useUploadQueue. */
  uploads: StoreQueue;
  /** Hands an item the API answered with to every list that holds it. */
  onItem: (item: StoreItem) => void;
};

const StoreDataContext = createContext<StoreData | null>(null);

const useStoreData = (): StoreData => {
  const data = useContext(StoreDataContext);
  if (!data) throw new Error('useStoreData: no StoreDataProvider above');
  return data;
};

export { StoreDataContext, useStoreData };
export type { StoreData };
