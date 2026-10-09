/* @layer renderer-components @kind logic */
import type { ItemResponse } from '@shared/store/api-types';
import type { InstalledPack } from '@shared/store/installed-types';
import { liveVersionOf } from './item-facts';

const liveUpdate = (pack: InstalledPack | null, detail: ItemResponse | null): boolean => {
  const live = detail ? liveVersionOf(detail.item) : null;
  return pack !== null && live !== null && live.semver !== pack.semver;
};

export { liveUpdate };
