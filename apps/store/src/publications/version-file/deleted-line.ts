/* @layer store-site @kind logic */
import { formatDate } from '@drizztdourden08/tessera/primitives';
import type { FileRemoval, StoreItem } from '@rotp/hub-contracts';

const deletedLine = (item: StoreItem, { at, by }: FileRemoval): string => {
  const who = by === null ? '' : ` by ${by.userId === item.author.userId ? 'you' : by.displayName}`;
  return `deleted${who}, ${formatDate(at, 'iso', { length: 'short' })}`;
};

export { deletedLine };
