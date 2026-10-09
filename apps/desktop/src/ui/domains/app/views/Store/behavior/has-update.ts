/* @layer renderer-components @kind logic */
import type { InstalledPack } from '@rotp/hub-contracts';
import type { ItemCardView } from '@rotp/hub-contracts';

const hasUpdate = (pack: InstalledPack, item: ItemCardView | null): boolean =>
  item !== null && item.semver !== null && item.semver !== pack.semver;

export { hasUpdate };
