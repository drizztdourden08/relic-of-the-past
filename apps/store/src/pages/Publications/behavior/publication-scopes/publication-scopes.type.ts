/* @layer store-site @kind types */
import type { StoreItem } from '@rotp/hub-contracts';

type ItemPredicate = (item: StoreItem) => boolean;

export type { ItemPredicate };
