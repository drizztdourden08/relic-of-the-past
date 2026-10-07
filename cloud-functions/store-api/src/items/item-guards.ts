/* @layer store-api @kind logic */
/** The checks item routes repeat: the record exists, the caller may see it, and for the
 *  author routes the caller wrote it. An item the caller may not see answers as missing. */
import type { StoreItem } from '../../../../shared/store/types';
import { forbidden, notFound } from '../../../hub-core/http/http-error';
import { itemsRepo } from '../db/items-repo';
import { canView, isAuthor } from './project-item';
import type { Viewer } from './project-item';

const loadItem = async (id: string): Promise<StoreItem> => {
  const item = await itemsRepo.get(id);
  if (!item) throw notFound('No such item.');
  return item;
};

const loadVisibleItem = async (id: string, viewer: Viewer): Promise<StoreItem> => {
  const item = await loadItem(id);
  if (!canView(item, viewer)) throw notFound('No such item.');
  return item;
};

const loadOwnItem = async (id: string, viewer: Viewer): Promise<StoreItem> => {
  const item = await loadVisibleItem(id, viewer);
  if (!isAuthor(item, viewer)) throw forbidden('Only the author can do that.');
  return item;
};

export { loadItem, loadVisibleItem, loadOwnItem };
