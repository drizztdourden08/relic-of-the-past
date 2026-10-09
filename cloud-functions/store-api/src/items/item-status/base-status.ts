/* @layer store-api @kind logic */
import type { ItemStatus } from '../../../../../shared/store/types';
import { hasWaitingVersion } from './has-waiting-version';
import type { StatusInput } from './item-status.type';

const baseStatus = (item: StatusInput): ItemStatus => {
  if (item.liveVersion !== null) return 'published';
  return hasWaitingVersion(item) ? 'waiting' : 'draft';
};

export { baseStatus };
