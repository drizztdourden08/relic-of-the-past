/* @layer shared-store @kind logic */
import type { StoreItem } from '../types';
import { KIND_FOLDER, PREFIX } from './keys.constants';

const itemFolders = (item: Pick<StoreItem, 'id' | 'kind'>): string[] => [
  `${PREFIX.packs}${KIND_FOLDER[item.kind]}/${item.id}/`,
  `${PREFIX.media}${item.id}/`,
];

export { itemFolders };
