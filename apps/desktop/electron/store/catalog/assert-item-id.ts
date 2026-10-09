/* @layer electron-main @kind logic */
import { isStoreDocId } from '@shared/store/deep-link';

const assertItemId = (itemId: unknown): string => {
  if (typeof itemId !== 'string' || !isStoreDocId(itemId)) throw new Error('That is not a Hookshop item.');
  return itemId;
};

export { assertItemId };
