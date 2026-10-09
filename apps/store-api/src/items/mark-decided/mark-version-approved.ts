/* @layer store-api @kind logic */
import type { StoreItem } from '@rotp/hub-contracts';
import type { ItemPatch } from '../../db/items-repo.type';
import { moveVersion } from '../move-version';
import { REVIEWER } from './mark-decided.constants';
import type { Decided } from './mark-decided.type';

const markVersionApproved = (item: StoreItem, n: number, packKey: string, decided: Decided): ItemPatch => {
  const { by, note, at } = decided;
  const moved = moveVersion(item, {
    n,
    action: 'approve',
    actors: REVIEWER,
    reshape: (version, to) => ({ ...version, packKey, review: { ...version.review, state: to, by, note, decidedAt: at } }),
  });
  return { ...moved, publishedAt: item.publishedAt ?? at, updatedAt: at };
};

export { markVersionApproved };
