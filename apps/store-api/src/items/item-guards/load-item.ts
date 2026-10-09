/* @layer store-api @kind logic */
import type { StoreItem } from '@rotp/hub-contracts';
import { notFound } from '@rotp/hub-server';
import { itemsRepo } from '../../db/items-repo';

const loadItem = async (id: string): Promise<StoreItem> => {
  const item = await itemsRepo.get(id);
  if (!item) throw notFound('No such item.');
  return item;
};

export { loadItem };
