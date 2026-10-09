/* @layer store-api @kind logic */
import type { StoreItem } from '../../../../../shared/store/types';
import { notFound } from '../../../../hub-core/http/http-error';
import { itemsRepo } from '../../db/items-repo';

const loadItem = async (id: string): Promise<StoreItem> => {
  const item = await itemsRepo.get(id);
  if (!item) throw notFound('No such item.');
  return item;
};

export { loadItem };
