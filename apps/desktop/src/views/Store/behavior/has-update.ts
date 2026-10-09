/* @layer renderer-components @kind logic */
import type { InstalledPack, ItemCardView } from '@rotp/hub-contracts';

const hasUpdate = (pack: InstalledPack, item: ItemCardView | null): boolean =>
  item !== null && item.semver !== null && item.semver !== pack.semver;

export { hasUpdate };
