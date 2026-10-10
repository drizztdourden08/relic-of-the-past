/* @layer store-site @kind types */
import type { StoreItem } from '@rotp/hub-contracts';
import type { Catalog } from '../../catalog/catalog.type';
import type { Publications } from '../../publications/publications.type';
import type { StoreQueue } from '../../upload/store-queue/store-queue.type';

type StoreData = {
  catalog: Catalog;
  publications: Publications;
  uploads: StoreQueue;
  onItem: (item: StoreItem) => void;
};

export type { StoreData };
