/* @layer store-api @kind logic */
import type { StoreItem } from '@rotp/hub-contracts';
import { signItem } from './sign-item';

const signItems = (items: StoreItem[]): Promise<StoreItem[]> => Promise.all(items.map(signItem));

export { signItems };
