/* @layer store-api @kind logic */
import type { StoreItem } from '@rotp/hub-contracts';
import type { ItemPatch } from '../../db/items-repo.type';
import { moveVersion } from '../move-version';
import { REVIEWER } from './mark-decided.constants';
import type { Decided } from './mark-decided.type';

const markVersionRejected = (item: StoreItem, n: number, decided: Decided): ItemPatch => {
  const { by, note, at } = decided;
  return moveVersion(item, {
    n,
    action: 'reject',
    actors: REVIEWER,
    reshape: (version, to) => ({ ...version, review: { ...version.review, state: to, by, note, decidedAt: at } }),
  });
};

export { markVersionRejected };
