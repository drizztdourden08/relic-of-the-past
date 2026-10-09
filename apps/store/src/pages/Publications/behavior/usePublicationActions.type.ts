/* @layer store-site @kind types */
import type { StoreItem } from '@rotp/hub-contracts';
import type { usePublicationActions } from './usePublicationActions';

type ItemChange = (itemId: string, n: number) => Promise<{ item: StoreItem }>;

type PublicationActions = ReturnType<typeof usePublicationActions>;

export type { ItemChange, PublicationActions };
