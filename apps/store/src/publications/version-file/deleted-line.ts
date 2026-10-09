/* @layer store-site @kind logic */
import type { FileRemoval, StoreItem } from '@rotp/hub-contracts';
import { formatDay } from '@rotp/hub-client';

const deletedLine = (item: StoreItem, { at, by }: FileRemoval): string => {
  const who = by === null ? '' : ` by ${by.userId === item.author.userId ? 'you' : by.displayName}`;
  return `deleted${who}, ${formatDay(at)}`;
};

export { deletedLine };
