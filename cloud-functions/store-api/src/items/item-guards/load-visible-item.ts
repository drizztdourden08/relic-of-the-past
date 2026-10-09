/* @layer store-api @kind logic */
import type { StoreItem } from '../../../../../shared/store/types';
import { notFound } from '../../../../hub-core/http/http-error';
import { canView } from '../project-item';
import type { Viewer } from '../project-item';
import { loadItem } from './load-item';

const loadVisibleItem = async (id: string, viewer: Viewer): Promise<StoreItem> => {
  const item = await loadItem(id);
  if (!canView(item, viewer)) throw notFound('No such item.');
  return item;
};

export { loadVisibleItem };
