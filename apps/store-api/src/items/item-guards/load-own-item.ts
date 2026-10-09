/* @layer store-api @kind logic */
import type { StoreItem } from '@rotp/hub-contracts';
import { forbidden } from '@rotp/hub-server';
import { isAuthor } from '../project-item';
import type { Viewer } from '../project-item';
import { loadVisibleItem } from './load-visible-item';

const loadOwnItem = async (id: string, viewer: Viewer): Promise<StoreItem> => {
  const item = await loadVisibleItem(id, viewer);
  if (!isAuthor(item, viewer)) throw forbidden('Only the author can do that.');
  return item;
};

export { loadOwnItem };
