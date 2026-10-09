/* @layer store-api @kind types */
import type { StoreItem } from '../../../../shared/store/types';

type StoredItem = StoreItem & { awaitingReview: boolean };
type ItemPatch = Partial<Omit<StoreItem, 'id' | 'kind' | 'author' | 'createdAt'>>;
type ItemChange = (item: StoreItem) => ItemPatch;
type ItemPage = { items: StoreItem[]; nextCursor: string | null };
type ShelfField = 'stats.installs30d' | 'stats.score' | 'updatedAt';

export type { StoredItem, ItemPatch, ItemChange, ItemPage, ShelfField };
