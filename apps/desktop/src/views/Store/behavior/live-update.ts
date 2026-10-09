/* @layer renderer-components @kind logic */
import type { ItemResponse, InstalledPack } from '@rotp/hub-contracts';
import { liveVersionOf } from './item-facts';

const liveUpdate = (pack: InstalledPack | null, detail: ItemResponse | null): boolean => {
  const live = detail ? liveVersionOf(detail.item) : null;
  return pack !== null && live !== null && live.semver !== pack.semver;
};

export { liveUpdate };
