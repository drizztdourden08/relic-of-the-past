/* @layer store-site @kind types */
import type { StoreItem } from '@shared/store/types';
import type { Catalog } from '../../catalog/useCatalog.type';
import type { Publications } from '../../publications/usePublications.type';
import type { StoreQueue } from '../../upload/store-queue/store-queue.type';

type StoreData = {
  catalog: Catalog;
  publications: Publications;
  uploads: StoreQueue;
  onItem: (item: StoreItem) => void;
};

export type { StoreData };
