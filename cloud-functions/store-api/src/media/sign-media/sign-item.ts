/* @layer store-api @kind logic */
import type { StoreItem } from '../../../../../shared/store/types';
import { signEdit } from './sign-edit';
import { signRef } from './sign-ref';

const signItem = async (item: StoreItem): Promise<StoreItem> => {
  const [card, banner, listingEdits] = await Promise.all([
    signRef(item.card),
    signRef(item.banner),
    Promise.all(item.listingEdits.map(signEdit)),
  ]);
  return { ...item, card, banner, listingEdits };
};

export { signItem };
