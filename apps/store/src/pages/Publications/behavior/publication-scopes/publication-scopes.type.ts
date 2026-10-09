/* @layer store-site @kind types */
import type { StoreItem } from '@shared/store/types';

type ItemPredicate = (item: StoreItem) => boolean;

export type { ItemPredicate };
