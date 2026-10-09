/* @layer store-api @kind logic */
import type { StoreItem } from '../../../../../shared/store/types';
import { signItem } from './sign-item';

const signItems = (items: StoreItem[]): Promise<StoreItem[]> => Promise.all(items.map(signItem));

export { signItems };
